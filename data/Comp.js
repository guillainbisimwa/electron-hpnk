var Document = require('camo').Document;

class Comp extends Document{
    // constructor(name) {
    //     this._name = name;
    // }

    // get name() {
    //     return this._name.toUpperCase();
    // }

    // set name(newName) {
    //     this._name = newName;   // validation could be checked here such as only allowing non numerical values
    // }

    // walk() {
    //     console.log(this._name + ' is walking.');
    // }
    constructor() {
        super();

        this.name = String;
        this.valuation = {
            type: Number,
            default: 10000000000,
            min: 0
        };
        this.employees = [String];
        this.dateFounded = {
            type: Date,
            default: Date.now
        };
    }

    static collectionName() {
        return 'companies';
    }
}
module.exports = Comp