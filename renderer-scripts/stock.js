$(document).ready(function() {
    //Data tables modules
    var $ = require( 'jquery' );
    require( 'jszip' );
    require( 'pdfmake' );
    require( 'datatables.net-dt' )( window, $ );
    require( 'datatables.net-buttons-dt' )( window, $ );
    require( 'datatables.net-colreorder-dt' )( window, $ );
    require( 'datatables.net-responsive-dt' )( window, $ );
    require( 'datatables.net-buttons/js/buttons.colVis.js' )( window, $ );
    require( 'datatables.net-buttons/js/buttons.html5.js' )( window, $ );
    require( 'datatables.net-buttons/js/buttons.print.js' )( window, $ );
    require( 'datatables.net-select-dt' )( window, $ );

    //import tje JSON file
    const json = require("./../assets/values/String.json");

    //require('jquery-csv/src/jquery.csv.js');
    var _csv = require('jquery-csv');

    // Getting path
    // Import ES6 way
    // import { rootPath } from 'electron-root-path';

    // Import ES2015 way
    const rootPath = require('electron-root-path').rootPath;
    /*
      // e.g:
      // read a file in the root
      const location = path.join(rootPath, 'package.json');
      const pkgInfo = fs.readFileSync(location, { encoding: 'utf8' });
    */
    //Connection to DB
    var connect = require('camo').connect;
    var database;
    //var uri = 'nedb://memory';
    var uri = 'nedb://'+rootPath+'/data/.db';

    connect(uri).then( function(db) {
      database = db;
      //populateSelectMed();
      //populateTabEntree();
      populateTabMed();
    });
    
    // Declare all my databases classes
    const Medicament =  require('../data/Medicament');
    const Entree =  require('../data/Entree');
    const Sortie =  require('../data/Sortie');

    //var listMed =  $("#design_entree");
   
    //Init tables
    var tab_view_Entree = $("#tab_view_Entree").DataTable();

    var tab_view_Sortie = $("#tab_view_Sortie").DataTable({
      "footerCallback": function ( row, data, start, end, display ) {
            var api = this.api(), data;
    
            // Remove the formatting to get integer data for summation
            var intVal = function ( i ) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '')*1 :
                    typeof i === 'number' ?
                        i : 0;
            };
    
            // Total over all pages
            total = api
                .column( 2 )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0 );
    
            // Total over this page
            pageTotal = api
                .column( 2, { page: 'current'} )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0 );
    
            // Update footer
            $( api.column( 2 ).footer() ).html(
                '$'+pageTotal +' ( $'+ total +' total)'
            );
          }
    });
    
    //init Map of "key","value"
    var mapMed = new Map();
    var mapEntree = new Map();
    var mapSortie = new Map();

    async function populateTabMed(){
      var tab_stock = [];
      var tab_stock_Entree = [];
      //Entree
      await mapEntree.clear();
      await Entree.find({},{sort:'-date'}).then( function(foundEntree) {
        foundEntree.forEach(function(foundSingleEntree) {
          //populate the Map of formr
          mapEntree.set(foundSingleEntree.id_medicament, foundSingleEntree.qt);
          var localSameEntree = [foundSingleEntree.id_medicament, foundSingleEntree.qt, foundSingleEntree.date_]; 
          tab_stock_Entree.push(Array.from(localSameEntree))
        });
      });

      //Sorte
      await mapSortie.clear();
      await Sortie.find({},{sort:'-date'}).then( function(foundSortie) {
        foundSortie.forEach(function(foundSingleSortie) {
          //populate the Map of formr
          mapSortie.set(foundSingleSortie.id_medicament, foundSingleSortie.qt); 
        });
      });

      Medicament.find({},{sort:'nom_medicament'}).then(function(foundMed) {
        i = 0;
        foundMed.forEach(function(foundSingleMed) {
          i++;
          
          //get all qt by med_id
          var filterQt_entree = tab_stock_Entree.filter((item) => item[0] == foundSingleMed._id );
          
          //var qt_entree = mapEntree.has(foundSingleMed._id) ? mapEntree.get(foundSingleMed._id) : 0 ;
          var qt_entree = filterQt_entree.reduce((key, val) => val[1] + key, 0);
          console.log("qt_entree: ",qt_entree)
    
          //Put the result recursivelly inside the medicament's table
          //var stock = foundSingleMed.stock + qt_entree;
          var localSingleMed = [i, foundSingleMed.nom_medicament, qt_entree, foundSingleMed._id]; 
          tab_stock.push(Array.from(localSingleMed))
        });

        //console.log("Here ",Array.from(tab_stock))
        //_tab_stock.DataTable({
        _tab_stock =  $('#tab_stock').DataTable({
          dom: 'Blfrtip',
          //select: true,
          select: {
            style: 'single'
          },
          colReorder: true,
          responsive: true,
          // "sDom": 'C<"clear">lfrtip',
          // "oColVis": {
          //   "buttonText": "Change columns"
          // },
          buttons: [
            {
              extend:    'csv',
              text:      '<i class="'+json.buttons.export.icon+'"></i> '+json.buttons.export.name,
              titleAttr: 'CSV',
              filename: json.stock.file_name,
              exportOptions: {
                columns: [1, 2, 3]
              },
            }                  
          ],
          // ICI on choisi la langue des details du tableau
          language:{
            url:'./assets/values/French.json'
          },
          //"order": [[ 0, "asc" ]],
          // Les donnees sont affichees dans le tableau HTML
          data:tab_stock,
          // On affiche pas la troisieme colonne, elle reprend les _id
          "columnDefs": [
            {
              "targets": [ 3 ],
              "visible": false,
              "searchable": false
            },
          ],
          destroy:true
        });
        
        _tab_stock.on( 'select ', function () {
         
          console.log(
            'Row data: '+
            JSON.stringify( _tab_stock.row( { selected: true } ).data() )
          );
          var filterQt_entree = tab_stock_Entree.filter((item) => item[0] == _tab_stock.row( { selected: true } ).data()[3]);

          var tab_qt_entree = [];
          var i = 0;
          filterQt_entree.forEach(function(foundQtEntree){
            i++;
            var dateString = new Date( foundQtEntree[2]).toISOString().split("T")[0];

            //Put the result recursivelly inside the entree's table
            var localSingleEntree = [i, dateString, foundQtEntree[1]]; 
            tab_qt_entree.push(Array.from(localSingleEntree))
          })

          tab_view_Entree =  $('#tab_view_Entree').DataTable({
            // ICI on choisi la langue des details du tableau
            language:{
              url:'./assets/values/French.json'
            },
            // Les donnees sont affichees dans le tableau HTML
            data: tab_qt_entree,
            destroy:true,
            "footerCallback": function ( row, data, start, end, display ) {
              var api = this.api(), data;
   
              // Remove the formatting to get integer data for summation
              var intVal = function ( i ) {
                  return typeof i === 'string' ?
                      i.replace(/[\$,]/g, '')*1 :
                      typeof i === 'number' ?
                          i : 0;
              };
   
              // Total over all pages
              total = api
                  .column( 2 )
                  .data()
                  .reduce( function (a, b) {
                      return intVal(a) + intVal(b);
                  }, 0 );
   
              // Total over this page
              pageTotal = api
                  .column( 2, { page: 'current'} )
                  .data()
                  .reduce( function (a, b) {
                      return intVal(a) + intVal(b);
                  }, 0 );
   
              // Update footer
              $( api.column( 2 ).footer() ).html(
                  ''+pageTotal +' ( '+ total +' total )'
              );
            }
          });

        
          

          // var column = tab_view_Entree.column( 0 );
 
          // $( column.footer() ).html(
          //     column.data().reduce( function (a,b) {
          //       console.log("Footer: ",a)
          //         return a+b;
          //     })
          // );
          
          $("#EntreeSortieStockModal").modal();
          
        });
      });
    }

     

    $("#button-stock").click(function(){
      console.log("stock ") 
    });
  });