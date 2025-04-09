import express from "express";
import productController from "../controller/product.controller.js";

const router = express.Router();

// CRUD Routes for Product
router.post("/add", productController.addProduct);          
router.get("/list", productController.getProducts);         
router.get("/:id", productController.getProductById);       
router.put("/edit/:id", productController.updateProduct);      
router.delete("/:id", productController.deleteProduct);  

export default router;
