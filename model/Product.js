const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    imagePath: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true
    },
    information: {
        required: true,
        type: {
            storage:String,
            ram:Number,
            numberOfSim:String,
            camera:String,
            displaySize:String 
        },

    },
    price: {
        type: Number,
        required: true
    },

});
module.exports=mongoose.model('Product',productSchema);