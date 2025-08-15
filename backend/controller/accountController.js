const model = require('../models/accountModel.js');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Standard for bcrypt hashing

exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await model.getAllAccountsModel();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).send({ message: "Error fetching accounts." });
    }
};

exports.addAccount = async (req, res) => {
    try {
        const accountDetails = req.body;
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(accountDetails.password, saltRounds);
        accountDetails.password = hashedPassword;
        
        await model.addAccountModel(accountDetails);
        res.status(201).send({ message: "Account created successfully!" });
    } catch (error) {
        // Handle case where username might already exist
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: "Username already exists." });
        }
        res.status(500).send({ message: "Error creating account." });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { username } = req.params;
        const accountDetails = req.body;
        await model.updateAccountModel(username, accountDetails);
        res.status(200).send({ message: "Account updated successfully." });
    } catch (error) {
        res.status(500).send({ message: "Error updating account." });
    }
};

exports.deactivateAccount = async (req, res) => {
    try {
        const { username } = req.params;
        await model.deactivateAccountModel(username);
        res.status(200).send({ message: "Account deactivated." });
    } catch (error) {
        res.status(500).send({ message: "Error deactivating account." });
    }
};

exports.reactivateAccount = async (req, res) => {
    try {
        const { username } = req.params;
        await model.reactivateAccountModel(username);
        res.status(200).send({ message: "Account reactivated." });
    } catch (error) {
        res.status(500).send({ message: "Error reactivating account." });
    }
};