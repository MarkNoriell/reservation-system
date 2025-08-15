const { addProductModel, fetchProductsModel, updateProductsModel, archiveProductModel, restoreProductModel } = require('../models/productsModel.js')

exports.addProduct = async (req,res) => {
    try {
        const fileBuffer = req.file?.buffer;
        const mimeType = req.file?.mimetype;
        let productDetails = req.body;

        // --- FIX STARTS HERE ---
        // By setting these properties here, we make the API robust.
        // It no longer depends on the frontend to provide default values.
        
        // 1. Set the image data
        productDetails.product_image = fileBuffer;
        productDetails.img_mime = mimeType;

        // 2. Explicitly set the 'archived' status to 'false' for all new products.
        // This is the key fix that ensures new products appear in the "Active" list.
        productDetails.archived = 'false';
        // --- FIX ENDS HERE ---
        
        await addProductModel(productDetails);
        
        // Best Practice: Send a 201 "Created" status code for successful additions.
        res.status(201).send({
            message:"Product added Succesfully!",
        });

    } catch (error) {
        console.error("Something went wrong! Unable to add product", error);
        // Best Practice: Send a 500 status code and error message on failure.
        res.status(500).send({
            message: "Failed to add product. Please check server logs."
        });
    }
}

exports.fetchProducts = async (req,res) => {
    try {
        const response = await fetchProductsModel()
        res.json(response)
    } catch (error) {
        console.error("Something went wrong! Unable to fetch product", error);
    }
}

exports.updateProduct = async (req, res) => {
    try {
        let productDetails = req.body;

        // --- THE FIX IS HERE ---
        // Only add image data to the details object IF a new file has been uploaded.
        // If req.file is undefined, the image properties will not be added,
        // and our new "smart" model will know not to update them.
        if (req.file) {
            productDetails.product_image = req.file.buffer;
            productDetails.img_mime = req.file.mimetype;
        }
        
        await updateProductsModel(productDetails);
        
        res.status(200).send({
            message: "Product updated Successfully!",
        });

    } catch (error) {
        console.error("Something went wrong! Unable to update product", error);
        res.status(500).send({
            message: "Failed to update product. Please check server logs."
        });
    }
};

// --- ADD THIS NEW CONTROLLER FUNCTION ---
exports.archiveProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).send({ message: "Product ID is required." });
        }
        await archiveProductModel(productId);
        res.status(200).send({ message: "Product archived successfully!" });
    } catch (error) {
        console.error("Error archiving product:", error);
        res.status(500).send({ message: "Failed to archive product." });
    }
};

// --- ADD THIS NEW CONTROLLER FUNCTION ---
exports.restoreProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).send({ message: "Product ID is required." });
        }
        await restoreProductModel(productId);
        res.status(200).send({ message: "Product restored successfully!" });
    } catch (error) {
        console.error("Error restoring product:", error);
        res.status(500).send({ message: "Failed to restore product." });
    }
};