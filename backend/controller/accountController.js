const { fetchAccountsModel, loginAccount } = require('../models/accountsModel.js')

exports.fetchAccounts = async (req,res) => {
 const response = await fetchAccountsModel()
   res.send({
      response
   })
}

exports.loginAccount = async (req,res) => {
   const loginCredentials = req.body
   const response = await loginAccount(loginCredentials)

   console.log(loginCredentials,"loginCredentials");

   res.send({
      message: "Success!",
      response
   })
   
}