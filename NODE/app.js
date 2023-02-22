const express = require('express');
const app = express();
const mongoose = require("mongoose")
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false}));
//app.use(express.urlencoded({ extended: true, parameterLimit:100000,limit:"500mb"}));
//app.use(bodyParser.urlencoded({ extended: true, parameterLimit:100000,limit:"500mb"}));
//app.use(express.json());
//app.use(express.limit(10000000))



const jwt = require("jsonwebtoken")
const jwt_SECRET = "hjlcxzvnkpivcvkccgiprgvklcg5tpgrigklxcvjiprgnk";

var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');



const mongoURL ="mongodb+srv://admin2:admin1234@cluster0.qaxcon8.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(mongoURL,{
    useNewUrlParser:true
}).then(()=>{console.log("Connected to database");})
.catch(e=>console.log(e))




app.post("/post", async (req, res) => {
    console.log(req.body)
    const {data} = req.body;

    try{
        if (data == "atunde") {
            res.send({ status: "ok "});
        }else {
            res.send({ status: "User Not found"});
        }
    }catch (error) {
        res.send ({ status: " something went wrong try again"})
    }        
    
  });


require("./userDetails")
require("./imageDetails")
const User = mongoose.model("UserInfo");
const Images = mongoose.model("ImageDetails");

app.post("/register", async (req,res) => {
    const{fname, lname , email, password} = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    try{
        const oldUser = await User.findOne({ email });
        if(oldUser) {
           return res.send({error: "User Exist"});
        }
    await User.create({
    fname,
    lname,
    email,
    password: encryptedPassword,
});
res.send({status:"ok"});
    }catch (error)  {
        res.send({status:"error"})
    }
});


app.post("/login-user", async (req , res) => {
    const{ email, password} = req.body;

    const user = await User.findOne({ email });
    if(!user) {
        return res.json({error: "User Not Found"});
     }
     if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({email:user.email}, jwt_SECRET, {
            expiresIn:10,
        });
        console.log(token)
       
        if(res.status(201)) {
            return res.json({ status: "ok", data: token});
        }else{
            return res.json({ error: "error"});
        }
     }
     res.json( {status: "error", error: "INVALID PASSWORD"})
});



app.post("/userData", async (req , res) => {
const { token } = req.body;
try{
    const user = jwt.verify(token, jwt_SECRET, (err,res) => {
        if (err){ 
            return "token expired";
        }
        return res;
    });

    console.log(user)
    if(user == "token expired") {
    return res.send({status: "error", data: "token expired"})    
    }

    const useremail = user.email;
    console.log(useremail);
    User.findOne({ email: useremail })
    .then((data) => {
        res.send({ status:"ok", data: data});
        console.log(token)
    })
    .catch((error) => {
        res.send({ status: "error", data: error });
    });
} catch (error) {}
});



app.post("/forget-password", async (req, res) => {
    const { email } = req.body ;
    try {
        const oldUser = await User.findOne({ email });
        if(!oldUser){
            return res.json({status: "User Not Exist !"});
        }
    const secret = jwt_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id:oldUser._id }, secret, {
        expiresIn: "5m",
    });
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'atundepeter@gmail.com',
          pass: 'kieewdblrzsyrchk'
        }
      });
      
      var mailOptions = {
        from: 'atundepeter@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: link,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

    console.log(link);
    } catch (error) {
        
    }
});

app.get('/reset-password/:id/:token' , async (req, res) => {
    const{id, token} = req.params;
    console.log(req.params);
    const oldUser = await User.findOne({ _id:id });
        if(!oldUser){
            return res.json({status: "User Not Exist !"});
        }
        const secret = jwt_SECRET + oldUser.password;
        try {
            const verify = jwt.verify(token, secret)
            res.render("index", {email:verify.email , status:"Not verified"})
        } catch (error) {
            res.send("Not Verified")
        }
})

app.post('/reset-password/:id/:token' , async (req, res) => {
    const{id, token} = req.params;
    const{ password } = req.body;
    const oldUser = await User.findOne({ _id:id });
        if(!oldUser){
            return res.json({status: "User Not Exist !"});
        }
        const secret = jwt_SECRET + oldUser.password;
        try {
            const verify = jwt.verify(token, secret)
            const encryptedPassword = await bcrypt.hash(password, 10)
            await User.updateOne(
            {
                _id:id,
            },
            {
                $set: {password:encryptedPassword,},
            } 
         )
           // res.send({status: "Password Updated"})
            res.render("success", {email: verify.email, status:"verified"})
        } catch (error) {
            res.send({status: " Something Went Wrong"})
        }
})


app.post("/upload-image" , async(req, res) => {
    const { base64 } = req.body;
    try {
      await Images.create({image:base64});
        res.send({ status:ok})

    } catch (error) {
        res.send({ status:"error", data:error})
    }
})






app.listen(5000,()=>{

    console.log("Server started")
    });

 