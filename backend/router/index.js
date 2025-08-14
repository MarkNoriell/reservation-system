const express = require('express')
const router = express.Router()

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { fetchAccounts, loginAccount } = require('../controller/accountController.js')
const { addProduct, fetchProducts, updateProduct } = require('../controller/productsController.js')

router.get("/fetchAccounts", fetchAccounts)
router.post("/loginAccount", loginAccount)
router.post("/addProduct", upload.single('image'), addProduct)
router.get("/fetchProducts", fetchProducts)
router.post("/updateProduct",upload.single('image'), updateProduct)

module.exports = router