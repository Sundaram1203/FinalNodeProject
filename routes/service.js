import express from "express";
import purchase from "../controller/service.controller.js"

const routes = express.Router();


routes.get('/sales', purchase.getPurchases);
routes.get('/sales/:id', purchase.getSalesByClientId);
routes.get('/allsales/:id', purchase.getAllSalesByClientId);
routes.post('/addsales', purchase.addPurchase);

export default routes;
