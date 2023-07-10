const mongoose=require('mongoose');

const colorsSchema=new mongoose.Schema({
    code:String,
    name:String
})

const colorsschema=new mongoose.model('colors',colorsSchema);
module.exports=colorsschema;