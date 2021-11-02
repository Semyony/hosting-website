
require("dotenv").config();
const {Pool} = require("pg");
const pProduction = process.env.NODE_ENV === "production";
const connectionStr = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
    connectionString: pProduction ? process.env.DATABASE_URL : connectionStr,
    ssl: {
        rejectUnauthorized: false
    }
});
pool.connect();
pool.query('SELECT * FROM wuser');
module.exports = {pool}