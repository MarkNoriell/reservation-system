const { addProductModel, fetchProductsModel, updateProductsModel } = require('../models/productsModel.js')

exports.addProduct = async (req,res) => {
    try {
        const fileBuffer = req.file?.buffer;
        const mimeType = req.file?.mimetype;
        let productDetails = req.body
        productDetails.product_image = fileBuffer
        productDetails.img_mime = mimeType
        
        await addProductModel(productDetails)
        res.send({
            message:"Product added Succesfully!",
        })
    } catch (error) {
        console.error("Something went wrong! Unable to add product", error);
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

exports.updateProduct = async (req,res) => {
    try {
        const fileBuffer = req.file?.buffer;
        const mimeType = req.file?.mimetype;
        let productDetails = req.body
        productDetails.product_image = fileBuffer
        productDetails.img_mime = mimeType

        await updateProductsModel(productDetails)
        res.send({
            message:"Product updated Succesfully!",
        })
    } catch (error) {
        console.error("Something went wrong! Unable to update product", error);
    }
}