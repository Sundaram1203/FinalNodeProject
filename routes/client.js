import express from "express";
import controller from "../controller/client.controller.js";

const router = express.Router();

router.post("/add", controller.addClient);
router.get("/list", controller.getClients);
router.get("/:id", controller.getClientById);
router.put("/edit/:id", controller.updateClient);
router.delete(":id", controller.deleteClient);

export default router;
