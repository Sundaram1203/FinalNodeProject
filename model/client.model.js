import db from "../config/db.js";  // Ensure db.js is correctly set up

//Add Client to DB
const addClientToDB = (clientData) => {
    const { name, age, phone, email } = clientData;
    const sql = "INSERT INTO client (name, age, phone, email) VALUES (?, ?, ?, ?)";
    const values = [name, age, phone, email];

    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

//Get All Clients
const getClientsFromDB = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM client WHERE deleted = 0", (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

//Get Client by ID
const getClientByIdFromDB = (id) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM client WHERE id=? AND deleted=0", [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length > 0 ? result[0] : null);
            }
        });
    });
};

//Update Client
const updateClientInDB = (id, clientData) => {
    const { name, age, phone, email } = clientData;
    const sql = "UPDATE client SET name=?, age=?, phone=?, email=? WHERE id=? AND deleted=0";
    
    return new Promise((resolve, reject) => {
        db.query(sql, [name, age, phone, email, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows > 0);
            }
        });
    });
};

//Soft Delete Client
const deleteClientFromDB = (id) => {
    return new Promise((resolve, reject) => {
        db.query("UPDATE client SET deleted = 1 WHERE id=?", [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows > 0);
            }
        });
    });
};


export default {addClientToDB, getClientsFromDB,getClientByIdFromDB, updateClientInDB, deleteClientFromDB}