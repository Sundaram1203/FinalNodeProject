import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getStoredRefreshToken } from "../model/auth.model.js";

dotenv.config();

//Middleware to verify access token
export const verifyAccessToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Access token is required' });
        }

        const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
        if (!token) {
            return res.status(401).json({ message: 'Token not found' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Access token has expired. Please refresh.' });
                }
                return res.status(403).json({ message: 'Invalid access token' });
            }

            req.user = decoded;
            next();
        });

    } catch (error) {
        console.error("Error in verifyAccessToken:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//Middleware to verify refresh token
export const verifyRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }

        // Fetch the stored token from the database
        const user = await getStoredRefreshToken(refreshToken);
        if (!user) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });

            req.user = decoded; // Attach user info to request
            next();
        });

    } catch (error) {
        console.error("Error in verifyRefreshToken:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
