
const mongoose = require('mongoose');
 
const DataBase = mongoose.connect('mongodb://localhost:27017/E-Cart-Task')
    .then(res => {
     console.log("connected")
    }) 
 
    module.exports = { DataBase }