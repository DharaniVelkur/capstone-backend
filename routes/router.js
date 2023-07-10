const express=require('express');
const router=new express.Router();
const authenticate = require('../middleware/authenticate');
const { registeruser, loginuser, validateUser, logoutUser, sendPasswordLink, verifyuser, changepassword, getAllColors, selectedColors, getuser, checkout, uploadImage, suggestion, addLikeToProduct, getlikes, updatecolors } = require('../controllers/url');
const multer = require('multer');
const AWS=require('aws-sdk');
const userdb = require('../models/userSchema');

// Multer middleware to handle image upload
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
  });

//welcome
// router.get('/',async(req,res)=>{
//     try {
//         return res.status(200).send('WELCOME')
//     } catch (error) {
//         return res.status(400).send("Error")
//     }
// })

//for user registration
router.post('/register',registeruser);

//login user
router.post('/login',loginuser);

//valid user
router.get('/validuser',authenticate,validateUser);

//user logout
router.get('/logout',authenticate,logoutUser);

//send link for reset password
router.post('/sendpasswordlink',sendPasswordLink)

//verify user for forgot password
router.get("/forgotpassword/:id/:token",verifyuser)

//change password
router.post('/:id/:token',changepassword);

//get all colors
router.get('/allcolors',getAllColors);

//post all colors which she selected
router.post('/selectedcolors',authenticate,selectedColors);

//get a particular user
router.get('/user',authenticate,getuser);

//complete checkout process
router.post('/checkout',authenticate,checkout);

//to upload image and text to s3
router.post('/upload',authenticate,upload.single('image'),uploadImage);

//get suggestion 
router.get('/suggestion',authenticate,suggestion);

//add a like to the product list
router.post('/like',authenticate,addLikeToProduct)

router.post('/updatecolors',authenticate,updatecolors)


module.exports=router;