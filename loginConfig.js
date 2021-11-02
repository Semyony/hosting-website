var LocalStrategy = require("passport-local").Strategy;
const {pool} = require('./databaseConfig');

function initialize(passport){
    const authenticateUser = (email, password, done) => {
        pool.query(
            `SELECT * FROM wuser WHERE email = $1`, [email], (err, results) => {
                if(err){
                    throw err;
                }
                if(results.rows.length > 0){
                    const user = results.rows[0];
                    pool.query(`SELECT password FROM wuser WHERE email = $1`, [email], (err, results) => {
                        if(err){
                            throw err;
                        }
                        if(results.rows[0].password == password){
                            return done(null, user);
                        }
                        else{
                            return done(null, false, {message: "Incorrect Password/Email"})
                        }
                    })
                }
                else{
                    return done(null, false, {message: "Eamil is not registered"})
                }
            }
        );
    }


    passport.use(
        new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        authenticateUser
        )
    );
    
    passport.serializeUser((user, done) => {done(null, user.id)});
    passport.deserializeUser((id, done)=>{
        pool.query(
            `SELECT * FROM wuser WHERE id = $1`, [id], (err, results) => {
                if(err){
                    throw err;
                }

                return done(null, results.rows[0]);
            }
        )
    });
}

module.exports = initialize;