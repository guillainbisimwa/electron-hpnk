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
      populateTabSortie();
    });
    
    // Declare all my databases classes
    const Medicament =  require('../data/Medicament');
    const Sortie =  require('../data/Sortie');

    var listMed =  $("#design_sortie");
   
    //Init tables
    //var _tab_sortie = $("#tab_sortie").DataTable();

    //init Map of "key","value"
    var mapMed = new Map();

     //Function populate tab medicament
    async function populateTabSortie(){
      var tab_sortie = [];
      await mapMed.clear();
      await Medicament.find({},{sort:'nom_medicament'}).then( function(foundMed) {
        foundMed.forEach( function(foundSingleMed) {
          //populate the Map of formr
          mapMed.set(foundSingleMed._id, foundSingleMed.nom_medicament); 
        });
      });
      // Sorts by date in descending order 
      await Sortie.find({},{sort:'-date_'}).then(function(foundSortie) {
        i = 0;

        foundSortie.forEach(async function(foundSingleSortie) {
          i++;
          
          var _nom_med =  mapMed.has(foundSingleSortie.id_medicament)? mapMed.get(foundSingleSortie.id_medicament):" - ";
          var dateString = new Date( foundSingleSortie.date_).toISOString().split("T")[0];

          //Put the result recursivelly inside the medicament's table
          var localSingleMed = [i, _nom_med,foundSingleSortie.qt, dateString ,foundSingleSortie._id,foundSingleSortie.id_medicament ]; 
          tab_sortie.push(Array.from(localSingleMed))
        });

        //_tab_sortie.DataTable({
        _tab_sortie =  $('#tab_sortie').DataTable({
          dom: 'Blfrtip',
          select: true,
          buttons: [
            {
              text: '<li class="'+json.buttons.new.icon+'"></li> '+json.buttons.new.name,
              action: function ( e, dt, node, config ) {
                addValueModalSortie()
                $("#AddSortieModal").modal();
              }
            },
            {
              text: '<li class="'+json.buttons.edit.icon+'"></li> '+json.buttons.edit.name,
              action: function ( e, dt, node, config ) {
                  console.log(
                      'Row data: '+
                      JSON.stringify( dt.row( { selected: true } ).data() )
                  ); 
                  updateValueModalSortie(dt.row( { selected: true } ).data()[2], dt.row( { selected: true } ).data()[4],
                    dt.row( { selected: true } ).data()[5]);

                  $("#AddSortieModal").modal();
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
                  delValueModalSortie(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[4],
                  dt.row( { selected: true } ).data()[3], dt.row( { selected: true } ).data()[2]);
                  $("#SuppSortieModal").modal();
              },
              enabled: false
            },
            {
              extend:    'csv',
              text:      '<i class="'+json.buttons.export.icon+'"></i> '+json.buttons.export.name,
              titleAttr: 'CSV',
              filename: json.sortie.file_name,
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
          data: tab_sortie,
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
        
        _tab_sortie.on( 'select deselect', function () {
          var selectedRows = _tab_sortie.rows( { selected: true } ).count();
          console.log("ok: "+selectedRows)
          _tab_sortie.button( 1 ).enable( selectedRows === 1 );
          _tab_sortie.button( 2 ).enable( selectedRows === 1 );
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

    //Save Sortie
    $("#save_sortie").click(function(){
      var _sortie = $("#design_sortie").children("option:selected").val();
      var qt_sortie = $("#qt_sortie").val();
      var sortie = Sortie.create({
        id_medicament: _sortie,
        qt:parseInt(qt_sortie, 10)
      });
      //Enregistrer la forme dans la BD
      sortie.save().then(function(addedSortie) {
        $("#design_sortie").val("");
        console.log(addedSortie._id);
        //Close programmaticaly the modal
        $("#AddSortieModal .close").click();
        populateTabSortie();
        //populateSelectMed();
        $("#design_sortie").val("");
      });
      //After saving forme
      $("#design_sortie").val("");
    })

     //Function, update values before adding medicament
     function updateValueModalSortie(qt_sortie,_id, _id_med){
      $("#update_sortie").css("display","block");
      $("#save_sortie").css("display","none");
      $(".sortie-modal-title").text(json.sortie.edit);
      $(".sortie-modal-title").css("color","#a11");
      //$("#design_forme").click();
      $("#qt_sortie").val(qt_sortie);
      $("#_id_design_sortie").val(_id);

      //Choose the selected values
      populateSelectSortieUpdate(_id_med);
      
      //Find is-filled is-focused
      $("#AddSortieModal").find(".form-group").addClass("has-danger is-filled is-focused");
    }

    function addValueModalSortie(){
      $("#update_sortie").css("display","none");
      $("#save_sortie").css("display","block");
      $(".sortie-modal-title").text(json.sortie.add);
      $(".sortie-modal-title").css("color","#000");
      $("#AddSortieModal").find(".form-group").removeClass("has-danger is-filled is-focused");
      $("#design_sortie").val("");
      $("#_id_design_sortie").val("");
      $("#qt_sortie").val("");

      populateSelectSortieUpdate("");
    }

    //Update medicament
    $("#update_sortie").click(function(){
      var med_sortie = $("#design_sortie").children("option:selected").val();
      var qt_sortie = $("#qt_sortie").val();
      var _id_design_sortie = $("#_id_design_sortie").val();
      Sortie.findOneAndUpdate({_id:_id_design_sortie},{id_medicament: med_sortie,qt:parseInt(qt_sortie, 10)},{upsert: true}).then(function(updatedSortie) {
        console.log("_id = ", updatedSortie._id)
        populateTabSortie();
        $("#AddSortieModal .close").click();
      }); 
    });

    //Populate med SELECTPICKERS
    function populateSelectSortieUpdate(_id_med){
      
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

    //Function, update values before adding Sortie
    function delValueModalSortie(sortie,_id, _date, qt){
      $("#del_design_sortie").text(sortie);
      $("#_id_del_design_sortie").val(_id);
      $(".date_sortie").text(_date);
      $(".qt_sortie_").text(qt);
    }

    function result_del(deletedSortie,deleted_item,modal){
      if(deletedSortie == 0){
        swal({
          title: json.error,
          text: json.error_del_db,
          toast: false,
          buttonsStyling: false,
          confirmButtonClass: "btn btn-danger",
          type: "error",
          //target: document.getElementById('config-section'),
          onBeforeOpen: function () {
            $("#"+modal+" .close").click();
          },
          onOpen: function () {
            //populateTabMed();                
          }
        }).catch(swal.noop)
      }
      else {
        swal({
          title: deleted_item.toUpperCase(),
          text: json.success_del_db,
          toast: false,
          buttonsStyling: false,
          confirmButtonClass: "btn btn-success",
          type: "success",
          //target: document.getElementById('config-section'),
          onBeforeOpen: function () {
            //$("#SuppMedModal .close").click();
            $("#"+modal+" .close").click();
          },
          onOpen: function () {
            //populateTabMed();                
          }
        }).catch(swal.noop)
      }
    }

    //Supprimer un medicament
    $("#supp_sortie").click(function(){
      var _id_del_design_sortie = $("#_id_del_design_sortie").val();
      var del_design_sortie = $("#del_design_sortie").text();
      Sortie.deleteOne({_id:_id_del_design_sortie}).then(function(deletedSortie) {
        console.log('Deleted ', deletedSortie, ' sortie from the database.');
        result_del(deletedSortie,del_design_sortie,"SuppSortieModal");
        populateTabSortie();
      });
    });

    $("#button-sortie").click(function(){
      console.log("sortie ") 
    });
  });