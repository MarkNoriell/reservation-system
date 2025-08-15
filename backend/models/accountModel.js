const dbConnection = require('../dbConnection/dbConnection.js');
const pool = dbConnection.connect();

// Get all accounts, active and deactivated
exports.getAllAccountsModel = () => {
    return new Promise((resolve, reject) => {
        // Select only the columns needed by the frontend
        const query = "SELECT username, customer_name, access_rights, deleted_date FROM account";
        pool.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.getAccountByUsernameModel = (username) => {
    return new Promise((resolve, reject) => {
        // We select all columns here, especially the `password` for comparison.
        // We also check that the user is not deactivated (`deleted_date IS NULL`).
        const query = "SELECT * FROM account WHERE username = ? AND deleted_date IS NULL";
        
        pool.query(query, [username], (err, results) => {
            if (err) {
                return reject(err);
            }
            // `results` will be an array. We want the first (and only) item, or null if no user was found.
            resolve(results[0] || null);
        });
    });
};

// Add a new user
exports.addAccountModel = (details) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO account (customer_name, username, password, access_rights, created_date) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        const values = [details.customer_name, details.username, details.password, details.access_rights];
        pool.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Update a user's name or role
exports.updateAccountModel = (username, details) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE account 
            SET customer_name = ?, access_rights = ?, updated_date = NOW()
            WHERE username = ?
        `;
        const values = [details.customer_name, details.access_rights, username];
        pool.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Deactivate by setting the deleted_date (soft delete)
exports.deactivateAccountModel = (username) => {
    return new Promise((resolve, reject) => {
        const query = "UPDATE account SET deleted_date = NOW() WHERE username = ?";
        pool.query(query, [username], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Reactivate by setting deleted_date back to NULL
exports.reactivateAccountModel = (username) => {
    return new Promise((resolve, reject) => {
        const query = "UPDATE account SET deleted_date = NULL WHERE username = ?";
        pool.query(query, [username], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};