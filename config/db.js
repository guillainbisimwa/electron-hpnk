var connect = require('camo').connect;
 
var database;
var uri = 'nedb://memory';
connect(uri).then(function(db) {
    database = db;
   // console.log(database)
});