import Validator from "node-input-validator";
import crudoperation from "../model/client.model.js";

//Add Client
const addClient = async (req, res) => {
    // Validation
    const v = new Validator(req.body, {
        name: "required|string",
        age: "required|integer|min:5",
        phone: "required|digits:10",
        email: "required|email",
    });

    const matched = await v.check();
    if (!matched) {
        return res.status(400).json({ success: false, errors: v.errors });
    }

    try {
        const clientId = await crudoperation.addClientToDB(req.body);
        res.status(201).json({ success: true, message: "Client added successfully", clientId });
    } catch (err) {
        console.error("Error inserting client:", err);
        res.status(500).json({ success: false, message: "Failed to add client", error: err.message });
    }


};

//All Clients
const getClients = async (req, res) => {
    try {
        const clients = await crudoperation.getClientsFromDB();
        res.status(200).json({ success: true, clients });
    } catch (err) {
        console.error("Error fetching clients:", err);
        res.status(500).json({ success: false, message: "Failed to fetch clients", error: err.message });
    }
};

//Client by ID
const getClientById = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ success: false, message: "Client ID is required" });
    }

    try {
        const client = await crudoperation.getClientByIdFromDB(id);
        if (client) {
            res.status(200).json({ success: true, client });
        } else {
            res.status(404).json({ success: false, message: "Client not found" });
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: "Database error", error: err.message });
    }
};

//Update Client
const updateClient = async (req, res) => {
    const id = req.params.id;
    const { name, age, phone, email } = req.body;

    if (!name || !age || !phone || !email) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const updated = await crudoperation.updateClientInDB(id, req.body);
        if (updated) {
            res.status(200).json({ success: true, message: "Client updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "Client not found or already deleted" });
        }
    } catch (err) {
        console.error("Error updating client:", err);
        res.status(500).json({ success: false, message: "Failed to update client", error: err.message });
    }
};

//Soft delete
const deleteClient = async (req, res) => {
    const id = req.params.id;

    try {
        const deleted = await crudoperation.deleteClientFromDB(id);
        if (deleted) {
            res.status(200).json({ success: true, message: "Client deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Client not found" });
        }
    } catch (err) {
        console.error("Error deleting client:", err);
        res.status(500).json({ success: false, message: "Failed to delete client", error: err.message });
    }
};


export default {addClient, getClients, getClientById, updateClient, deleteClient}