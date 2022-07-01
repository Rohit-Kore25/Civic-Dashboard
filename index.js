//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/civicdashboardDB");

app.get("/areawisecomplaints",function(req,res){
  res.render("areacomplaints");
});

app.get("/localcomplaints",function(req,res){
  res.render("localcomplaints");
});

app.get("/reportproblem",function(req,res){
  res.render("reportprob");
});

app.listen(process.env.PORT || 3000,function(){
  console.log("The server is up and running!");
});
