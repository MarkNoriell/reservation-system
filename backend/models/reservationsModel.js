const dbConnection = require('../dbConnection/dbConnection.js');
const pool = dbConnection.connect();

// Fetch all reservations, joining with products to get product name and price
// In models/reservationsModel.js

exports.getAllReservationsModel = () => {
    return new Promise((resolve, reject) => {
        // This query joins reservations (aliased as 'r') with products (aliased as 'p')
        // Ensure all column names here exactly match your database tables.
        const query = `
            SELECT 
                r.reservation_id, 
                r.customer_name, 
                r.product_id, 
                p.product_name,
                r.product_color,
                r.quantity, 
                r.total_price,
                r.pickup_date, 
                r.reservation_status
            FROM reservations AS r
            JOIN products AS p ON r.product_id = p.product_id
            ORDER BY r.pickup_date ASC, r.created_at ASC;
        `;
        
        pool.query(query, (err, results) => {
            if (err) {
                // This will print the detailed SQL error to your Node.js console
                console.error("SQL Error in getAllReservationsModel:", err); 
                return reject(err);
            }
            resolve(results);
        });
    });
};

// Add a new reservation
exports.addReservationModel = (details) => {
    return new Promise((resolve, reject) => {
        // We need to get the product's price from the products table first
        pool.query('SELECT product_price FROM products WHERE product_id = ?', [details.product_id], (err, product) => {
            if (err) return reject(err);
            if (product.length === 0) return reject(new Error("Product not found."));

            const price = product[0].product_price;
            const totalPrice = price * details.quantity;

            const query = `INSERT INTO reservations (customer_name, product_id, product_color, quantity, total_price, pickup_date) VALUES (?, ?, ?, ?, ?, ?)`;
            const values = [details.customer_name, details.product_id, details.product_color, details.quantity, totalPrice, details.pickup_date];
            
            pool.query(query, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    });
};

// Update status
exports.updateStatusModel = (id, status) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE reservations SET reservation_status = ? WHERE reservation_id = ?', [status, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Update pickup date
exports.updateDateModel = (id, date) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE reservations SET pickup_date = ? WHERE reservation_id = ?', [date, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Get counts of reservations grouped by date
exports.getDateCountsModel = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT pickup_date, SUM(quantity) as count FROM reservations GROUP BY pickup_date`;
        pool.query(query, (err, results) => {
            if (err) return reject(err);
            // Convert array of objects to a simple { 'YYYY-MM-DD': count } map
            const countsMap = results.reduce((acc, row) => {
                const date = new Date(row.pickup_date).toLocaleDateString('en-CA');
                acc[date] = row.count;
                return acc;
            }, {});
            resolve(countsMap);
        });
    });
};