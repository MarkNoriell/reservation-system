const express = require('express')
const router = express.Router()

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { addProduct, fetchProducts, updateProduct, archiveProduct, restoreProduct } = require('../controller/productsController.js')

// --- ADD a new import for the reservations controller ---
const { 
    fetchAllReservations,
    addReservation,
    updateReservationStatus,
    updateReservationDate,
    getReservationCountsByDate
} = require('../controller/reservationsController.js');

const { getSalesMetrics, getMonthlyRevenue, getTopSellingItems } = require('../controller/salesController.js');

const { getDashboardData } = require('../controller/dashboardController.js');

// --- ADD these imports from your account controller ---
const { 
    loginAccount,
    getAllAccounts,
    addAccount,
    updateAccount,
    deactivateAccount,
    reactivateAccount
} = require('../controller/accountController.js'); // Verify this path

router.post("/addProduct", upload.single('image'), addProduct)
router.get("/fetchProducts", fetchProducts)
router.post("/updateProduct",upload.single('image'), updateProduct)

// --- ADD THESE NEW RESERVATION ROUTES ---
router.get("/reservations", fetchAllReservations);
router.get("/reservations/counts", getReservationCountsByDate); // For date validation
router.post("/reservations", addReservation);
router.put("/reservations/:id/status", updateReservationStatus);
router.put("/reservations/:id/date", updateReservationDate);

// --- ADD THESE TWO NEW ROUTES ---
router.put("/archiveProduct/:id", archiveProduct);
router.put("/restoreProduct/:id", restoreProduct);
// --------------------------------

// --- ADD THESE NEW SALES ROUTES ---
router.get("/sales/metrics", getSalesMetrics);
router.get("/sales/monthly-revenue", getMonthlyRevenue);
router.get("/sales/top-selling", getTopSellingItems);

router.get("/dashboard", getDashboardData);

// --- ADD THESE NEW ACCOUNT MANAGEMENT ROUTES ---
router.post("/loginAccount", loginAccount);
router.get("/accounts", getAllAccounts);
router.post("/accounts", addAccount);
router.put("/accounts/:username", updateAccount); // Use username as the unique ID
router.put("/accounts/:username/deactivate", deactivateAccount);
router.put("/accounts/:username/reactivate", reactivateAccount);


module.exports = router