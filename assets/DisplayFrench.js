const json = require("./../assets/values/String.json");

//Name all item of left Menu
$("#button-dashboard").find("em").text(json.section_dashboard.name);
$("#button-config").find("em").text(json.section_config.name);
$("#button-stock").find("em").text(json.section_stock.name);
$("#button-entree").find("em").text(json.section_entrée.name);
$("#button-sortie").find("em").text(json.section_sortie.name);
$("#button-rapport").find("em").text(json.section_rapport.name);
$("#button-aide").find("em").text(json.section_aide.name);
$("#button-apropos").find("em").text(json.section_apropos.name);

//Put ICON to the left Menu
$("#button-dashboard").find("i").addClass(json.section_dashboard.icon);
$("#button-config").find("i").addClass(json.section_config.icon);
$("#button-stock").find("i").addClass(json.section_stock.icon);
$("#button-entree").find("i").addClass(json.section_entrée.icon);
$("#button-sortie").find("i").addClass(json.section_sortie.icon);
$("#button-rapport").find("i").addClass(json.section_rapport.icon);
$("#button-aide").find("i").addClass(json.section_aide.icon);
$("#button-apropos").find("i").addClass(json.section_apropos.icon);

//Put title to sections
$("#dashboard-titre").text(json.name+" - "+json.section_dashboard.name);
$("#config-titre").text(json.name+" - "+json.section_config.name);
$("#stock-titre").text(json.name+" - "+json.section_stock.name);
$("#entree-titre").text(json.name+" - "+json.section_entrée.name);
$("#sortie-titre").text(json.name+" - "+json.section_sortie.name);
$("#rapport-titre").text(json.name+" - "+json.section_rapport.name);
$("#aide-titre").text(json.name+" - "+json.section_aide.name);
$("#apropos-titre").text(json.name+" - "+json.section_apropos.name);

//Put TITRE et SOUS TITRE to sections
$(".card-stock").find("h4").text(json.section_stock.name);
$(".card-stock").find("p").text(json.section_stock.sous_titre);


//Section configuration
//Onglets
$(".nav-link-med").text((json.med.plurial).toUpperCase());
$(".nav-link-forme").text((json.forme.plurial).toUpperCase());
$(".nav-link-cat").text((json.cat.plurial).toUpperCase());

//Tab med
//Header of Table
$(".tab_med thead tr .1").text(json.nbr);
$(".tab_med thead tr .2").text(json.med.designation);
$(".tab_med thead tr .3").text(json.forme.designation);
$(".tab_med thead tr .4").text(json.cat.designation);

//Modals
$(".med-modal-title").text(json.med.add);
$("label.design_med").text(json.med.designation);
$("#SuppMedModal").find("h3 span").text(json.med.del_confirm_msg);
$("#SuppMedModal").find("h4").text(json.med.del);

$(".forme-modal-title").text(json.forme.add);
$("label.design_forme").text(json.forme.designation);
$("#SuppFormModal").find("h3 span").text(json.forme.del_confirm_msg);
$("#SuppFormModal").find("h4").text(json.forme.del);

$(".cat-modal-title").text(json.cat.add);
$("label.design_cat").text(json.cat.designation);
$("#SuppCatModal").find("h3 span").text(json.cat.del_confirm_msg);
$("#SuppCatModal").find("h4").text(json.cat.del);

$("#UploadMedModal").find("h4").text(json.med.upload);
$("#UploadMedModal").find(".btn-2").text(json.buttons.upload.name);
$("#submit_med span").text(json.buttons.valid.name);
$("#submit_med").find("i").addClass(json.buttons.valid.icon);

//Med
$("#save_med span").text(json.buttons.add.name);
$("#save_med").find("i").addClass(json.buttons.add.icon);
$("#update_med span").text(json.buttons.edit.name);
$("#update_med").find("i").addClass(json.buttons.edit.icon);
$("#supp_med span").text(json.buttons.del.name);
$("#supp_med").find("i").addClass(json.buttons.del.icon);

//Forme
$("#save_forme span").text(json.buttons.add.name);
$("#save_forme").find("i").addClass(json.buttons.add.icon);
$("#update_forme span").text(json.buttons.edit.name);
$("#update_forme").find("i").addClass(json.buttons.edit.icon);
$("#supp_forme span").text(json.buttons.del.name);
$("#supp_forme").find("i").addClass(json.buttons.del.icon);

//Cat
$("#save_cat span").text(json.buttons.add.name);
$("#save_cat").find("i").addClass(json.buttons.add.icon);
$("#update_cat span").text(json.buttons.edit.name);
$("#update_cat").find("i").addClass(json.buttons.edit.icon);
$("#supp_cat span").text(json.buttons.del.name);
$("#supp_cat").find("i").addClass(json.buttons.del.icon);
