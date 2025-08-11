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
const session=require('express-session');
const { error } = require('console');
const { stat } = require('fs');
app.use(session({
  secret:"Stu@7890",
  resave:false,
  saveUninitialized:false
  
}));
//middlewares
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}
function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.session.user || !allowedRoles.includes(req.session.user.role)) {
      return res.status(403).send('Access Denied');
    }
    next();
  };
}


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
  let q="select * from user where username = ? and password= ? ";
  connection.query(q,[username,password],(error,result)=>{
    if(error){
      res.send("db error")
    }
    else if(result.length===0){
      return res.send("invalid username or password or role");
    }
  
      let user=result[0];
      req.session.user={
        username:user.username,
        role:user.role
      };
      res.redirect('/dashboard')
      
    
    
  })
})

app.get('/dashboard',isAuthenticated,(req,res)=>{
  let ava="available";
  let occ="occupied";

  let q="select count(room_number) AS available from rooms where is_available=?";
  let q2="select count(room_number) AS occupied from rooms where is_available=?";

  connection.query(q,[ava],(error,result)=>{
    if(error){
      console.error("db error",error);

    }
    let available=result[0].available;
    console.log(available)

    connection.query(q2,[occ],(error2,result2)=>{
      if(error2){
        console.error('db error' ,error2);
      }
      let occupied=result2[0].occupied;
    res.render('dashboard.ejs',{user:req.session.user,available,occupied});

    })

  })
   
 
  
})


app.post('/logout',(req,res)=>{
  req.session.destroy(err=>{
    if(err){
      return res.status(500).send("Try again");

    }
    res.clearCookie('connect.sid');
    res.redirect('/login');

  })
})

app.get('/rooms',(req,res)=>{
  res.render("addrooms.ejs");
})

app.post('/rooms',(req,res)=>{
  let{room_number,room_type,status}=req.body;
  
  let q="insert into rooms (room_number,room_type,is_available) values (?,?,?)";
  connection.query(q,[room_number,room_type,status],(error,result)=>{
    
      if (error) {
  console.error(error); // log exact MySQL error
  return res.status(500).send("Database error: " + error.message);


      

    }
    
    res.send("Added succesfully");
  })
  
})