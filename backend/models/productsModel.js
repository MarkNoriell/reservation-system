const dbConnection = require('../dbConnection/dbConnection.js');
const pool = dbConnection.connect();

exports.addProductModel = (productDetails) => {
    console.log(productDetails,"product details");
    
    const { 
        product_category, 
        product_name,  
        product_price,
        product_colors,
        product_image,
        img_mime,
        archived
    } = productDetails

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
                product_price,
                product_colors,
                product_image,
                img_mime,
                archived
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
            product_category,
            product_name,
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

exports.updateProductsModel = (updatedProductDetails) => {
    const { 
        product_id,
        product_category, 
        product_name,  
        product_price,
        product_colors,
        product_image,
        archived
    } = updatedProductDetails
    
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Something went wrong getting connection in database!", err);
                return reject(err);
            }

            const query = `UPDATE products
                        SET product_category = '${product_category}',
                        product_name = '${product_name}',
                        product_price = '${product_price}',
                        product_colors = '${product_colors}',
                        product_image = '${product_image}',
                        archived = '${archived}'
                        WHERE product_id = '${product_id}'`;

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