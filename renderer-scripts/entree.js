$(document).ready(function() {
    //Data tables modules
    var $ = require( 'jquery' );
    require( 'jszip' );
    require( 'pdfmake' );
    require( 'datatables.net-dt' )( window, $ );
    require( 'datatables.net-buttons-dt' )( window, $ );
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
      populateSelectMed();
      populateTabEntree();
    });
    
    // Declare all my databases classes
    const Medicament =  require('../data/Medicament');
    const Entree =  require('../data/Entree');

    var listMed =  $("#design_entree");
   
    //Init tables
    //var _tab_entree = $("#tab_entree").DataTable();

    //init Map of "key","value"
    var mapMed = new Map();

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
                  delValueModalMed(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[4]);
                  $("#SuppEntreeModal").modal(); 
              },
              enabled: false
            },
            //'copy', 'csv', 'excel', 'pdf', 'print', "colvis"
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

    //Populate categorie SELECTPICKERS
    function populateSelectMed(){
      
      Medicament.find({},{sort:'nom_medicament'}).then(function(foundMed) {
        i = 0;
        //remove all oprion before adding new
        listMed.children().remove();
        listMed.children().empty();

        foundMed.forEach(function(foundSingleMed) {
          i++;
          listMed.append('<option value="' + foundSingleMed._id + '">' + foundSingleMed.nom_medicament + '</option>');
        });
        listMed.selectpicker();
        listMed.selectpicker('refresh');
      });
    }

    //Save Entree
    $("#save_entree").click(function(){
      var _entree = $("#design_entree").children("option:selected").val();
      var qt_entree = $("#qt_entree").val();
      var entree = Entree.create({
        id_medicament: _entree,
        qt:parseInt(qt_entree, 10)
      });
      //Enregistrer la forme dans la BD
      entree.save().then(function(addedEntree) {
        $("#design_entree").val("");
        console.log(addedEntree._id);
        //Close programmaticaly the modal
        $("#AddEntreeModal .close").click();
        populateTabEntree();
        //populateSelectMed();
        $("#design_entree").val("");
      });
      //After saving forme
      $("#design_entree").val("");
    })

     //Function, update values before adding medicament
     function updateValueModalEntree(qt_entree,_id, _id_med){
      $("#update_entree").css("display","block");
      $("#save_entree").css("display","none");
      $(".entree-modal-title").text(json.entree.edit);
      $(".entree-modal-title").css("color","#a11");
      //$("#design_forme").click();
      $("#qt_entree").val(qt_entree);
      $("#_id_design_entree").val(_id);

      //Choose the selected values
      populateSelectEntreeUpdate(_id_med);
      
      //Find is-filled is-focused
      $("#AddEntreeModal").find(".form-group").addClass("has-danger is-filled is-focused");
    }

    function addValueModalEntree(){
      $("#update_entree").css("display","none");
      $("#save_entree").css("display","block");
      $(".entree-modal-title").text(json.entree.add);
      $(".entree-modal-title").css("color","#000");
      $("#AddEntreeModal").find(".form-group").removeClass("has-danger is-filled is-focused");
      $("#design_entree").val("");
      $("#_id_design_entree").val("");
      $("#qt_entree").val("");

      populateSelectEntreeUpdate("");
    }

    //Update medicament
    $("#update_entree").click(function(){
      var med_entree = $("#design_entree").children("option:selected").val();
      var qt_entree = $("#qt_entree").val();
      var _id_design_entree = $("#_id_design_entree").val();
      Entree.findOneAndUpdate({_id:_id_design_entree},{id_medicament: med_entree,qt:parseInt(qt_entree, 10)},{upsert: true}).then(function(updatedEntree) {
        console.log("_id = ", updatedEntree._id)
        populateTabEntree();
        $("#AddEntreeModal .close").click();
      }); 
    });

    //Populate med SELECTPICKERS
    function populateSelectEntreeUpdate(_id_med){
      
      Medicament.find({},{sort:'nom_medicament'}).then(function(foundMed) {
        i = 0;
        //remove all oprion before adding new
        listMed.children().remove();
        listMed.children().empty();

        foundMed.forEach(function(foundSingleMed) {
          i++;
          listMed.append('<option value="' + foundSingleMed._id + '">' + foundSingleMed.nom_medicament + '</option>');
        });
        listMed.val(_id_med).change();
        listMed.selectpicker();
        listMed.selectpicker('refresh');
      });
    }



    $("#button-entree").click(function(){
      console.log("entree ") 
    });
  });