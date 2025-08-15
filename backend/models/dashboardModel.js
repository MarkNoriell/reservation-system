const dbConnection = require('../dbConnection/dbConnection.js');
const pool = dbConnection.connect();

// 1. Get Total Profit (reusing logic from sales)
exports.getSalesMetrics = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT SUM((p.product_price - p.product_cost) * r.quantity) AS totalProfit
            FROM reservations AS r
            JOIN products AS p ON r.product_id = p.product_id
            WHERE r.reservation_status = 'Completed';
        `;
        pool.query(query, (err, result) => {
            if (err) return reject(err);
            resolve({ totalProfit: result[0].totalProfit || 0 });
        });
    });
};

// 2. Get the single top-selling product
exports.getTopSeller = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                p.product_id,
                p.product_name,
                SUM(r.quantity) AS totalSold
            FROM reservations AS r
            JOIN products AS p ON r.product_id = p.product_id
            WHERE r.reservation_status = 'Completed'
            GROUP BY p.product_id, p.product_name
            ORDER BY totalSold DESC
            LIMIT 1;
        `;
        pool.query(query, (err, result) => {
            if (err) return reject(err);
            // Return the first item, or a default object if no sales exist
            resolve(result[0] || { product_name: 'N/A', totalSold: 0 });
        });
    });
};

// 3. Get the 5 most recent pending reservations
exports.getPendingReservations = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                r.customer_name,
                p.product_name,
                r.quantity,
                r.reservation_status
            FROM reservations AS r
            JOIN products AS p ON r.product_id = p.product_id
            WHERE r.reservation_status = 'Pending'
            ORDER BY r.pickup_date ASC
            LIMIT 5;
        `;
        pool.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// 4. Get 5 active products
exports.getActiveProducts = () => {
    return new Promise((resolve, reject) => {
        // Fetches products that are NOT archived
        const query = `
            SELECT product_name, product_price 
            FROM products 
            WHERE archived = 'false' OR archived IS NULL
            LIMIT 5;
        `;
        pool.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};