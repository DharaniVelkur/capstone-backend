const mongoose=require('mongoose');

const productSchema= new mongoose.Schema({
    image:String,
    dress_type:String,
    colors:Array,
    image_url:String,
    liked_users:Array
});

const productdb=new mongoose.model('products',productSchema);
module.exports=productdb;