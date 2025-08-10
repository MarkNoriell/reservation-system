const { fetchAccountsModel } = require('../models/accountsModel.js')

exports.fetchAccounts = async (req,res) => {
 const response = await fetchAccountsModel()
 res.send({
    response
 })
}