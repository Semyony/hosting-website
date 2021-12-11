var express = require("express");
var app = express();
var router = express.Router();
var hbs = require('express-handlebars');
const {
    pool
} = require('./databaseConfig');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
var path = require("path");
require("dotenv").config();
const HTTP_PORT = process.env.PORT || 8000;

const initializePassport = require("./loginConfig");
initializePassport(passport);

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({
    extended: true
}));

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


app.engine('hbs', hbs({
    extname: "hbs",
    defaultLayout: false
}));
app.set('views', './views');
app.set('view engine', 'hbs');


app.get("/", checkHome, function (req, res) {
    res.render('home_logined');
});

app.get("/plans", function (req, res) {
    pool.query(
        `SELECT * FROM wpackage`, (err, results) => {
            let rows = results.rows;
            res.render('plans', {
                rows
            });
        }
    )


});

app.get("/login", checkAuthenticated, function (req, res) {
    res.render('login');

});
app.get("/register", function (req, res) {
    res.render('register');
});


app.get("/accountinfo", checkNotAuthenticated, (req, res) => {
    if (req.user.role == "a") {
        res.render("dash_ainfo");
    } else {
        res.render("dash_cinfo");
    }
});

app.get("/dashboard", checkNotAuthenticated, (req, res) => {
    console.log(req.isAuthenticated());
    console.log(req.user.first_name);
    if (req.user.role == "a") {
        res.render("dashboard_admin", {
            name: req.user.first_name,
            lastn: req.user.last_name,
            email: req.user.email,
            phone: req.user.phone_number
        });
    } else {
        res.render("dashboard_client", {
            name: req.user.first_name,
            lastn: req.user.last_name,
            email: req.user.email,
            phone: req.user.phone_number
        });
    }

});

app.get("/addpackage", checkNotAuthenticated, (req, res) => {
    if (req.user.role == "a") {
        res.render("dashboard_addpackage");
    } else {
        res.render("login");
    }

});

app.get("/cart", checkNotAuthenticated, (req, res) => {
    pool.query(
        `SELECT cart_pack FROM wuser WHERE id = $1`, [req.user.id], (err, results) => {
            console.log(results.rows[0])
            if(!results.rows[0].cart_pack ){ 
                res.render("empty_cart");
            } else{
                pool.query(
                    `SELECT * FROM wpackage WHERE id = $1`, [results.rows[0].cart_pack], (err, results) => {
                        
                            
                            let rows1 = results.rows;
                            price20 = rows1[0].m_price * 0.80;
                            price30 = rows1[0].m_price * 0.70;
                            price40 = rows1[0].m_price * 0.60;
                            res.render("cart", {
                            obj: rows1[0], price20:price20.toPrecision(3), price30:price30.toPrecision(3), price40:price40.toPrecision(3)
                        });
                    
                    })
                }
            }
            
        
    )

});

app.get("/editpackage", checkNotAuthenticated, (req, res) => {
    if (req.user.role == "a") {
        pool.query(
            `SELECT * FROM wpackage`, (err, results) => {
                let rows = results.rows;

                res.render('dashboard_editpackage', {
                    rows
                });
            }
        )
    } else {
        res.render("login");
    }

});
app.get("/editpackage/:id", checkNotAuthenticated, function (req, res) {
    pool.query(
        `SELECT * FROM wpackage WHERE id = $1`, [req.params.id], (err, results) => {
            var idd = 0;
            if (err) {}
            res.render('editpackage', results.rows[0]);
        });
});
app.get("/delete/:id", checkNotAuthenticated, function (req, res) {
    pool.query(
        `DELETE FROM wpackage where id =  $1`, [req.params.id], (err, results) => {
            res.redirect('/editpackage');

        });
});
app.get("/logout", function (req, res) {
    req.logOut();
    res.render('login');
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "dashboard",
    failureRedirect: "login",
    failureFlash: true
}));

app.post("/register", function (req, res) {
    let {
        email,
        password,
        first_name,
        last_name,
        phone_number,
        company_name,
        street_address,
        street_address2,
        city,
        state,
        postal_code,
        tax_id,
        confirmed_password
    } = req.body;
    let errormess = "";
    if (!email || !password || !first_name || !last_name || !phone_number || !company_name || !street_address || !street_address2 || !city || !state || !postal_code || !tax_id || !confirmed_password) {
        errormess = "Please, fill all required field!";
    } else if (password.length > 12 || password.length < 6) {
        errormess = "Password must contain 6 to 12 characters!";
    } else if (validatepass(password) == false) {
        errormess = "Wrong password! Password must have only letter and digits!";
    } else if (validateusername(email) == false) {
        errormess = "Wrong email!";
    } else if (validatephone(phone_number) == false) {
        errormess = "Phone Number should contain only digits!";
    } else if (password != confirmed_password) {
        errormess = "Passwords does not match!";
    }

    if (errormess) {
        res.render('register', {
            error_message: errormess,
            usernamee: email,
            passwordd: password,
            fname: first_name,
            lname: last_name,
            pnumber: phone_number,
            cname: company_name,
            address: street_address,
            address2: street_address2,
            city: city,
            state: state,
            postal_code: postal_code,
            tax_id: tax_id,
            confirmed_password: confirmed_password
        });
    } else {
        pool.query(
            `SELECT * FROM wuser
            WHERE email = $1`, [email], (err, results) => {
                if (err) {
                    throw err;
                }
                const wuser = results.rows[0];
                console.log(results.rows);
                console.log(111111);
                console.log(wuser);
                if (results.rows.length > 0) {
                    errormess = "Email registered";
                    res.render('register', {
                        error_message: errormess,
                        usernamee: email,
                        passwordd: password,
                        fname: first_name,
                        lname: last_name,
                        pnumber: phone_number,
                        cname: company_name,
                        address: street_address,
                        address2: street_address2,
                        city: city,
                        state: state,
                        postal_code: postal_code,
                        tax_id: tax_id,
                        confirmed_password: confirmed_password
                    });
                } else {
                    pool.query(
                        `INSERT INTO wuser (email, password, first_name, last_name, phone_number, 
                        company_name, street_address, street_address2, city, state, postal_code, tax_id, role)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                        [email, password, first_name, last_name, phone_number, company_name, street_address, street_address2,
                            city, state, postal_code, tax_id, "c"
                        ], (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            return res.render('login', {
                                email: email
                            });
                        }
                    )
                }
            }

        )

    }
});

app.post("/addpackage", function (req, res) {
    let {
        name,
        price,
        description,
        feature1,
        feature2,
        feature3,
        feature4,
        feature5,
        feature6,
        feature7,
        feature8,
        feature9,
        feature10
    } = req.body;
    let errormess = "";
    if (!name || !price || !description || !feature1) {
        errormess = "Please, fill all required field!";
    } else if (isNaN(parseFloat(price))) {
        errormess = "In price field enter float number!";
    }

    if (errormess) {
        res.render("dashboard_addpackage", {
            errorm: errormess
        });
    } else {
        var id = 0;

        id = fetchID(function (err, data) {
            if (err) {
                // error handling code goes here
                console.log("ERROR : ", err);
            } else {
                data++;
                pool.query(
                    `INSERT INTO wpackage (m_name, m_price, m_desc, feature1, feature2, feature3, feature4,
                        feature5, feature6, feature7, feature8, feature9, feature10, id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                    [name, price, description, feature1, feature2, feature3, feature4,
                        feature5, feature6, feature7, feature8, feature9, feature10, data
                    ], (err, results) => {
                        if (err) {
                            throw err;
                        }
                        pool.query(
                            `SELECT * FROM wpackage`, (err, results) => {
                                if (err) {
                                    throw err;
                                }
                                console.log(results.rows);
                                res.redirect("/addpackage");
                            }
                        )
                    }
                )
            }

        });

    }


});

app.post("/editpackage/:id", function (req, res) {
    let {
        name,
        price,
        description,
        feature1,
        feature2,
        feature3,
        feature4,
        feature5,
        feature6,
        feature7,
        feature8,
        feature9,
        feature10
    } = req.body;
    let errormess = "";
    if (!name || !price || !description || !feature1) {
        errormess = "Please, fill all required field!";
    } else if (isNaN(parseFloat(price))) {
        errormess = "In price field enter float number!";
    }

    if (errormess) {
        res.render("/editpackage");
    } else {
        pool.query(
            `UPDATE wpackage SET m_name = $1, m_price = $2, m_desc = $3, feature1 = $4, feature2 = $5, 
            feature3 = $6, feature4 = $7, feature5 = $8, feature6 = $9, feature7 = $10, feature8 = $11,
            feature9 = $12, feature10 = $13 WHERE id = $14;`,
            [name, price, description, feature1, feature2, feature3, feature4,
                feature5, feature6, feature7, feature8, feature9, feature10, req.params.id
            ], (err, results) => {
                if (err) {
                    throw err;
                }
                pool.query(
                    `SELECT * FROM wpackage ORDER BY id DESC`, (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log(results.rows);
                        res.redirect("/editpackage");
                    }
                )
            }
        )
    }




});

app.post("/add_cart/:id", checkNotAuthenticated, function (req, res) {
    pool.query(
        `UPDATE wuser SET cart_pack = $1 WHERE id = $2;`,
        [req.params.id, req.user.id], (err, results) => {
            if (err) {
                throw err;
            }
            res.redirect("/plans");
        }
    )

});

function validateusername(m_name) {
    letters = /\S+@\S+\.\S+/;
    if (m_name.match(letters)) {
        return true;
    } else {
        return false;
    }
}

function validatepass(password) {
    letters = /^[a-zA-Z0-9]+$/;
    if (password.match(letters)) {
        return true;
    } else {
        return false;
    }
}

function validatephone(phone) {
    digits = /^[0-9]+$/;
    if (phone.match(digits)) {
        return true;
    } else {
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

function checkHome(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.render('home');
}

function checkAdmin(req, res, next) {
    if (req.user.role == "a") {
        return next();
    }
    res.render("login");

}

function fetchID(callback) {

    pool.query(
        `SELECT * FROM wpackage`, (err, results) => {
            if (err) {
                callback(err, null);;
            } else {
                let rows = results.rows;

                let idd = rows[0].id;

                for (var i = 0; i < rows.length; i++) {
                    if (idd < rows[i].id) {
                        idd = rows[i].id;

                    }
                }
                idd++;

                callback(null, idd);
            }

        }
    )
}

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);