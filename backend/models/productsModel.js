const dbConnection = require('../dbConnection/dbConnection.js');
const pool = dbConnection.connect();

exports.addProductModel = (productDetails) => {
    console.log(productDetails,"product details");
    
    const { 
        product_category, 
        product_name,  
        product_cost,
        product_price,
        product_colors,
        product_image,
        img_mime,
        archived
    } = productDetails

    console.log("add product");
    

    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Something went wrong getting connection in database!", err);
                return reject(err);
            }

            const query = `
            INSERT INTO products (
                product_category, 
                product_name,
                product_cost,  
                product_price,
                product_colors,
                product_image,
                img_mime,
                archived
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
            product_category,
            product_name,
            product_cost,
            product_price,
            product_colors,
            product_image, // binary buffer
            img_mime,
            archived
            ];

            connection.query(query, values, (err, result) => {
                connection.release();

                if (err) {
                    console.error("Database query error!", err);
                    return reject(err);
                }

                resolve(result);
            });
        });
    });
}

exports.fetchProductsModel = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Something went wrong getting connection in database!", err);
                return reject(err);
            }

            const query = `SELECT * FROM products WHERE archived = 'false'`;

            connection.query(query, (err, result) => {
                connection.release();

                if (err) {
                    console.error("Database query error!", err);
                    return reject(err);
                }

                resolve(result);
            });
        });
    });
}

// productsModel.js

exports.updateProductsModel = (productDetails) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error getting database connection!", err);
                return reject(err);
            }

            const { product_id } = productDetails;

            if (!product_id) {
                connection.release();
                return reject(new Error("A product_id is required to update."));
            }

            const fieldsToUpdate = [];
            const values = [];

            // --- THIS IS THE DYNAMIC QUERY BUILDER ---
            // It checks each property. If it exists, it adds it to the SQL query.

            if (productDetails.product_category !== undefined) {
                fieldsToUpdate.push("product_category = ?");
                values.push(productDetails.product_category);
            }
            if (productDetails.product_name !== undefined) {
                fieldsToUpdate.push("product_name = ?");
                values.push(productDetails.product_name);
            }
            if (productDetails.product_cost !== undefined) {
                fieldsToUpdate.push("product_cost = ?");
                values.push(productDetails.product_cost);
            }
            if (productDetails.product_price !== undefined) {
                fieldsToUpdate.push("product_price = ?");
                values.push(productDetails.product_price);
            }
            if (productDetails.product_colors !== undefined) {
                fieldsToUpdate.push("product_colors = ?");
                values.push(productDetails.product_colors);
            }
             // This solves the image being deleted. It's only added if a new image was sent.
            if (productDetails.product_image !== undefined) {
                fieldsToUpdate.push("product_image = ?");
                values.push(productDetails.product_image);
                fieldsToUpdate.push("img_mime = ?");
                values.push(productDetails.img_mime);
            }
             // This solves the archived status becoming NULL.
            if (productDetails.archived !== undefined) {
                fieldsToUpdate.push("archived = ?");
                values.push(productDetails.archived);
            }

            // If for some reason there's nothing to update, we can exit early.
            if (fieldsToUpdate.length === 0) {
                connection.release();
                return resolve({ message: "No fields provided to update." });
            }

            // Add the product_id for the WHERE clause at the very end
            values.push(product_id);

            // Construct the final query string
            const query = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE product_id = ?`;

            connection.query(query, values, (err, result) => {
                connection.release();
                if (err) {
                    console.error("Database query error!", err);
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};