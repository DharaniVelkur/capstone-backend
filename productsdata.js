const productdb = require("./models/productSchema")

const productsarray=async ()=>{
    let allproducts=await productdb.find();
    try {
        let empty_object={}
       await allproducts.forEach(element => {
            for(let i=0;i<element.colors.length;i++){
                empty_object[element.dress_type+"-"+element.colors[i].name] = 
                [...empty_object[element.dress_type+"-"+element.colors[i].name] || [], ...[element]];
            }
        });
        // console.log(empty_object);
        return empty_object;
    } catch (error) {
        console.error(error);
    }
}

module.exports=productsarray;