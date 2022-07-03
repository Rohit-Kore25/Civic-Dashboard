//jshint esversion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

require('dotenv/config');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/civicdashboardDB");

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalMongoose); //for hashing and salting of passwords

const issueSchema = new mongoose.Schema({
  Name:String,
  Location:String,
  Date:String,
  PhoneNum:Number,
  ProblemType:String,
  img:
    {
        data: Buffer,
        contentType: String
    },
  IssueDesc:String,
});

//to store the posted issue
const Issue = new mongoose.model('issue',issueSchema);

//to store users
const User = new mongoose.model("user",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const storage = multer.diskStorage({
  destination:(req,file,cb) => {
    cb(null,'uploads');
  },
  filename:(req,file,cb) => {
    cb(null,file.fieldname + '-' + Date.now());
  }
});

const upload = multer({storage:storage});

//The gets:
app.get("/",function(req,res){
  res.render("home",{title:"home"});
});

app.get("/areawisecomplaints",function(req,res){
  Issue.find({},function(err,foundissues){
    res.render("areacomplaints",{issues:foundissues,title:"areawisecomplaints"});
    //console.log(foundissues);
  });

});

app.get("/localcomplaints",function(req,res){
  Issue.find({},function(err,foundissues){
    res.render("localcomplaints",{issues:foundissues,title:"localcomplaints"});

  });
  // res.render("localcomplaints");
});

app.get("/reportproblem",function(req,res){
  //res.render("reportprob",{title:"Report Problem"});
  if(req.isAuthenticated()){
    res.render("reportprob",{title:"Report Problem"});
  }else{
    res.redirect("/login");
  }
});

app.get("/login",function(req,res){
  res.render("login",{title:"login",status:true});
});

app.get("/register",function(req,res){
  res.render("register",{title:"signup"});
});

app.get("/invalid",function(req,res){
  res.render("login",{title:"login",status:false});
});

//The posts:
app.post("/reportproblem",upload.single('image'),function(req,res){

  const issueToAdd = new Issue({
    Name:req.body.name,
    Location:req.body.location,
    Date:req.body.date,
    PhoneNum:req.body.phonenum,
    ProblemType:req.body.probtype,
    img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		},
    IssueDesc:req.body.desc,
  });

  issueToAdd.save();

  res.redirect("/areawisecomplaints");
});

app.post("/register",function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect('/register');
    }else{
      passport.authenticate('local',{failureRedirect:'/register'})(req,res,function(){
        res.redirect('/reportproblem');
      });
    }
  });
});

app.post("/login",function(req,res){
  const user = new User({
    username: req.body.username,
    password:req.body.password
  });



  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local",{failureRedirect:'/invalid'})(req,res,function(){
        res.redirect("/reportproblem");
      });
    }
  });
});

app.listen(process.env.PORT || 3000,function(){
  console.log("The server is up and running!");
});
