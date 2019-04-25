var Document = require('camo').Document;

class Stock extends Document {
    constructor() {
        super();
        this.id_medicament = String;
        this.qt_disponible = Number;
    }
}
module.exports = Stock