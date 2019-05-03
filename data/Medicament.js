var Document = require('camo').Document;

class Medicament extends Document {
    constructor() {
        super();
        this.nom_medicament = String;
        this.id_categorie = String;
        this.id_forme = String;
        this.stock = {
            type: Number,
            default: 0
        };
    }
}
module.exports = Medicament