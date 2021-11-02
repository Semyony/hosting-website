
var express = require("express");
var app = express();
var hbs = require('express-handlebars');
const {pool} = require('./databaseConfig');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
var path = require("path");
require("dotenv").config();


const initializePassport = require("./loginConfig");
initializePassport(passport);

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.use(flash());

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
  }
  

app.engine('hbs', hbs({extname: "hbs", defaultLayout: false}));
app.set('views', './views');
app.set('view engine', 'hbs');


app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"/home.html"));
});

app.get("/plans", function(req,res){
    res.sendFile(path.join(__dirname,"/cwh.html"));
});

app.get("/login",  checkAuthenticated, function(req,res){
    res.render('login');
    
});
app.get("/registration", function(req,res){
    res.sendFile(path.join(__dirname,"/registration.html"));
});


 app.post("/login", passport.authenticate("local", {
     successRedirect: "dashboard",
     failureRedirect: "login", 
     failureFlash: true
    })
 );

 app.get("/dashboard", checkNotAuthenticated, (req, res) => {
    console.log(req.isAuthenticated());
    res.render("dashboard", {name: req.user.first_name});
  });

app.post("/register", function(req, res) {
    let {email, password, first_name, last_name, phone_number, company_name, street_address, street_address2,
    city, state, postal_code, tax_id, confirmed_password} = req.body;
    let errormess = "";
    if(!email || !password || !first_name || !last_name || !phone_number || !company_name || !street_address || !street_address2 || !city || !state || !postal_code || !tax_id || !confirmed_password){
        errormess = "Please, fill all required field!";
    } else if(password.length > 12 || password.length < 6) {
        errormess = "Password must contain 6 to 12 characters!";
    }else if (validatepass(password) == false){
        errormess = "Wrong password! Password must have only letter and digits!";
    } else if (validateusername(email) == false){
        errormess = "Wrong email!";
    } else if (validatephone(phone_number) == false){
        errormess = "Phone Number should contain only digits!";
    } else if (password != confirmed_password){
        errormess = "Passwords does not match!";
    } 

    if(errormess){
        res.render('register', { error_message: errormess, usernamee : email, passwordd: password , fname: first_name,
        lname: last_name, pnumber: phone_number, cname: company_name, address: street_address, address2: street_address2, city: city, state: state,
        postal_code: postal_code, tax_id : tax_id, confirmed_password: confirmed_password});
    }
    else{
        pool.query(
            `SELECT * FROM wuser
            WHERE email = $1`, [email], (err, results) =>{
                if(err){
                    throw err;
                }
                const wuser = results.rows[0];
                console.log(results.rows);
                console.log(111111);
                console.log(wuser);
                if(results.rows.length > 0){
                    errormess = "Email registered";
                    res.render('register', { error_message: errormess, usernamee : email, passwordd: password , fname: first_name,
                    lname: last_name, pnumber: phone_number, cname: company_name, address: street_address, address2: street_address2, city: city, state: state,
                    postal_code: postal_code, tax_id : tax_id, confirmed_password: confirmed_password});
                } else {
                    pool.query(
                        `INSERT INTO wuser (email, password, first_name, last_name, phone_number, 
                        company_name, street_address, street_address2, city, state, postal_code, tax_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, 
                        [email, password, first_name, last_name, phone_number, company_name, street_address, street_address2,
                        city, state, postal_code, tax_id], (err, results) => {
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            return res.render('home', { fname:first_name });
                        }
                    )
                }
            }
            
        )

    }
});

function validateusername(m_name) {
    letters = /\S+@\S+\.\S+/;
    if(m_name.match(letters)){
        return true;
    } else{
        return false;
    }
}
function validatepass(password) {
    letters = /^[a-zA-Z0-9]+$/;
    if(password.match(letters)){
        return true;
    } else{
        return false;
    }
}
function validatephone(phone) {
    digits = /^[0-9]+$/;
    if(phone.match(digits)){
        return true;
    } else{
        return false;
    }
}
function isValidString(str1) {
    return str1 != null && str1.length > 0;
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  }
// setup http server to listen on HTTP_PORT
app.listen(process.env.PORT || 3000, onHttpStart);
