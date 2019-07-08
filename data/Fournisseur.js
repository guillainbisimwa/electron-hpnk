var Document = require('camo').Document;

class Fournisseur extends Document {
    constructor() {
        super();
        this.nom_fournisseur = String;
        this.adress = String;
        this.phone = String;
    }
}
module.exports = Fournisseur