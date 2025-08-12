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
const today = new Date().toISOString().split('T')[0]; 
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
  let q3=`
  SELECT c.client_name, COUNT(cr.room_id) AS rooms, GROUP_CONCAT(r.room_number SEPARATOR ', ') AS room_numbers
  FROM checkins c
  JOIN checkin_rooms cr ON c.checkin_id = cr.checkin_id
  JOIN rooms r ON cr.room_id = r.room_id
  WHERE c.checkin_date = ?
  GROUP BY c.checkin_id
`;
let q4=`SELECT 
    c.client_name, 
    COUNT(cr.room_id) AS rooms,
    GROUP_CONCAT(r.room_number ORDER BY r.room_number) AS room_numbers
FROM checkins c
JOIN checkin_rooms cr ON c.checkin_id = cr.checkin_id
JOIN rooms r ON cr.room_id = r.room_id
WHERE DATE(c.checkout_date) = CURDATE()
GROUP BY c.checkin_id
`;
    


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

      connection.query(q3,[today],(error3,result3)=>{
        if(error3){
          console.error(error3);
        }
        let result=result3;

        connection.query(q4,[today],(error4,result4)=>{
          if(error4){
            console.error(error4);
          }
          console.log(result4);
          res.render('dashboard.ejs',{user:req.session.user,available,occupied,result,result4});


        })

        
        
        


      })
    
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

// From checkin-checkout branch
app.get('/checkin', (req, res) => {
  let q="select * from rooms where is_available = 'available' ";
  connection.query(q,(error,result)=>{
    
    res.render('checkin.ejs',{result});

  })
  
});

app.get('/checkout', (req, res) => {
  res.render('checkout.ejs');
});

app.get('/getwifi', (req, res) => {
  res.render('wifi.ejs');
});

// From main branch
app.get('/rooms',isAuthenticated, (req, res) => {
  res.render("addrooms.ejs");
});

app.post('/rooms', isAuthenticated, (req, res) => {
  let { room_number, room_type, status } = req.body;

  let q = "INSERT INTO rooms (room_number, room_type, is_available) VALUES (?,?,?)";
  connection.query(q, [room_number, room_type, status], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Database error: " + error.message);
    }
    res.send("Added successfully");
  });
});


//checkin logic
app.post("/checkin", isAuthenticated, (req, res) => {
    const {
        clientName, roomsAllotted, paxes, roomNo, mealPlan, checkinDate,
        checkoutDate, clientAddress, idProofType, idProofNo, otherIdText,
        beds, bookingFrom, bookedBy, notes
    } = req.body;

    // 1. Insert guest info into checkins table
    const insertCheckin = `
        INSERT INTO checkins
        (client_name, rooms_allotted, paxes, meal_plan, checkin_date, checkout_date,
         client_address, id_proof_type, id_proof_no, other_id_text, beds, booking_from, booked_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertCheckin, [
        clientName, roomsAllotted, paxes, mealPlan, checkinDate, checkoutDate,
        clientAddress, idProofType, idProofNo, otherIdText, beds, bookingFrom, bookedBy, notes
    ], (err, result) => {
        if (err) throw err;
        const checkinId = result.insertId; // Get the ID of the new check-in

        // 2. Assign each room to the check-in
      const roomNumbers = Array.isArray(roomNo) ? roomNo : [roomNo];

        roomNumbers.forEach(num => {
            // Get the room ID for the room number
            connection.query(`SELECT room_id FROM rooms WHERE room_number = ?`, [num], (err, rows) => {
                if (err) throw err;
                if (rows.length > 0) {
                    const roomId = rows[0].room_id;
                    
                    // Insert into checkin_rooms
                    connection.query(`INSERT INTO checkin_rooms (checkin_id, room_id) VALUES (?, ?)`, [checkinId, roomId]);

                    // Mark room as occupied
                    connection.query(`UPDATE rooms SET is_available = 'occupied' WHERE room_id = ?`, [roomId]);
                }
            });
        });

        res.redirect("/dashboard");
    });
});
