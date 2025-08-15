const { getAllReservationsModel, addReservationModel, updateStatusModel, updateDateModel, getDateCountsModel } = require('../models/reservationsModel');

// Fetch all reservations
exports.fetchAllReservations = async (req, res) => {
    console.log("--- Request successfully reached fetchAllReservations controller! ---"); 

    try {
        const reservations = await getAllReservationsModel();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).send({ message: "Error fetching reservations." });
    }
};

// Add a new reservation
exports.addReservation = async (req, res) => {
    try {
        const reservationDetails = req.body;
        await addReservationModel(reservationDetails);
        res.status(201).send({ message: "Reservation created successfully!" });
    } catch (error) {
        res.status(500).send({ message: "Error creating reservation." });
    }
};

// Update a reservation's status
exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await updateStatusModel(id, status);
        res.status(200).send({ message: "Status updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Error updating status." });
    }
};

// Update a reservation's pickup date
exports.updateReservationDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { pickupDate } = req.body;
        await updateDateModel(id, pickupDate);
        res.status(200).send({ message: "Date updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Error updating date." });
    }
};

// Get counts of reservations for each date (for the date picker)
exports.getReservationCountsByDate = async (req, res) => {
    try {
        const counts = await getDateCountsModel();
        res.status(200).json(counts);
    } catch (error) {
        res.status(500).send({ message: "Error fetching date counts." });
    }
};