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
    var tab_view_Sortie = $("#tab_view_Sortie").DataTable();
    

    //init Map of "key","value"
    var mapMed = new Map();
    var mapEntree = new Map();
    var mapSortie = new Map();

    async function populateTabMed(){
      var tab_stock = [];
      //Entree
      await mapEntree.clear();
      await Entree.find({},{sort:'-date'}).then( function(foundEntree) {
        foundEntree.forEach(function(foundSingleEntree) {
          //populate the Map of formr
          mapEntree.set(foundSingleEntree.id_medicament, foundSingleEntree.qt); 
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

      Medicament.find({},{sort:'-stock'}).then(function(foundMed) {
        i = 0;
        foundMed.forEach(function(foundSingleMed) {
          i++;
          
          //get the real name of categorie by uising its _id
          //var _nom_forme = mapForme.has(foundSingleMed.id_forme)? mapForme.get(foundSingleMed.id_forme):"";
          //var _nom_cat = "OK";
          var qt_entree = mapEntree.has(foundSingleMed._id) ? mapEntree.get(foundSingleMed._id) : 0 ;
          


          
          //_id_forme = (foundSingleMed.id_forme != undefined ) ? foundSingleMed.id_forme : "";
          //_id_categorie =(foundSingleMed.id_categorie != undefined ) ? foundSingleMed.id_categorie : "";
          //Put the result recursivelly inside the medicament's table
          var stock = foundSingleMed.stock;
          var localSingleMed = [i, foundSingleMed.nom_medicament, stock, "date", foundSingleMed._id]; 
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
              "targets": [ 4 ],
              "visible": false,
              "searchable": false
            },
          ],
          destroy:true
        });
        
        _tab_stock.on( 'select ', function () {
          // var selectedRows = _tab_stock.rows( { selected: true } ).count();
          // console.log("ok: "+selectedRows)

          console.log(
            'Row data: '+
            JSON.stringify( _tab_stock.row( { selected: true } ).data() )
          );

          
          $("#EntreeSortieStockModal").modal();
          
          //_tab_stock.button( 1 ).enable( selectedRows === 1 );
          //_tab_stock.button( 2 ).enable( selectedRows === 1 );
        });
      });
    }

     //Function populate tab medicament
    async function populateTabEntree(){
      var tab_entree = [];
      await mapMed.clear();
      await Medicament.find({},{sort:'nom_medicament'}).then( function(foundMed) {
        foundMed.forEach( function(foundSingleMed) {
          //populate the Map of formr
          mapMed.set(foundSingleMed._id, foundSingleMed.nom_medicament); 
        });
      });
      // Sorts by date in descending order 
      await Entree.find({},{sort:'-date_'}).then(function(foundEntree) {
        i = 0;

        foundEntree.forEach(async function(foundSingleEntree) {
          i++;
          
          var _nom_med =  mapMed.has(foundSingleEntree.id_medicament)? mapMed.get(foundSingleEntree.id_medicament):" - ";
          var dateString = new Date( foundSingleEntree.date_).toISOString().split("T")[0];

          //Put the result recursivelly inside the medicament's table
          var localSingleMed = [i, _nom_med,foundSingleEntree.qt, dateString ,foundSingleEntree._id,foundSingleEntree.id_medicament ]; 
          tab_entree.push(Array.from(localSingleMed))
        });

        //_tab_entree.DataTable({
        _tab_entree =  $('#tab_entree').DataTable({
          dom: 'Blfrtip',
          select: true,
          buttons: [
            {
              text: '<li class="'+json.buttons.new.icon+'"></li> '+json.buttons.new.name,
              action: function ( e, dt, node, config ) {
                addValueModalEntree()
                $("#AddEntreeModal").modal();
              }
            },
            {
              text: '<li class="'+json.buttons.edit.icon+'"></li> '+json.buttons.edit.name,
              action: function ( e, dt, node, config ) {
                  console.log(
                      'Row data: '+
                      JSON.stringify( dt.row( { selected: true } ).data() )
                  ); 
                  //qt_entree,_id, _id_med
                  updateValueModalEntree(dt.row( { selected: true } ).data()[2], dt.row( { selected: true } ).data()[4],
                    dt.row( { selected: true } ).data()[5]);

                  $("#AddEntreeModal").modal();
              },
              enabled: false
            },
            {
              text: '<li class="tetx-danger '+json.buttons.del.icon+'"></li> '+json.buttons.del.name,
              action: function ( e, dt, node, config ) {
                  console.log(
                      'Row data: '+
                      JSON.stringify( dt.row( { selected: true } ).data() )
                  );
                  delValueModalEntree(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[4],
                  dt.row( { selected: true } ).data()[3], dt.row( { selected: true } ).data()[2]);
                  $("#SuppEntreeModal").modal();
              },
              enabled: false
            },
            {
              extend:    'csv',
              text:      '<i class="'+json.buttons.export.icon+'"></i> '+json.buttons.export.name,
              titleAttr: 'CSV',
              filename: json.entree.file_name,
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
          data: tab_entree,
          // On affiche pas la troisieme colonne, elle reprend les _id
          "columnDefs": [
            {
              "targets": [ 4, 5 ],
              "visible": false,
              "searchable": false
            },
          ],
          destroy:true
        });
        
        _tab_entree.on( 'select deselect', function () {
          var selectedRows = _tab_entree.rows( { selected: true } ).count();
          console.log("ok: "+selectedRows)
          _tab_entree.button( 1 ).enable( selectedRows === 1 );
          _tab_entree.button( 2 ).enable( selectedRows === 1 );
        });
      });
    }

    $("#button-stock").click(function(){
      console.log("stock ") 
    });
  });