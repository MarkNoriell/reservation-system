const model = require('../models/dashboardModel');

exports.getDashboardData = async (req, res) => {
    try {
        // We use Promise.all to run all database queries concurrently for maximum speed.
        const [
            salesMetrics,
            topSeller,
            pendingReservations,
            activeProducts
        ] = await Promise.all([
            model.getSalesMetrics(),
            model.getTopSeller(),
            model.getPendingReservations(),
            model.getActiveProducts()
        ]);

        // Combine all results into a single JSON object
        res.status(200).json({
            totalProfit: salesMetrics.totalProfit, // Changed from totalSales to totalProfit as per your request
            topSeller: topSeller,
            pendingReservations: pendingReservations,
            activeProducts: activeProducts
        });

    } catch (error) {
        res.status(500).send({ message: "Error fetching dashboard data." });
    }
};