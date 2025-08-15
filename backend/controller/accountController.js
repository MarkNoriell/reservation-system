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

exports.loginAccount = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ message: "Username and password are required." });
        }

        // 1. Get the user from the database
        const user = await model.getAccountByUsernameModel(username);

        // 2. Check if the user exists
        if (!user) {
            // Use a generic message for security - don't reveal if the username exists
            return res.status(401).send({ message: "Invalid credentials." });
        }

        // 3. Compare the provided password with the hashed password from the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            // 4. Passwords match! Successful login.
            // Send back only the necessary user info (NEVER the password hash).
            res.status(200).send({ 
                message: "Login successful!", 
                user: { 
                    username: user.username, 
                    access_rights: user.access_rights 
                } 
            });
        } else {
            // 5. Passwords do not match.
            res.status(401).send({ message: "Invalid credentials." });
        }
    } catch (error) {
        console.error("Server error during login:", error);
        res.status(500).send({ message: "An internal server error occurred." });
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