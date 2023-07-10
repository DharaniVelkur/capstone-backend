const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config();
const Secret_key=process.env.JWTSECRET;


const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Not valid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    cpassword: {  
      type: String,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required:true
        },
      },
    ],
    verifytoken:{
      type:String
    },
    colors_liked:Array,
    topcolors_liked:Array,
    bottomcolors_liked:Array,
    payment:{
      type:Boolean
    },
    filename:String,
    role:String,
    liked_products:Array,
    suggestion_history:Object
  });

  //hashing password
userSchema.pre('save',async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,12);
        this.cpassword= await bcrypt.hash(this.cpassword,12);
    }
    next();
});

//generate a token
userSchema.methods.generateAuthtoken=async function (){
    try {
        let token1=jwt.sign({_id:this._id,name:this.name,email:this.email},Secret_key,{expiresIn:"1d"});
        this.tokens=this.tokens.concat({token:token1})
        await this.save();
        return token1;
    } catch (error) {
        throw(error);
    }
}

//adding liked colors
userSchema.methods.addcolorsliked=async function(body){
  try {
    this.colors_liked=await this.colors_liked.concat(body[0]);
    this.topcolors_liked=await this.topcolors_liked.concat(body[1]);
    this.bottomcolors_liked=await this.bottomcolors_liked.concat(body[2]);
    await this.save();
    return this.colors_liked,this.topcolors_liked,this.bottomcolors_liked;
  } catch (error) {
    console.log(error);
  }
}




const userdb=new mongoose.model('users',userSchema);
module.exports=userdb;