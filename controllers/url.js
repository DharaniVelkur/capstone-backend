const userdb = require("../models/userSchema");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Secret_key = process.env.JWTSECRET;
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const colorsschema = require("../models/colorsSchema");
const { v4: uuidv4 } = require('uuid');
const config = require("../config");
const productdb = require("../models/productSchema");
const productsarray = require("../productsdata");
const mongoose = require("mongoose");


//email config
let transporter = nodemailer.createTransport({

    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
    },
});

//register user
async function registeruser(req, res) {
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.cpassword) {
        return res.status(400).json({ error: "fill all the details" })
    }
    try {
        const preuser = await userdb.findOne({ email: req.body.email });
        if (preuser) {
            res.status(400).json({ error: "user already exists!!" })
        } else if (req.body.password !== req.body.cpassword) {
            res.status(400).json({ error: "password and confirm password does not match" })
        } else {
            let newuser = await new userdb({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                cpassword: req.body.cpassword
            });
            //password hashing
            const storeddata = await newuser.save();
            res.status(200).json({ status: 200, storeddata });
        }

    } catch (error) {
        res.status(400).json({ error: "Some error occurred" });
    }
}

//login user

async function loginuser(req, res) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: "fill all the details" })
    }
    try {
        const uservalid = await userdb.findOne({ email: req.body.email });
        if (uservalid) {
            const ismatch = await bcrypt.compare(req.body.password, uservalid.password);
            //  console.log(ismatch)
            if (!ismatch) {
                res.status(400).json({ error: "invalid details" })
            } else {
                const token = await uservalid.generateAuthtoken();
                const result = { uservalid, token }
                res.status(200).json({ status: 200, result });
            }
        } else {
            res.status(400).json({ error: "User does not exist!!!" })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: "Some error occurred" });
    }
}

//valid user
async function validateUser(req, res) {
    try {
        const validuserone = await userdb.findOne({ _id: req.userId });
        // console.log(validuserone)
        res.status(200).json({ status: 200, validuserone })
    } catch (error) {
        res.status(400).json({ status: 400, error });
    }
}

//logout user
async function logoutUser(req, res) {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter(e => {
            return e.token !== req.token
        })
        req.rootUser.save();
        res.status(200).json({ status: 200, message: req.rootUser });
    } catch (error) {
        res.status(400).json({ status: 400, error })
    }
}

//send reset password link
async function sendPasswordLink(req, res) {
    if (!req.body.email) {
        return res.status(401).json({ status: 400, error: "Enter Your Email" })
    }
    try {
        const finduser = await userdb.findOne({ email: req.body.email });
        if (finduser) {
            const token = jwt.sign({ _id: finduser._id }, Secret_key, {
                expiresIn: "120s"
            });
            const setusertoken = await userdb.findByIdAndUpdate(finduser._id, {
                verifytoken: token
            }, { new: true })
            if (setusertoken) {
                const mailOptions = {
                    from: "dharani94667@gmail.com",
                    to: req.body.email,
                    subject: "Password Reset Link",
                    text: `This link is valid for 2 minutes http://localhost:3000/forgotpassword/${finduser._id}/${setusertoken.verifytoken}`
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.status(400).json({ status: 400, "error": "Email not sent" })
                    } else {
                        res.status(200).json({ status: 200, "message": "Email sent successfully!!" })
                    }
                })
            }
        } else {
            res.status(400).json({ error: "User Not found" })
        }
    } catch (error) {
        res.status(400).json({ error: "Some error occurred" });
    }

}

async function verifyuser(req, res) {
    const id = req.params.id;
    const token = req.params.token;
    try {
        const validuser = await userdb.findOne({ _id: id, verifytoken: token });
        const verifyToken = jwt.verify(token, Secret_key);
        if (validuser && verifyToken._id) {
            res.status(200).json({ status: 200, validuser })
        } else {
            res.status(401).json({ status: 400, error: "user not exist" })
        }

    } catch (error) {
        res.status(401).json({ status: 400, error: "some error occurred" })
    }
}

async function changepassword(req, res) {
    const id = req.params.id;
    const token = req.params.token;
    try {
        const validuser = await userdb.findOne({ _id: id, verifytoken: token });
        const verifyToken = jwt.verify(token, Secret_key);
        if (validuser && verifyToken._id) {
            const newpassword = await bcrypt.hash(req.body.password, 12);
            const setnewpassword = await userdb.findByIdAndUpdate(id, {
                password: newpassword
            })
            await setnewpassword.save();
            res.status(200).json({ status: 200, setnewpassword })
        }
        else {
            res.status(401).json({ status: 401, "message": "user not exist" })
        }

    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
}

async function getAllColors(req, res) {
    try {
        const colors = await colorsschema.find({});
        if (colors) {
            res.status(200).json(colors)
        } else {
            res.status(400).json({ error: "No colors available" })
        }
    } catch (error) {
        res.status(400).json({ error: "Some error occured" });
    }
}

async function selectedColors(req, res) {
    try {
        const user = await userdb.findOne({ _id: req.userId });
        if (user) {
            // console.log(req.body.storedOptions);
            await user.addcolorsliked(req.body.storedOptions);
            await user.save();
            res.status(200).json(user);
        } else {
            res.status(400).json({ error: "invalid user" });
        }
    } catch (error) {
        res.status(400).json({ error: "error" });
    }
}

async function getuser(req, res) {
    try {
        const user = await userdb.findOne({ _id: req.userId });
        if (user) {
            if (user.colors_liked.length === 0 || user.topcolors_liked.length === 0 || user.bottomcolors_liked.length === 0 || (!user.payment || user.payment === 'false' || user.payment === 'undefined')) {
                // console.log('hello');
                return res.status(400).json({ message: 'Please fill the survey form ' });

            } else {
                res.status(200).json({ user: user });
            }
        } else {
            res.status(400).json({ error: "invalid user" });
        }
    } catch (error) {
        res.status(400).json({ error: error });
    }
}

async function checkout(req, res) {
    try {
        const user = await userdb.findOne({ _id: req.userId });
        if (user) {
            const addpaymentdata = await userdb.findByIdAndUpdate(user._id, {
                payment: req.body.payment
            },
                { new: true });
            // console.log(addpaymentdata)
            await user.save();
            res.status(200).json(user);
        } else {
            res.status(400).json({ error: "invalid user" });
        }
    } catch (error) {
        res.status(400).json({ error: "error occurred" });

    }
}

async function uploadImage(req, res) {
    try {
        const image = req.file;
        const params = {
            Bucket: 'capstone1bucket',
            Key: `images/${uuidv4()}-${image.originalname}`,
            Body: image.buffer
        };
        config.s3.upload(params, async (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to upload image' });
            } else {
                const imageUrl = data.Location;
                const products = await new productdb({
                    image: imageUrl,
                    dress_type: req.body.dress_type,
                    colors: JSON.parse(req.body.colors),
                    image_url: req.body.image_url,
                })
                await products.save();
                // Save the imageUrl and text in MongoDB here
                // Return the image URL back to the client
                res.status(200).json({ message: 'Image saved successfully' });
            }
        })
    } catch (error) {
        res.status(400).json({ error: error.message });

    }
}

async function suggestion(req, res) {
    try {
        let finduser = await userdb.findOne({ _id: req.userId });
        if (finduser) {
            let randomNumber = Math.floor(Math.random() * 2);
            let suggestionArray = [];
            let prodColorMap = await productsarray();
            // console.log(randomNumber);
            if (randomNumber == 0) {
                // console.log("hello")
                let toprandomNo = Math.floor(Math.random() * (finduser.topcolors_liked.length - 1));
                // console.log(toprandomNo);
                let topcolor = finduser.topcolors_liked[toprandomNo].name;
                // console.log(finduser.topcolors_liked)
                let randomNumber = Math.floor(Math.random() * (prodColorMap['tops-' + topcolor]?.length - 1));
                let suggested_top = prodColorMap['tops-' + topcolor][randomNumber];

                suggestionArray.push({ suggested_top: suggested_top });

                let bottomrandomno = Math.floor(Math.random() * (finduser.bottomcolors_liked.length - 1));
                let bottomcolor = finduser.bottomcolors_liked[bottomrandomno].name;
                randomNumber = Math.floor(Math.random() * (prodColorMap['bottoms-' + bottomcolor]?.length - 1));
                let suggested_bottom = prodColorMap['bottoms-' + bottomcolor][randomNumber];
                suggestionArray.push({ suggested_bottom: suggested_bottom });
            } else {
                let fullrandomno = Math.floor(Math.random() * (finduser.colors_liked.length - 1));
                let fullcolor = finduser.colors_liked[fullrandomno].name;
                let randomNumber = Math.floor(Math.random() * (prodColorMap['fulllength-' + fullcolor]?.length - 1));
                let suggested_full = prodColorMap['fulllength-' + fullcolor][randomNumber];
                suggestionArray.push({ suggested_full: suggested_full });
            }
            const today=new Date().toISOString().split('T')[0];
 
            if(finduser.suggestion_history?.[today]){
                return res.status(200).json({suggestionArray: finduser.suggestion_history[today],finduser});
            } else {
                if(!finduser.suggestion_history){
                    finduser.suggestion_history = {};
                }
                const newSuggestion=suggestionArray;

                finduser.suggestion_history={
                    ...finduser.suggestion_history,[today]:newSuggestion
                };
                await finduser.updateOne({_id:req.userId},{
                    $set:finduser
                })
                await finduser.save();
                return res.status(200).json({suggestionArray:finduser.suggestion_history[today],finduser})
            }
        }
    } catch (error) {
        return res.status(400).json(error);
    }
}

async function addLikeToProduct(req, res) {
    try {
        const product_id = req.body.product_id;
        const user_id = req.body.user_id;
        const find_product = await productdb.findOne({ _id: product_id });
        if (find_product.liked_users.includes(user_id)) {
            return res.status(400).json({ message:"Liked already"})
        }
        if (!find_product.liked_users.includes(user_id)) {
            let updated_product = await productdb.findByIdAndUpdate(find_product._id, { $push: { liked_users: user_id } }, { new: true });
            await userdb.findByIdAndUpdate(user_id,{$push :{liked_products: find_product._id}},{ new: true });
            await updated_product.save();
            return res.status(200).json(find_product);
        }
    } catch (error) {
        return res.status(400).json({ error: error });
    }
}

async function updatecolors(req,res){
    try {
        const user = await userdb.findOne({ _id: req.userId });
        if(user){
        user.colors_liked=req.body.storedOptions[0];
        user.topcolors_liked=req.body.storedOptions[1];
        user.bottomcolors_liked=req.body.storedOptions[2]
        await user.save();
           return res.status(200).json(user);
        } else {
            res.status(400).json({ error: "invalid user" });
        }
    } catch (error) {
        res.status(400).json({ error: error });
    }
}



module.exports = { registeruser, loginuser, validateUser, logoutUser, sendPasswordLink, verifyuser, changepassword, getAllColors, selectedColors, getuser, checkout, uploadImage, suggestion, addLikeToProduct,updatecolors }  