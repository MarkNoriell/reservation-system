const model = require('../models/salesModel');

exports.getSalesMetrics = async (req, res) => {
    try {
        const metrics = await model.calculateKeyMetrics();
        res.status(200).json(metrics);
    } catch (error) {
        res.status(500).send({ message: "Error fetching sales metrics." });
    }
};

exports.getMonthlyRevenue = async (req, res) => {
    try {
        const monthlyData = await model.getMonthlyRevenueData();
        res.status(200).json(monthlyData);
    } catch (error) {
        res.status(500).send({ message: "Error fetching monthly revenue." });
    }
};

exports.getTopSellingItems = async (req, res) => {
    try {
        const topItems = await model.getTopItemsData();
        res.status(200).json(topItems);
    } catch (error) {
        res.status(500).send({ message: "Error fetching top selling items." });
    }
};