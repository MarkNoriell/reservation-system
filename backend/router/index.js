const express = require('express')
const router = express.Router()

const { fetchAccounts } = require('../controller/accountController.js')

router.get("/fetchAccounts", fetchAccounts)

module.exports = router