const express=require('express');
const app=express();
const port=8080;
const mysql = require("mysql2");
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "stayelite",
  password: "Stu@7890",
});
app.listen(port,()=>{
    console.log("server is working on port 8080");
})
app.get('/login',(req,res)=>{
  res.render('login.ejs');
})
app.post('/login',(req,res)=>{
  let {username,password,role}=req.body;
  let q="select * from user where username = ? and password= ? and role= ?";
  connection.query(q,[username,password,role],(error,result)=>{
    if(error){
      res.send("db error")
    }
    else if(result.length===0){
      res.send("invalid username or password");
    }
    if(result.length>0){
      let user=result[0];
      res.render('dashboard.ejs',{user});
    }
    
  })
})