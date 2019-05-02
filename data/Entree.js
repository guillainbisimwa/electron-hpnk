var Document = require('camo').Document;

class Entree extends Document {
    constructor() {
        super();
        this.id_medicament = String;
        this.qt = {
            type: Number,
            default: 0
        },
        this.date_ = {
            type: Date,
            default: Date.now
        };
    }
}
module.exports = Entree