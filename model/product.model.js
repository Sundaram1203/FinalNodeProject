import db from "../config/db.js"; 

//Add Product to DB
const addProductToDB = (productData) => {
    const { p_name, p_price, p_company,image } = productData;

    const sql = "INSERT INTO product (p_name, p_price, p_company, deleted,image) VALUES (?, ?, ?, 0,?)";
    const values = [p_name, p_price, p_company,image];

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

//Get All Products
const getProductsFromDB = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM product WHERE deleted = 0", (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

//Get Product by ID
const getProductByIdFromDB = (id) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM product WHERE id = ? AND deleted = 0", [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 ? results[0] : null);
            }
        });
    });
};

//Update Product
const updateProductInDB = (id, productData) => {
    const { p_name, p_price, p_company,image } = productData;

    const sql = "UPDATE product SET p_name=?, p_price=?, p_company=? , image= ? WHERE id=? AND deleted = 0";
    
    return new Promise((resolve, reject) => {
        db.query(sql, [p_name, p_price, p_company,image, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows > 0);
            }
        });
    });
};

//Soft Delete Product
const deleteProductFromDB = (id) => {
    return new Promise((resolve, reject) => {
        db.query("UPDATE product SET deleted = 1 WHERE id=?", [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows > 0);
            }
        });
    });
};


export default { addProductToDB, getProductsFromDB, getProductByIdFromDB, updateProductInDB, deleteProductFromDB}