const express=require("express");
const app=express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const env=require("dotenv").config();
mongoose.connect(process.env.DB_URL);

let schema={
    user:String,
    title: String,
    content: String
};

let userSchema={
    name:String,
    password:String
};

const Blog=mongoose.model("Blog",schema);
const User=mongoose.model("User",userSchema);

let currentUser="";

let updateID=0;

app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/",function(req,res){
    (async function getData(){
        let tempObject=await Blog.find({});
        let size=tempObject.length;
        if(size!=0)
            res.render("blog",{postTitle: tempObject[size-1].title,postContent: tempObject[size-1].content,Name:tempObject[size-1].user});
        else
        res.render("blog",{postTitle: "No Posts",postContent:"No Content Available",Name:"Name"});
    })();
});

app.get("/compose",function(req,res){
    res.render("compose");
});

let check=0;

app.get("/security",function(req,res){
    if(check==1)
        res.redirect("compose");
    else
        res.render("security");
})

app.get("/all",function(req,res){
    (async function getData(){
        let tempObject=await Blog.find({});
        // console.log(tempObject);
        let size=tempObject.length;
        if(size!=0)
            res.render("all",{arrays:tempObject});
        else
            res.render("all",{arrays: [{title: "No Post",content:"No Content",Name:"Name"}]});
    })();
});

app.get("/modify",function(req,res){
    (async function getData(){
        let tempObject=await Blog.find({user:currentUser});
        let size=tempObject.length;
        // console.log(tempObject);
        if(size!=0)
            res.render("modify",{arrays:tempObject});
        else
            res.render("modify",{arrays: [{title: "No Post",content:"No Content"}]});
    })();
});

app.get("/update",function(req,res){
    (async function getData(){
        let tempObject=await Blog.findById(updateID);
        // console.log(tempObject);
        if(tempObject!=null)
            res.render("update",{editTitle:tempObject.title,editContent:tempObject.content});
        else
            res.render("modify",{arrays: [{title: "No Post",content:"No Content"}]});
        })();
});

app.get("/signup",function(req,res){
    res.render("signup")
});

app.get("/error",function(req,res){
    res.render("error");
});

app.get("/users",function(req,res){
    if(check==0)
    res.render("users");
    else    
    res.render("profile",{Name:currentUser})
});

app.get("/profile",function(req,res){
    res.render("profile",{Name:currentUser});
});

app.post("/compose",function(req,res){
    const username=req.body.username;
    const password= req.body.password;
    (async function checkUser(){
        const userData=await User.findOne({name:username});
        // console.log(userData)
        if(userData!=null && userData.name==username && password==userData.password){
            check=1;
            currentUser=username;
           res.redirect("/compose");
        }
        else{
            res.redirect("/security");
        }
    })();
});

app.post("/posts",function(req,res){
    const title=req.body.title;
    const content=req.body.content;
    const blog=new Blog({
        user:currentUser,
        title:title,
        content:content        
    });
    blog.save();
    // console.log(title,content);
    res.redirect("/");

});

app.post("/delete",function(req,res){
    const deleteID=req.body.deleteOption;
    Blog.findByIdAndRemove(deleteID)
    .then(()=>{
        res.redirect("/modify");
    })
    .catch(()=>{
        res.redirect("/modify")
    });
});

app.post("/update",function(req,res){
    updateID=req.body.updateOption;
    // console.log(updateID);
    res.redirect("/update");

});

app.post("/updated",function(req,res){
    const editTitle=req.body.editTitle;
    const editContent=req.body.editContent;
    Blog.findByIdAndUpdate(updateID,{$set: {title:editTitle,content:editContent}}).then();
    res.redirect("/modify");
});

app.post("/create",function(req,res){
    const name=req.body.newUser;
    const password=req.body.newPassword;
    const user=new User({
        name:name,
        password:password
    });
    (async function checkUser(){
        const userData=await User.findOne({name:name});
        if(userData==null){
            user.save();
            res.redirect("/security");
        }
        else{
            res.redirect("/error");
        }
    })();
});

app.post("/users",function(req,res){
    const profileName=req.body.profileName;
    const profilePassword= req.body.profilePassword;
    (async function checkUser(){
        userData=await User.findOne({name:profileName});
        // console.log(userData)
        if(userData!=null && userData.name==profileName && profilePassword==userData.password){
            currentUser=profileName;
            check=1;
            res.redirect("/profile");
        }
        else{
            res.redirect("/users");
        }
    })();
});

app.post("/logout",function(req,res){
    check=0;
    currentUser="";
    res.redirect("/");
});

app.post("/myPosts",function(req,res){
    (async function displayPosts(){
        let data=await Blog.find({user: currentUser});
        if(data.length!=0)
            res.render("all",{arrays:data});
        else
            res.render("all",{arrays: [{title: "No Post",content:"No Content"}]});
    })();
});

app.post("/modify",function(req,res){
    (async function displayPosts(){
        let data=await Blog.find({user: currentUser});
        let size=data.length;
        if(size!=0)
            res.render("modify",{arrays:data});
        else
            res.render("modify",{arrays: [{title: "No Post",content:"No Content"}]});
    })();
});
app.listen(3000,function(){
    console.log("server set at port 3000");
})