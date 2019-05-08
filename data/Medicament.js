var Document = require('camo').Document;

class Medicament extends Document {
    constructor() {
        super();
        this.nom_medicament = String;
        this.id_categorie = String;
        this.id_forme = String;
    }
}
module.exports = Medicament