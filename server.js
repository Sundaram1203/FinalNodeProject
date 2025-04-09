import express from 'express'; 
import clientedit from "./routes/client.js";
import productedit from "./routes/product.js";
import purchaseEdit from "./routes/service.js";
import {verifyAccessToken} from "./middleware/auth.middleware.js"
import authRoutes from "./routes/auth.js"; 
import bodyParser from 'body-parser';
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/auth",  authRoutes);
app.use("/client", verifyAccessToken, clientedit);
app.use("/product", verifyAccessToken, productedit);
app.use("/purchase", verifyAccessToken, purchaseEdit);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port: "Get ready to view My Project"`);
});
