import connection from "../config/db.js";

//register User
export const registerUser = (email, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO register (email, hash_password) VALUES (?, ?)";
        connection.query(sql, [email, hashedPassword], (err, results) => {
            if (err) return reject(err);
            resolve(results.insertId);
        });
    });
};

//Find User by Email
export const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM register WHERE email = ?";
        connection.query(sql, [email], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

//Store Access & Refresh Tokens
export const storeTokens = (email, accessToken, refreshToken) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE register SET access_token = ?, refresh_token = ? WHERE email = ?";
        connection.query(sql, [accessToken, refreshToken, email], (err, results) => {
            if (err) return reject(err);
            if (results.affectedRows === 0) return reject("User not found");
            resolve(results);
        });
    });
};

//Retrieve Access Token
export const getStoredAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM register WHERE access_token = ?";
        connection.query(sql, [token], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};

//Retrieve Refresh Token
export const getStoredRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM register WHERE refresh_token = ?";
        connection.query(sql, [refreshToken], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};
