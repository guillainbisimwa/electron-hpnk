const json = require("./../assets/values/String.json");

//Put text to section's NAV
$("#config-titre").text(json.name);
$("#button-dashboard").find("em").text(json.section_dashboard.name);
$("#button-config").find("em").text(json.section_config.name);
$("#button-stock").find("em").text(json.section_stock.name);
$("#button-entree").find("em").text(json.section_entrée.name);
$("#button-sortie").find("em").text(json.section_sortie.name);
$("#button-rapport").find("em").text(json.section_rapport.name);
$("#button-aide").find("em").text(json.section_aide.name);
$("#button-apropos").find("em").text(json.section_apropos.name);

$("#button-dashboard").find("i").addClass(json.section_dashboard.icon);
$("#button-config").find("i").addClass(json.section_config.icon);
$("#button-stock").find("i").addClass(json.section_stock.icon);
$("#button-entree").find("i").addClass(json.section_entrée.icon);
$("#button-sortie").find("i").addClass(json.section_sortie.icon);
$("#button-rapport").find("i").addClass(json.section_rapport.icon);
$("#button-aide").find("i").addClass(json.section_aide.icon);
$("#button-apropos").find("i").addClass(json.section_apropos.icon);

