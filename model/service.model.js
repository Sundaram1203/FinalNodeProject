import db from "../config/db.js";

const getAllPurchasesFromDB = () => {
    return new Promise((resolve, reject) => {
        const sql = 
            `SELECT c.name, c.email, p.p_name, p.p_company, p.p_price
            FROM service s
            INNER JOIN product p ON s.product_id = p.id
            INNER JOIN client c ON s.client_id = c.id
            ORDER BY s.id;
        ;`
        db.query(sql, (err, results) => (err ? reject(err) : resolve(results)));
    });
};

const getAllPurchasesByClientIdFromDB = (client_id) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `SELECT c.name, c.email, p.p_name, p.p_company, p.p_price
            FROM service s
            INNER JOIN product p ON s.product_id = p.id
            INNER JOIN client c ON s.client_id = c.id
            WHERE s.client_id = ?
            ORDER BY s.id;
        ;`
        db.query(sql, [client_id], (err, results) => (err ? reject(err) : resolve(results)));
    });
};

const insertPurchaseToDB = (client_id, product_id) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO service (client_id, product_id) VALUES (?, ?)";
        db.query(sql, [client_id, product_id], (err, result) => (err ? reject(err) : resolve(result.insertId)));
    });
};

const getPurchasesByInsertIds = (insertIds) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(insertIds) || insertIds.length === 0) {
            return reject(new Error("Invalid insert IDs"));
        }

        const placeholders = insertIds.map(() => '?').join(', ');
        const sql = 
            `SELECT c.name, c.email, p.p_name, p.p_company, p.p_price, p.image
            FROM service s
            INNER JOIN product p ON s.product_id = p.id
            INNER JOIN client c ON s.client_id = c.id
            WHERE s.id IN (${placeholders})
            ORDER BY s.id DESC;
        ;`

        db.query(sql, insertIds, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};


export default {
    getAllPurchasesFromDB,
    insertPurchaseToDB,
    getPurchasesByInsertIds,
    getAllPurchasesByClientIdFromDB,
};