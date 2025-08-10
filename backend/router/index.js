const express = require('express')
const router = express.Router()

const { fetchAccounts, loginAccount } = require('../controller/accountController.js')

router.get("/fetchAccounts", fetchAccounts)
router.post("/loginAccount", loginAccount)

module.exports = router