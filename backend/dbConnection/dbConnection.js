require('dotenv').config();

const mysql = require('mysql');

const pool = mysql.createPool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST
});

exports.connect = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Something went wrong connecting to database", err);
            return;
        }

        connection.release();
        console.log("Connected to database!");
    });

    return pool;
};
