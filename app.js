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

const { render } = require('ejs');
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

app.get('/checkout-list',isAuthenticated, (req, res) => {
  const sql = `
    SELECT 
      c.checkin_id,
      c.client_name,
      COUNT(cr.room_id) AS total_rooms,
      GROUP_CONCAT(r.room_number ORDER BY r.room_number SEPARATOR ', ') AS room_numbers,
      c.checkin_date,
      c.checkout_date
    FROM checkins c
    JOIN checkin_rooms cr ON c.checkin_id = cr.checkin_id
    JOIN rooms r ON cr.room_id = r.room_id
    WHERE c.status = 'active' AND DATE(c.checkout_date) <= CURDATE()
    GROUP BY c.checkin_id
    ORDER BY c.checkout_date ASC;
  `;
  connection.query(sql, (err, rows) => {
    if (err) { console.error(err); return res.status(500).send("DB error"); }
    res.render('checkout-list.ejs', { bookings: rows, user: req.session.user });
  });

});
app.get('/checkout/:id', isAuthenticated, (req, res) => {
  const checkinId = req.params.id;
  const sql = `
    SELECT 
      c.checkin_id, c.client_name, c.checkin_date, c.checkout_date, c.rooms_allotted, c.paxes, c.notes,
      GROUP_CONCAT(r.room_number ORDER BY r.room_number SEPARATOR ', ') AS room_numbers,
      COUNT(r.room_id) AS total_rooms
    FROM checkins c
    JOIN checkin_rooms cr ON c.checkin_id = cr.checkin_id
    JOIN rooms r ON cr.room_id = r.room_id
    WHERE c.checkin_id = ?
    GROUP BY c.checkin_id
  `;
  connection.query(sql, [checkinId], (err, rows) => {
    if (err) { console.error(err); return res.status(500).send('DB error'); }
    if (!rows.length) return res.status(404).send('Booking not found');
    const booking = rows[0];
    res.render('checkout.ejs', { booking, user: req.session.user });
  });
});
app.post('/checkout/:id', isAuthenticated, (req, res) => {
  const checkinId = req.params.id;
  const { extra_services, pending_payments, payment_method, remarks } = req.body;

  // Start transaction
  connection.beginTransaction(err => {
    if (err) { console.error(err); return res.status(500).send("DB error"); }

    // 1) Ensure booking active (optional)
    const checkSql = "SELECT status FROM checkins WHERE checkin_id = ? FOR UPDATE";
    connection.query(checkSql, [checkinId], (err, rows) => {
      if (err) return connection.rollback(() => { console.error(err); res.status(500).send("DB error"); });
      if (!rows.length) return connection.rollback(() => res.status(404).send("Booking not found"));
      if (rows[0].status === 'checked_out') {
        return connection.rollback(() => res.status(400).send("Already checked out"));
      }

      // 2) Update checkin status (and optionally update checkout_date to now)
      const updateCheckin = `
        UPDATE checkins SET status = 'checked_out', checkout_date = COALESCE(checkout_date, CURDATE()) WHERE checkin_id = ?
      `;
      connection.query(updateCheckin, [checkinId], (err2) => {
        if (err2) return connection.rollback(() => { console.error(err2); res.status(500).send("DB error"); });

        // 3) Free rooms
        const freeRooms = `
          UPDATE rooms 
          SET is_available = 'available' 
          WHERE room_id IN (SELECT room_id FROM checkin_rooms WHERE checkin_id = ?)
        `;
        connection.query(freeRooms, [checkinId], (err3) => {
          if (err3) return connection.rollback(() => { console.error(err3); res.status(500).send("DB error"); });

          // Optionally store checkout meta on checkins (extra services/pending etc)
          const updateMeta = `
            UPDATE checkins SET notes = CONCAT(IFNULL(notes,''), '\nCheckout notes: ', ?), created_at = created_at WHERE checkin_id = ?
          `;
          connection.query(updateMeta, [`Extra: ${extra_services}; Pending: ${pending_payments}; Payment: ${payment_method}; Remarks: ${remarks}`, checkinId], (err4) => {
            if (err4) return connection.rollback(() => { console.error(err4); res.status(500).send("DB error"); });

            // Commit
            connection.commit(err5 => {
              if (err5) return connection.rollback(() => { console.error(err5); res.status(500).send("DB error"); });
              // Redirect to invoice creation page (let user calculate/confirm charges)
              res.redirect(`/invoice/create/${checkinId}`);
            });
          });
        });
      });
    });
  });
});
app.get('/invoice/create/:id', isAuthenticated, (req, res) => {
  const checkinId = req.params.id;
  const sql = `
    SELECT 
  c.checkin_id,
  c.client_name,
  c.checkin_date,
  c.checkout_date,
  c.paxes,
  c.meal_plan,
  GROUP_CONCAT(r.room_number ORDER BY r.room_number SEPARATOR ', ') AS room_numbers,
  COUNT(r.room_id) AS total_rooms
FROM checkins c
JOIN checkin_rooms cr ON c.checkin_id = cr.checkin_id
JOIN rooms r ON cr.room_id = r.room_id
WHERE c.checkin_id = ?
GROUP BY c.checkin_id;

  `;
  connection.query(sql, [checkinId], (err, rows) => {
    if (err) { console.error(err); return res.status(500).send("DB error"); }
    if (!rows.length) return res.status(404).send("Booking not found");
    const b = rows[0];

    // compute nights (at least 1)
    const checkinDate = new Date(b.checkin_date);
    const checkoutDate = new Date(b.checkout_date);
    let nights = Math.max(1, Math.round((checkoutDate - checkinDate) / (24*60*60*1000)));
    // default room_charges = sum_room_rate * nights
    const room_charges = (b.sum_room_rate || 0) * nights;

    res.render('invoice-create.ejs', { booking: b, nights, room_charges });
  });
});
app.post('/invoice/create/:id', isAuthenticated, (req, res) => {
  const checkinId = req.params.id;
  const { room_charges = 0, meal_charges = 0, other_charges = 0, paid_amount = 0, payment_method = '', notes = '' } = req.body;

  // total
  const total = parseFloat(room_charges) + parseFloat(meal_charges) + parseFloat(other_charges);
  const invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${checkinId}`;

  // get basic client info for snapshot
  const clientSql = `SELECT client_name, rooms_allotted, paxes, meal_plan, checkin_date, checkout_date FROM checkins WHERE checkin_id = ?`;
  connection.query(clientSql, [checkinId], (err, rows) => {
    if (err) { console.error(err); return res.status(500).send('DB error'); }
    if (!rows.length) return res.status(404).send('Booking not found');
    const c = rows[0];

    const insertSql = `
      INSERT INTO invoices (
        checkin_id, invoice_number, client_name, rooms_allotted, paxes, meal_plan,
        checkin_date, checkout_date, room_charges, meal_charges, other_charges,
        total_amount, paid_amount, payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(insertSql, [
      checkinId, invoiceNumber, c.client_name, c.rooms_allotted, c.paxes, c.meal_plan,
      c.checkin_date, c.checkout_date, room_charges, meal_charges, other_charges,
      total, paid_amount, payment_method, notes
    ], (err2, result) => {
      if (err2) { console.error(err2); return res.status(500).send('DB error'); }
      const invoiceId = result.insertId;
      res.redirect(`/invoice/${invoiceId}`);
    });
  });
});
app.get('/invoice/:id', isAuthenticated, (req, res) => {
  const sql = `
SELECT 
  i.*, 
  c.booking_from, 
  c.booked_by
FROM invoices i
LEFT JOIN checkins c ON i.checkin_id = c.checkin_id
WHERE i.invoice_id = ?;`;
  
  connection.query(sql, [req.params.id], (err, rows) => {
    if (err) { console.error(err); return res.status(500).send("DB error"); }
    if (!rows.length) return res.status(404).send("Invoice not found");
    res.render('invoice-view.ejs', { invoice: rows[0] });
  });
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


// checkin logic
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

// attendance route from main branch
app.get("/attendance", (req, res) => {
    res.render("attendance.ejs");
});

