const colors=require('./constant/colors');
const colorsschema = require('./models/colorsSchema');

const Defaultcolors=async ()=>{
    try {
        await colorsschema.deleteMany({});
        const storedata=await colorsschema.insertMany(colors);
        if(storedata){
            console.log('stored')
        }
    } catch (error) {
        console.log("error")
    }
}
module.exports=Defaultcolors;