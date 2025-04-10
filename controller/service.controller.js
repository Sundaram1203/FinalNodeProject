import crudoperation from "../model/service.model.js";
import sendEmail from "../services/sendMail.js";

// Get All Purchases
const getPurchases = async (req, res) => {
    try {
        const purchases = await crudoperation.getAllPurchasesFromDB();
        res.status(200).json({ success: true, purchases });
    } catch (err) {
        console.error("Error fetching purchases:", err);
        res.status(500).json({ success: false, message: "Failed to fetch purchases", error: err.message });
    }
};

const addPurchase = async (req, res) => {
    try {
      const { client_id, product_id } = req.body;
  
      if (!client_id || !product_id || (Array.isArray(product_id) && product_id.length === 0)) {
        return res.status(400).json({ success: false, message: "Client ID and at least one product ID are required." });
      }
  
      const productIds = Array.isArray(product_id) ? product_id : [product_id];
      const insertIds = [];
  
      for (const id of productIds) {
        const insertId = await crudoperation.insertPurchaseToDB(client_id, id);
        insertIds.push(insertId);
      }
  
      if (!insertIds.length) {
        return res.status(500).json({ success: false, message: "No purchases were inserted." });
      }
  
      const purchases = await crudoperation.getPurchasesByInsertIds(insertIds);
  
      if (!purchases || purchases.length === 0) {
        return res.status(404).json({ success: false, message: "No purchase records found for email." });
      }
  
      const emailResult = await sendEmail(purchases);
  
      res.status(201).json({
        success: true,
        message: "Purchase successful and email sent.",
        insertIds,
        emailStatus: {
          success: emailResult.success,
          message: emailResult.message,
          error: emailResult.error || null,
        },
        totalItems: purchases.length, // Optional light metadata
      });
  
    } catch (error) {
      console.error("Error adding purchase:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  };
  

// Get Sales by Client ID
const getSalesByClientId = async (req, res) => {
    const client_id = req.params.id;

    if (!client_id) {
        return res.status(400).json({ success: false, message: "Client ID is required" });
    }

    try {
        const purchases = await crudoperation.getPurchasesByClientIdFromDB(client_id);

        if (purchases.length > 0) {
            res.status(200).json({ success: true, purchases });
        } else {
            res.status(404).json({ success: false, message: "No purchases found for this client" });
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: "Database error", error: err.message });
    }
};


const getAllSalesByClientId = async (req, res) => {
    const client_id = req.params.id;

    if (!client_id) {
        return res.status(400).json({ success: false, message: "Client ID is required" });
    }

    try {
        const purchases = await crudoperation.getAllPurchasesByClientIdFromDB(client_id);

        if (purchases.length > 0) {
            res.status(200).json({ success: true, purchases });
        } else {
            res.status(404).json({ success: false, message: "No purchases found for this client" });
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: "Database error", error: err.message });
    }
}

export default { getPurchases, addPurchase, getSalesByClientId , getAllSalesByClientId};