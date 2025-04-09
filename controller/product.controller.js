import multer from "multer";
import { Validator } from "node-input-validator";
import crudoperation from "../model/product.model.js";

// Configure multer for file upload
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

const addProduct = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: "File upload error", error: err.message });
        }

        const { p_name, p_price, p_company } = req.body;
        const image = req.file ? req.file.buffer : null; // Convert file to buffer

        // Validation
        const v = new Validator({ p_name, p_price, p_company, image }, {
            p_name: "required|string",
            p_price: "required|numeric",
            p_company: "required|string",
            image: "required" 
        });

        const matched = await v.check();
        if (!matched) {
            return res.status(400).json({ success: false, errors: v.errors });
        }

        try {
            const productId = await crudoperation.addProductToDB({ p_name, p_price, p_company, image });
            res.status(201).json({ success: true, message: "Product added successfully", productId });
        } catch (err) {
            console.error("Error adding product:", err);
            res.status(500).json({ success: false, message: "Failed to add product", error: err.message });
        }
    });
};

//Get All Products
const getProducts = async (req, res) => {
    try {
        const products = await crudoperation.getProductsFromDB();
        res.status(200).json({ success: true, products });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ success: false, message: "Failed to fetch products", error: err.message });
    }
};

// Get Product by ID
const getProductById = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    try {
        const product = await crudoperation.getProductByIdFromDB(id);
        if (product) {
            res.status(200).json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: "Database error", error: err.message });
    }
};

//Update Product
const updateProduct = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: "File upload error", error: err.message });
        }

        const { p_name, p_price, p_company } = req.body;
        const image = req.file ? req.file.buffer : null; // Convert file to buffer

        // Validation
        const v = new Validator({ p_name, p_price, p_company, image }, {
            p_name: "required|string",
            p_price: "required|numeric",
            p_company: "required|string",
            image: "required" 
        });

        const matched = await v.check();
        if (!matched) {
            return res.status(400).json({ success: false, errors: v.errors });
        }

        try {
            const productId = await crudoperation.addProductToDB({ p_name, p_price, p_company, image });
            res.status(201).json({ success: true, message: "Product added successfully", productId });
        } catch (err) {
            console.error("Error adding product:", err);
            res.status(500).json({ success: false, message: "Failed to add product", error: err.message });
        }
    });
};


//Soft Delete Product
const deleteProduct = async (req, res) => {
    const id = req.params.id;

    try {
        const deleted = await crudoperation.deleteProductFromDB(id);
        if (deleted) {
            res.status(200).json({ success: true, message: "Product deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Product not found or already deleted" });
        }
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ success: false, message: "Failed to delete product", error: err.message });
    }
};


export default {addProduct, getProducts, getProductById, updateProduct, deleteProduct}