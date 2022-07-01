//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv/config');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/civicdashboardDB");

const issueSchema = new mongoose.Schema({
  Name:String,
  Location:String,
  Date:Date,
  PhoneNum:Number,
  ProblemType:String,
  img:
    {
        data: Buffer,
        contentType: String
    },
  IssueDesc:String,
});

const Issue = new mongoose.model('issue',issueSchema);

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
app.get("/areawisecomplaints",function(req,res){
  res.render("areacomplaints");
});

app.get("/localcomplaints",function(req,res){
  res.render("localcomplaints");
});

app.get("/reportproblem",function(req,res){
  res.render("reportprob");
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
});

app.listen(process.env.PORT || 3000,function(){
  console.log("The server is up and running!");
});
