const express = require('express');
const app = express();
const mongoose = require("mongoose")
app.use(express.json());


const mongoURL ="mongodb+srv://admin2:admin1234@cluster0.qaxcon8.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(mongoURL,{
    useNewUrlParser:true
}).then(()=>{console.log("Connected to database");})
.catch(e=>console.log(e))


app.listen(5000,()=>{

console.log("Server started")
});

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
const User = mongoose.model("UserInfo");
app.post("/register", async (req,res) => {
    const{name, email , mobileNo} = req.body;
    try{
    await User.create({
    uname:name,
    email,
    phoneNo:mobileNo
});
res.send({status:"ok"});
    }catch (error)  {
        res.send({status:"error"})
    }
});




