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

    connect(uri).then(function(db) {
      database = db;
      //Ajouter les formes dans l'objet Map
      mapOfForme();
      //Ajouter les cat dans l'objet Map
      mapOfCat();
      populateTabMed();
    });
    
    // Declare all my databases classes
    const Forme =  require('../data/Forme');
    const Categorie =  require('../data/Categorie');
    const Medicament =  require('../data/Medicament');

    //Init tables
    var _tab_forme = $("#tab_forme").DataTable();
    var _tab_cat = $("#tab_cat").DataTable();
    var _tab_med = $("#tab_med").DataTable();

    var tab_uploaded_med = $("#tab_uploaded_med").DataTable(
      {
        language:{
            url:'./assets/values/French.json'
        }
        // "columnDefs": [
        //   {
        //     "targets": [ 4, 5, 6 ],
        //     "visible": false,
        //     "searchable": false
        //   },
        // ],
        //destroy:true
      }
    );

    //init Map of "key","value"
    var mapForme = new Map();
    var mapCat = new Map();

    var dataUploaded = null;
    var medUploaded = null;

    //Init Selectors
    var listForme =  $("#design_med_forme");
    var listCat =  $("#design_med_cat");

    // Populate tab forme
    $(".nav-link-forme").click(function(){
      populateTabForme();
    });

    // Populate tab categorie
    $(".nav-link-cat").click(function(){
      populateTabCat();
    });

    // Populate tab medicament
    //populateTabMed();
    $(".nav-link-med").click(function(){
      populateTabMed();
    });

    //Save forme
    $("#save_forme").click(function(){
      var _forme = $("#design_forme").val();
      var forme = Forme.create({
        nom_forme: _forme
      });
      //Enregistrer la forme dans la BD
      forme.save().then(function(addedForme) {
        $("#design_forme").val("");
        console.log(addedForme._id);
        //Close programmaticaly the modal
        $("#AddFormModal .close").click();
        populateTabForme();
        mapOfForme();
        $("#design_forme").val("");
      });
      //After saving forme
      $("#design_forme").val("");
    })

    //save cat
    $("#save_cat").click(function(){
      var _cat = $("#design_cat").val();
      var cat = Categorie.create({
        nom_categorie: _cat
      });
      //Enregistrer la Categorie dans la BD
      cat.save().then(function(addedCategorie) {
        console.log(addedCategorie._id);
        $("#design_cat").val("");
        //Close programmaticaly the modal
        $("#AddCatModal .close").click();
        populateTabCat();
        mapOfCat();
      });
       //After saving forme
       $("#design_cat").val("");
    })

    //save med
    $("#save_med").click(function(){
      var _med = $("#design_med").val();
      var _cat =$("#design_med_cat").children("option:selected").val();
      var _forme =$("#design_med_forme").children("option:selected").val();
      var med = Medicament.create({
        nom_medicament: _med,
        id_categorie: _cat,
        id_forme: _forme,
      });

      med.save().then(function(addedMedicament) {
        console.log(addedMedicament._id);
        //Close programmaticaly the modal
        $("#AddMedModal .close").click();
        $("#design_med").val("");
        populateTabMed();
      });
      $("#design_med").val("");
    });

    //Update forme
    /** 
     * https://github.com/scottwrobinson/camo#creating-and-saving
    **/
    $("#update_forme").click(function(){
      var design_forme = $("#design_forme").val();
      var _id_design_forme = $("#_id_design_forme").val();
      Forme.findOneAndUpdate({_id:_id_design_forme},{nom_forme: design_forme},{upsert: true}).then(function(updatedForme) {
        populateTabForme();
        mapOfForme();
        console.log("_id = ", updatedForme._id)
        $("#AddFormModal .close").click();
      }); 
    });

    //Update Categorie
    $("#update_cat").click(function(){
      var design_cat = $("#design_cat").val();
      var _id_design_cat = $("#_id_design_cat").val();
      Categorie.findOneAndUpdate({_id:_id_design_cat},{nom_categorie: design_cat},{upsert: true}).then(function(updatedCat) {
        populateTabCat();
        mapOfCat();
        console.log("_id = ", updatedCat._id)
        $("#AddCatModal .close").click();
      }); 
    });

    //Update medicament
    $("#update_med").click(function(){
      var design_med = $("#design_med").val();
      var _id_design_med = $("#_id_design_med").val();

      var id_forme = listForme.children("option:selected").val();
      var id_categorie = listCat.children("option:selected").val();

      Medicament.findOneAndUpdate({_id:_id_design_med},{nom_medicament: design_med,id_forme:id_forme,id_categorie:id_categorie},{upsert: true}).then(function(updatedMed) {
        populateTabMed();
        console.log("_id = ", updatedMed._id)
        $("#AddMedModal .close").click();
      }); 
    });

    //Supprimer une forme
    $("#supp_forme").click(function(){
      var _id_del_design_forme = $("#_id_del_design_forme").val();
      var del_design_forme = $("#del_design_forme").text();
      Forme.deleteOne({_id:_id_del_design_forme}).then(function(deletedForme) {
        console.log('Deleted ', deletedForme, ' forme from the database.');
        result_del(deletedForme,del_design_forme,"SuppFormModal");
        populateTabForme();
        mapOfForme(); 
        //Update Medicaments and remove the deleted forme's ID
        Medicament.findOneAndUpdate({id_forme:_id_del_design_forme},{id_forme:""},{upsert: true}).then(function(updatedMed) {
          populateTabMed();
          console.log("OKKKAY _id forme = ", updatedMed._id)
        }); 
      });
    });

    //Supprimer une categorie
    $("#supp_cat").click(function(){
      var _id_del_design_cat = $("#_id_del_design_cat").val();
      var del_design_cat = $("#del_design_cat").text();
      Categorie.deleteOne({_id:_id_del_design_cat}).then(function(deletedCat) {
        console.log('Deleted ', deletedCat, ' categorie from the database.');
        result_del(deletedCat,del_design_cat,"SuppCatModal");
        populateTabCat();
        mapOfCat();
        //Update Medicaments and remove the deleted Cat's ID
        Medicament.findOneAndUpdate({id_categorie:_id_del_design_cat},{id_categorie:""},{upsert: true}).then(function(updatedMed) {
          populateTabMed();
          console.log("OKKKAY _id cat = ", updatedMed._id)
        });
      });
    });

     //Supprimer un medicament
     $("#supp_med").click(function(){
      var _id_del_design_med = $("#_id_del_design_med").val();
      var del_design_med = $("#del_design_med").text();
      Medicament.deleteOne({_id:_id_del_design_med}).then(function(deletedMed) {
        console.log('Deleted ', deletedMed, ' medicamemt from the database.');
        result_del(deletedMed,del_design_med,"SuppMedModal");
        populateTabMed();
      });
    });
    
    //Function, update values before adding forme
    function updateValueModalForme(forme,_id){
      $("#update_forme").css("display","block");
      $("#save_forme").css("display","none");
      $(".forme-modal-title").text(json.forme.edit);
      $(".forme-modal-title").css("color","#a11");
      //$("#design_forme").click();
      $("#design_forme").val(forme);
      $("#_id_design_forme").val(_id);
      
      //Find is-filled is-focused
      $("#AddFormModal").find(".form-group").addClass("has-danger is-filled is-focused");
    }
    function addValueModalForme(){
      $("#update_forme").css("display","none");
      $("#save_forme").css("display","block");
      $(".forme-modal-title").text(json.forme.add);
      $(".forme-modal-title").css("color","#000");
      $("#AddFormModal").find(".form-group").removeClass("has-danger is-filled is-focused");
      $("#design_forme").val("");
      $("#_id_design_forme").val("");
    }

     //Function, update values before adding categorie
     function updateValueModalCat(cat,_id){
      $("#update_cat").css("display","block");
      $("#save_cat").css("display","none");
      $(".cat-modal-title").text(json.cat.edit);
      $(".cat-modal-title").css("color","#a11");
      //$("#design_forme").click();
      $("#design_cat").val(cat);
      $("#_id_design_cat").val(_id);
      
      //Find is-filled is-focused
      $("#AddCatModal").find(".form-group").addClass("has-danger is-filled is-focused");
    }
    function addValueModalCat(){
      $("#update_cat").css("display","none");
      $("#save_cat").css("display","block");
      $(".cat-modal-title").text(json.cat.add);
      $(".cat-modal-title").css("color","#000");
      $("#AddCatModal").find(".form-group").removeClass("has-danger is-filled is-focused");
      $("#design_cat").val("");
      $("#_id_design_cat").val("");
    }

     //Function, update values before adding medicament
     function updateValueModalMed(cat,_id, _id_forme, _id_categorie){
      $("#update_med").css("display","block");
      $("#save_med").css("display","none");
      $(".med-modal-title").text(json.med.edit);
      $(".med-modal-title").css("color","#a11");
      //$("#design_forme").click();
      $("#design_med").val(cat);
      $("#_id_design_med").val(_id);

      //Choose the selected values
      populateSelectFormeUpdate(_id_forme);
      populateSelectCatUpdate(_id_categorie);
      
      //Find is-filled is-focused
      $("#AddMedModal").find(".form-group").addClass("has-danger is-filled is-focused");
    }
    function addValueModalMed(){
      $("#update_med").css("display","none");
      $("#save_med").css("display","block");
      $(".med-modal-title").text(json.med.add);
      $(".med-modal-title").css("color","#000");
      $("#AddMedModal").find(".form-group").removeClass("has-danger is-filled is-focused");
      $("#design_med").val("");
      $("#_id_design_med").val("");
    }


    //Function, update values before adding forme
    function delValueModalForme(forme,_id){
      $("#del_design_forme").text(forme);
      $("#_id_del_design_forme").val(_id);
    }

    //Function, update values before adding forme
    function delValueModalCat(forme,_id){
      $("#del_design_cat").text(forme);
      $("#_id_del_design_cat").val(_id);
    }

    //Function, update values before adding medicament
    function delValueModalMed(med,_id){
      $("#del_design_med").text(med);
      $("#_id_del_design_med").val(_id);
    }

    //Function populate tab Forme
    function populateTabForme(){
      var tab_forme = [];
      _tab_forme.destroy();
      //$("#tab_forme").empty();
      Forme.find({},{sort:'nom_forme'}).then(function(foundForme) {
        i = 0;
        foundForme.forEach(function(foundSingleForme) {
          i++;
          //console.log("_id = ", foundSingleForme._id)
          var localSingleForme = [i, foundSingleForme.nom_forme, foundSingleForme._id]; 
          tab_forme.push(Array.from(localSingleForme))
        });

        console.log(Array.from(tab_forme))
        //_tab_forme.DataTable({
        _tab_forme =  $('#tab_forme').DataTable({
          
          dom: 'Blfrtip',
          select: true,
          buttons: [
            {
              text: '<li class="'+json.buttons.new.icon+'"></li> '+json.buttons.new.name,
              action: function ( e, dt, node, config ) {
                addValueModalForme();
                $("#AddFormModal").modal();
              }
            },
            {
              text: '<li class="'+json.buttons.edit.icon+'"></li> '+json.buttons.edit.name,
              action: function ( e, dt, node, config ) {
                  console.log(
                      'Row data: '+
                      JSON.stringify( dt.row( { selected: true } ).data() )
                  ); 
                  updateValueModalForme(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[2]);
                  $("#AddFormModal").modal();
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
                  delValueModalForme(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[2]);
                  $("#SuppFormModal").modal(); 
              },
              enabled: false
            },
            //'copy', 'csv', 'excel', 'pdf', 'print', "colvis"
            {
              extend:    'csv',
              text:      '<i class="'+json.buttons.export.icon+'"></i> '+json.buttons.export.name,
              titleAttr: 'CSV',
              filename: json.forme.file_name,
              exportOptions: {
                columns: [0, 1]
              },
            }                  
          ],
          // ICI on choisi la langue des details du tableau
          language:{
            url:'./assets/values/French.json'
          },
          "order": [[ 0, "asc" ]],
          // Les donnees sont affichees dans le tableau HTML
          data:tab_forme,
          // On affiche pas la troisieme colonne, elle reprend les _id
          "columnDefs": [
            {
              "targets": [ 2 ],
              "visible": false,
              "searchable": false
            },
          ],
          destroy:true
        });
        
        _tab_forme.on( 'select deselect', function () {
          var selectedRows = _tab_forme.rows( { selected: true } ).count();
          console.log("ok: "+selectedRows)
          _tab_forme.button( 1 ).enable( selectedRows === 1 );
          _tab_forme.button( 2 ).enable( selectedRows === 1 );
        });
      });
    }

     //Function populate tab Categorie
     function populateTabCat(){
      var tab_cat = [];
      _tab_cat.destroy();
      //$("#tab_cat").empty();
      Categorie.find({},{sort:'nom_categorie'}).then(function(foundCat) {
        i = 0;
        foundCat.forEach(function(foundSingleCat) {
          i++;
          //console.log("_id = ", foundSingleCat._id)
          var localSingleCat = [i, foundSingleCat.nom_categorie, foundSingleCat._id]; 
          tab_cat.push(Array.from(localSingleCat))
        });

        console.log(Array.from(tab_cat))
        //_tab_cat.DataTable({
        _tab_cat =  $('#tab_cat').DataTable({
          
          dom: 'Blfrtip',
          select: true,
          buttons: [
            {
              text: '<li class="'+json.buttons.new.icon+'"></li> '+json.buttons.new.name,
              action: function ( e, dt, node, config ) {
                addValueModalCat();
                $("#AddCatModal").modal();
              }
            },
            {
              text: '<li class="'+json.buttons.edit.icon+'"></li> '+json.buttons.edit.name,
              action: function ( e, dt, node, config ) {
                  console.log(
                      'Row data: '+
                      JSON.stringify( dt.row( { selected: true } ).data() )
                  ); 
                  updateValueModalCat(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[2]);
                  $("#AddCatModal").modal();
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
                  delValueModalCat(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[2]);
                  $("#SuppCatModal").modal(); 
              },
              enabled: false
            },
            //'copy', 'csv', 'excel', 'pdf', 'print', "colvis"
            {
              extend:    'csv',
              text:      '<i class="'+json.buttons.export.icon+'"></i> '+json.buttons.export.name,
              titleAttr: 'CSV',
              filename: json.cat.file_name,
              exportOptions: {
                columns: [0, 1]
              },
            }                  
          ],
          // ICI on choisi la langue des details du tableau
          language:{
            url:'./assets/values/French.json'
          },
          "order": [[ 0, "asc" ]],
          // Les donnees sont affichees dans le tableau HTML
          data:tab_cat,
          // On affiche pas la troisieme colonne, elle reprend les _id
          "columnDefs": [
            {
              "targets": [ 2 ],
              "visible": false,
              "searchable": false
            },
          ],
          destroy:true
        });
        
        _tab_cat.on( 'select deselect', function () {
          var selectedRows = _tab_cat.rows( { selected: true } ).count();
          console.log("ok: "+selectedRows)
          _tab_cat.button( 1 ).enable( selectedRows === 1 );
          _tab_cat.button( 2 ).enable( selectedRows === 1 );
        });
      });
    }

    $("#button-config").click(function(){
      mapOfCat();
      mapOfForme();
      console.log("Epai na bango")
      populateTabMed();
    });

     //Function populate tab medicament
    function populateTabMed(){
      var tab_med = [];
      //_tab_med.destroy();
      console.log("Nanannanan")
      //$("#tab_med").empty();
      Medicament.find({},{sort:'nom_medicament'}).then(function(foundMed) {
        i = 0;
        foundMed.forEach(function(foundSingleMed) {
          i++;
          
          //get the real name of categorie by uising its _id
          var _nom_forme = mapForme.has(foundSingleMed.id_forme)? mapForme.get(foundSingleMed.id_forme):"";
          //var _nom_cat = "OK";
          var _nom_cat = mapCat.has(foundSingleMed.id_categorie)? mapCat.get(foundSingleMed.id_categorie):"";
          
          _id_forme = (foundSingleMed.id_forme != undefined ) ? foundSingleMed.id_forme : "";
          _id_categorie =(foundSingleMed.id_categorie != undefined ) ? foundSingleMed.id_categorie : "";
          //Put the result recursivelly inside the medicament's table
          var localSingleMed = [i, foundSingleMed.nom_medicament, _nom_forme, _nom_cat, foundSingleMed._id,_id_forme,_id_categorie,foundSingleMed.stock]; 
          tab_med.push(Array.from(localSingleMed))
        });

        //console.log("Here ",Array.from(tab_med))
        //_tab_med.DataTable({
        _tab_med =  $('#tab_med').DataTable({
          dom: 'Blfrtip',
          select: true,
          buttons: [
            {
              text: '<li class="'+json.buttons.new.icon+'"></li> '+json.buttons.new.name,
              action: function ( e, dt, node, config ) {
                addValueModalMed();
                populateSelectForme();
                populateSelectCat();
                $("#AddMedModal").modal();
              }
            },
            {
              text: '<li class="'+json.buttons.edit.icon+'"></li> '+json.buttons.edit.name,
              action: function ( e, dt, node, config ) {
                  console.log(
                      'Row data: '+
                      JSON.stringify( dt.row( { selected: true } ).data() )
                  ); 
                  updateValueModalMed(dt.row( { selected: true } ).data()[1], dt.row( { selected: true } ).data()[4],
                    dt.row( { selected: true } ).data()[5], dt.row( { selected: true } ).data()[6]);

                  $("#AddMedModal").modal();
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
                  $("#SuppMedModal").modal(); 
              },
              enabled: false
            },
            //'copy', 'csv', 'excel', 'pdf', 'print', "colvis"
            {
              extend:    'csv',
              text:      '<i class="'+json.buttons.export.icon+'"></i> '+json.buttons.export.name,
              titleAttr: 'CSV',
              filename: json.med.file_name,
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6, 7]
              },
            }                  
          ],
          // ICI on choisi la langue des details du tableau
          language:{
            url:'./assets/values/French.json'
          },
          //"order": [[ 0, "asc" ]],
          // Les donnees sont affichees dans le tableau HTML
          data:tab_med,
          // On affiche pas la troisieme colonne, elle reprend les _id
          "columnDefs": [
            {
              "targets": [ 4, 5, 6 ],
              "visible": false,
              "searchable": false
            },
          ],
          destroy:true
        });
        
        _tab_med.on( 'select deselect', function () {
          var selectedRows = _tab_med.rows( { selected: true } ).count();
          console.log("ok: "+selectedRows)
          _tab_med.button( 1 ).enable( selectedRows === 1 );
          _tab_med.button( 2 ).enable( selectedRows === 1 );
        });
      });
    }

    //Populate forme SELECTPICKERS
    function populateSelectForme(){
      
      Forme.find({},{sort:'nom_forme'}).then(function(foundForme) {
        i = 0;
        //remove all oprion before adding new
        listForme.children().remove();
        listForme.children().empty();

        foundForme.forEach(function(foundSingleForme) {
          i++;
          listForme.append('<option value="' + foundSingleForme._id + '">' + foundSingleForme.nom_forme + '</option>');
        });
        listForme.selectpicker();
        listForme.selectpicker('refresh');
      });
    }

     //Populate forme SELECTPICKERS
     function populateSelectFormeUpdate(_id_forme){
      
      Forme.find({},{sort:'nom_forme'}).then(function(foundForme) {
        i = 0;
        //remove all oprion before adding new
        listForme.children().remove();
        listForme.children().empty();

        foundForme.forEach(function(foundSingleForme) {
          i++;
          listForme.append('<option value="' + foundSingleForme._id + '">' + foundSingleForme.nom_forme + '</option>');
        });
        listForme.val(_id_forme).change();
        listForme.selectpicker();
        listForme.selectpicker('refresh');
      });
    }

    //Populate categorie SELECTPICKERS
    function populateSelectCat(){
      
      Categorie.find({},{sort:'nom_categorie'}).then(function(foundCat) {
        i = 0;
        //remove all oprion before adding new
        listCat.children().remove();
        listCat.children().empty();

        foundCat.forEach(function(foundSingleCat) {
          i++;
          listCat.append('<option value="' + foundSingleCat._id + '">' + foundSingleCat.nom_categorie + '</option>');
        });
        listCat.selectpicker();
        listCat.selectpicker('refresh');
      });
    }

    //Populate categorie SELECTPICKERS
    function populateSelectCatUpdate(_id_categorie){
      
      Categorie.find({},{sort:'nom_categorie'}).then(function(foundCat) {
        i = 0;
        //remove all oprion before adding new
        listCat.children().remove();
        listCat.children().empty();

        foundCat.forEach(function(foundSingleCat) {
          i++;
          listCat.append('<option value="' + foundSingleCat._id + '">' + foundSingleCat.nom_categorie + '</option>');
        });
        listCat.val(_id_categorie).change();
        listCat.selectpicker();
        listCat.selectpicker('refresh');
      });
    }

    //Populate THE forme's MAP
    function mapOfForme(){
      //Supprime tous les éléments de l'objet Map contenat les formes
      mapForme.clear();
      Forme.find({},{sort:'nom_forme'}).then(function(foundForme) {
        foundForme.forEach(function(foundSingleForme) {
          //populate the Map of formr
          mapForme.set(foundSingleForme._id, foundSingleForme.nom_forme);              
        });
        //console.log(Array.from(mapForme))
      });
    }

    //Populate THE cat's MAP
    function mapOfCat(){
      //Supprime tous les éléments de l'objet Map contenat les formes
      mapCat.clear();
      Categorie.find({},{sort:'nom_categorie'}).then(function(foundCat) {
        foundCat.forEach(function(foundSingleCat) {
          //populate the Map of cat
          mapCat.set(foundSingleCat._id, foundSingleCat.nom_categorie);              
        });
        //console.log(Array.from(mapCat))
      });
    }

    function result_del(deletedMed,deleted_item,modal){
      if(deletedMed == 0){
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

    $("#uploadModalRun").click(async function(){
      //Finish uploading
      $("#submit_med").css("display","block");

      //Init all the proresses bars
      $(".progress-bar-forme").css("width", "0%");
      $(".progress-bar-cat").css("width", "0%");
      $(".progress-bar-med").css("width", "0%");

      await $(".progresses").css("display", "none");
      await $(".uploaded_file_name").text("")
      //Clear the table
      tab_uploaded_med.destroy();
      //tab_uploaded_med.empty();
      tab_uploaded_med = await $('#tab_uploaded_med').DataTable({
        // ICI on choisi la langue des details du tableau
        language:{
          url:'./assets/values/French.json'
        },
        // Les donnees sont affichees dans le tableau HTML
        data: null,
        destroy: true,
      });
    })

    //Upload a CSV file 
    $('input[type="file"]').change(function(e){
      var files = e.target.files;
      var file = files[0];
      console.log(file.name)
      console.log(' - FileType: ',file.type)
      console.log(' - FileSize: ',file.size );
      console.log(' - LastModified: ',file.lastModifiedDate +" ==> "+file.lastModifiedDate.toLocaleDateString())

      //show the name uploaded file's name
     $(".uploaded_file_name").text(" NOM DU FICHIER : "+file.name)

      var filePath = $(this).val();

      var tmppath = URL.createObjectURL(event.target.files[0]);

      var reader = new FileReader();
      reader.readAsText(file); //Encodage de Europe central //ISO-8859-2 //CP1251// Windows 1252 //ISO 8859-15
      reader.onload = function(event){
        var csv = event.target.result;
     
        options = {
          separator: ';',
          delimiter: '"',
        };
        // .slice(1) removes the first element of the array, and returns that element apart from item 1.
        dataUploaded = null;
        medUploaded = null;
        try {
          dataUploaded = (_csv.toArrays(csv,options)).slice(1);
          medUploaded = (_csv.toArrays(csv,options)).slice(1);
        } catch (error) {
          console.log("csv: "+error);
          dataUploaded = (_csv.toArrays(csv)).slice(1);
          medUploaded = (_csv.toArrays(csv)).slice(1);
        }
        
        tab_uploaded_med =  $('#tab_uploaded_med').DataTable({
          // ICI on choisi la langue des details du tableau
          language:{
            url:'./assets/values/French.json'
          },
          "order": [[ 0, "asc" ]],
          // Les donnees sont affichees dans le tableau HTML
          data:dataUploaded,
          // On affiche pas la 4e, 5em et 6em colonne, elles reprennent les _id
          // "columnDefs": [
          //   {
          //     "targets": [ 4, 5, 6 ],
          //     "visible": false,
          //     "searchable": false
          //   },
          // ],
          destroy:true
        });
      }
      reader.onerror = function(){ console.log('Unable to read ' + file.fileName); };
    });

    //Upload med , Forme and Cat
    $("#submit_med").click(async function(){
      //Show progreses bars
      $(".progresses").css("display","block");
      //Get the unique Forme
      const distinct_forme = [...new Set(dataUploaded.map(item => item[2].trim()))];

      //Get the unique cat
      const distinct_cat = [...new Set(dataUploaded.map(item => item[3].trim()))];
      
      //Get the unique med
      let distinct_med = dataUploaded;

      //Delette all Forme inside the db
      await Forme.deleteMany({}).then( function(deletedForme) {
        console.log('Deleted ', deletedForme, ' forme(s) from the database.');
         //Progess bar calculus
        tab_forme_len = distinct_forme.length;
        unity_percent_forme = tab_forme_len / 100;
        percent_forme = (1/unity_percent_forme);
        //save all newly added formes
         distinct_forme.forEach(element => {
          if(element != ""){
            var forme = Forme.create({nom_forme: element});
            //Enregistrer la forme dans la BD
            forme.save().then(function(addedForme) {
              percent_forme = percent_forme +(1/unity_percent_forme);
              if(percent_forme<70) $(".progress-bar-forme span").text(percent_forme+"%");
              else $(".progress-bar-forme span").text("Forme "+percent_forme+" % Complète");
              $(".progress-bar-forme").css("width", percent_forme+"%");
            });
          }
        });
      });

      //Delette all Forme inside the db
      await Categorie.deleteMany({}).then( function(deletedCat) {
        console.log('Deleted ', deletedCat, ' categories(s) from the database.');
        //Progess bar calculus
        tab_cat_len = distinct_cat.length;
        unity_percent_cat = tab_cat_len / 100;
        percent_cat = (1/unity_percent_cat);
        //save all newly added cat
         distinct_cat.forEach(element => {
          if(element != ""){
            var cat = Categorie.create({nom_categorie: element});
            //Enregistrer la cat dans la BD
            cat.save().then(function(addedCat) {
              percent_cat = percent_cat +(1/unity_percent_cat);
              if(percent_cat<70) $(".progress-bar-cat span").text(percent_cat+"%");
              else $(".progress-bar-cat span").text("Catégorie "+percent_cat+" % Complète");
              $(".progress-bar-cat").css("width", percent_cat+"%");
            });
          }
        });
      });
      
      //Find ids
      await Forme.find({},{sort:'nom_forme'}).then(function(foundForme) {
        foundForme.forEach(function(foundSingleForme) {
          //Remplacer les noms de formes par les IDs
          distinct_med.forEach((item) => {
            //console.log("=+=> ",item[2])
            if (item[2].trim() == foundSingleForme.nom_forme) {
              item[2] = foundSingleForme._id;
            }
            else {
              //item[3] ="";
            }
            //return item;
          });
          
        });
      });

      //Find ids
      await Categorie.find({},{sort:'nom_categorie'}).then(function(foundCat) {
        foundCat.forEach(function(foundSingleCat) {
          //Remplacer les noms de formes par les IDs
          distinct_med.forEach((item) => {
            //console.log("=+=> ",item[2])
            if (item[3].trim() == foundSingleCat.nom_categorie) {
              item[3] = foundSingleCat._id;
            }
            else {
              //item[3] ="";
            }
            //return item;
          });
          
        });
      });

      //Delette all med inside the db
      await Medicament.deleteMany({}).then(async function(deletedMed) {
        console.log('Deleted ', deletedMed, ' Medicament(s) from the database.');
        //Add progess bar calculus
        tab_med_len = distinct_med.length;
        unity_percent = tab_med_len / 100;
        percent = (1/unity_percent);
        distinct_med.forEach(element => {
          if(element != ""){
            var med = Medicament.create({nom_medicament: element[1], id_forme: element[2], id_categorie: element[3], stock: parseInt(element[4], 10)});
            //Enregistrer le med dans la BD
            med.save().then(function(addedForme) {
              //console.log("added: " ,addedForme._id)
              percent = percent +(1/unity_percent);
              if(percent<70) $(".progress-bar-med span").text(percent+"%");
              else $(".progress-bar-med span").text("Medicaments "+percent+" % Complète");
              $(".progress-bar-med").css("width", percent+"%");
            });
          }
          
        });
        //Finish uploading
        $("#submit_med").css("display","none");
      });
    })

    $("#fermerUploadModal").click(function(){
      //populate table med
      //populate table cat
      //populate table forme
      mapOfForme();
      mapOfCat();
      populateTabMed();
    })
    
  });