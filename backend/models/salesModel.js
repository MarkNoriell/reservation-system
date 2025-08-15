const dbConnection = require('../dbConnection/dbConnection.js');
const pool = dbConnection.connect();

// 1. For the three cards: Profit, Revenue, Items Sold
exports.calculateKeyMetrics = () => {
    return new Promise((resolve, reject) => {
        // This single, efficient query calculates all three metrics at once.
        const query = `
            SELECT 
                -- Calculate total revenue (price * quantity)
                SUM(r.total_price) AS totalRevenue,
                
                -- Calculate total profit ((price - cost) * quantity)
                SUM((p.product_price - p.product_cost) * r.quantity) AS totalProfit,
                
                -- Calculate total items sold (sum of quantities)
                SUM(r.quantity) AS totalItemsSold
            FROM reservations AS r
            JOIN products AS p ON r.product_id = p.product_id
            WHERE r.reservation_status = 'Completed';
        `;
        pool.query(query, (err, result) => {
            if (err) return reject(err);
            // If there are no sales, the result will be NULL, so we default to 0.
            resolve({
                totalRevenue: result[0].totalRevenue || 0,
                totalProfit: result[0].totalProfit || 0,
                totalItemsSold: result[0].totalItemsSold || 0
            });
        });
    });
};

// 2. For the Bar Chart
exports.getMonthlyRevenueData = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                DATE_FORMAT(pickup_date, '%Y-%m') AS month,
                SUM(total_price) AS revenue
            FROM reservations
            WHERE reservation_status = 'Completed'
            GROUP BY month
            ORDER BY month ASC;
        `;
        pool.query(query, (err, results) => {
            if (err) return reject(err);
            // The query gives us { month: '2025-08', revenue: 12000 }.
            // We need to format it for Chart.js: { labels: [], data: [] }
            const labels = results.map(row => new Date(row.month).toLocaleString('en-US', { month: 'long', year: 'numeric' }));
            const data = results.map(row => row.revenue);
            resolve({ labels, data });
        });
    });
};

// 3. For the Top Selling Items list
exports.getTopItemsData = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                p.product_id,
                p.product_name,
                p.product_price,
                SUM(r.quantity) AS totalSold
            FROM reservations AS r
            JOIN products AS p ON r.product_id = p.product_id
            WHERE r.reservation_status = 'Completed'
            GROUP BY p.product_id, p.product_name, p.product_price
            ORDER BY totalSold DESC
            LIMIT 5;
        `;
        pool.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};