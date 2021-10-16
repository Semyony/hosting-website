
var express = require("express");
var app = express();
var hbs = require('express-handlebars');
const { lstat } = require("fs");

var HTTP_PORT = process.env.PORT || 8000;
var path = require("path");

var email = '';
var password = '';
var first_name = '';
var last_name = '';
var phone_number = '';
var company_name = '';
var street_address = '';
var street_address2 = '';
var city = '';
var state = '';
var postal_code = '';
var tax_id = '';
var confirmed_password = '';


function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));

app.engine('hbs', hbs({extname: "hbs", defaultLayout: false}));
app.set('views', './views');
app.set('view engine', 'hbs');

app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"/home.html"));
});

app.get("/plans", function(req,res){
    res.sendFile(path.join(__dirname,"/cwh.html"));
});

app.get("/login", function(req,res){
    res.sendFile(path.join(__dirname,"/login.html"));
    
});
app.get("/registration", function(req,res){
    res.sendFile(path.join(__dirname,"/registration.html"));
});

app.post("/login", function(req, res) {
    email = req.body.email;
    password = req.body.password;
    if(isValidString(email) && isValidString(password)){
        if (validateusername(email) && validatepass(password)){
            return res.redirect('/');
        } else {
            console.log("Wrong username/password")
            res.render('login', { usernamee : email, passwordd: password });
        }
    } else{
        console.log("Wrong username/password")
        res.render('login', { usernamee : email, passwordd: password });
    }
    
});

app.post("/register", function(req, res) {
    email = req.body.email;
    password = req.body.password;
    first_name = req.body.first_name;
    last_name = req.body.last_name;
    phone_number = req.body.phone_number;
    company_name = req.body.company_name;
    street_address = req.body.street_address;
    street_address2 = req.body.street_address2;
    city = req.body.city;
    state = req.body.state;
    postal_code = req.body.postal_code;
    tax_id = req.body.tax_id;
    confirmed_password = req.body.confirm_password;

    if(isValidString(email) && isValidString(password) 
    && isValidString(first_name) && isValidString(last_name) 
    && isValidString(phone_number)
    && isValidString(street_address) && isValidString(street_address2) 
    && isValidString(city) && isValidString(state) && isValidString(postal_code) && isValidString(confirmed_password)){
        if(password.length < 12 && password.length > 6) {
            if (validatepass(password)){
                if (validatephone(phone_number)){
                    
                    return res.render('home', { fname:first_name });;
                }
                else{
                    console.log(phone_number);
                    res.render('register', { error_message: "Phone Number should contain only digits", usernamee : email, passwordd: password , fname: first_name,
                lname: last_name, pnumber: phone_number, cname: company_name, address: street_address, address2: street_address2, city: city, state: state,
              postal_code: postal_code, tax_id : tax_id, confirmed_password: confirmed_password});
                }
            } else {
                
                res.render('register', { error_message: "Wrong password", usernamee : email, passwordd: password , fname: first_name,
                lname: last_name, pnumber: phone_number, cname: company_name, address: street_address, address2: street_address2, city: city, state: state,
              postal_code: postal_code, tax_id : tax_id, confirmed_password: confirmed_password});
            }
        } else{
            res.render('register', { error_message: "Password should contain 6 to 12 characters", usernamee : email, passwordd: password , fname: first_name,
                lname: last_name, pnumber: phone_number, cname: company_name, address: street_address, address2: street_address2, city: city, state: state,
              postal_code: postal_code, tax_id : tax_id, confirmed_password: confirmed_password});
        }
    }
    else{
        res.render('register', { error_message: "Please, fill all required field", usernamee : email, passwordd: password , fname: first_name,
        lname: last_name, pnumber: phone_number, cname: company_name, address: street_address, address2: street_address2, city: city, state: state,
      postal_code: postal_code, tax_id : tax_id, confirmed_password: confirmed_password});
    }
});

function validateusername(m_name) {
    letters = /^[a-zA-Z0-9]+$/;
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
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
