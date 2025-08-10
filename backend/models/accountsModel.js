const dbConnection = require('../dbConnection/dbConnection.js');
const pool = dbConnection.connect();

exports.fetchAccountsModel = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Something went wrong getting connection in database!", err);
                return reject(err);
            }

            const query = "SELECT * FROM account";

            connection.query(query, (err, result) => {
                connection.release();

                if (err) {
                    console.error("Database query error!", err);
                    return reject(err);
                }

                resolve(result);
            });
        });
    });
};

exports.loginAccount = (loginCredentials) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Something went wrong getting connection in database!", err);
                return reject(err);
            }

            const query = `SELECT * FROM account WHERE username = '${loginCredentials.username}' AND password = '${loginCredentials.password}'`;

            connection.query(query, (err, result) => {
                connection.release();

                if (err) {
                    console.error("Database query error!", err);
                    return reject(err);
                }

                resolve(result);
            });
        });
    });
}
