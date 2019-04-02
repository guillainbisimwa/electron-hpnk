var Document = require('camo').Document;

class Categorie extends Document {
    constructor() {
        super();
        this.nom_categorie = String;
    }
}
module.exports = Categorie