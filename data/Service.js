var Document = require('camo').Document;

class Service extends Document {
    constructor() {
        super();
        this.nom_service = String;
    }
}
module.exports = Service