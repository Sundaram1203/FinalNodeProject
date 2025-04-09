import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { registerUser, findUserByEmail, storeTokens, getStoredAccessToken, getStoredRefreshToken} from "../model/auth.model.js";

dotenv.config();

//  Function to generate Access & Refresh Tokens

const generateTokens = (user) => {
    if (!user.email) {
        throw new Error("User email is missing");
    }

    const payload = { email: user.email };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5h" });
    const refreshToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

//  Register New User

export const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Check if email is already registered
        const existingUser = await findUserByEmail(email);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email already registered. Please login." });
        }

        // Hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user in DB
        const userId = await registerUser(email, hashedPassword); 

        return res.status(201).json({ success: true, message: "User registered successfully", userId });

    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

//  User Login & Token Generation

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Fetch user from DB
        const results = await findUserByEmail(email);
        if (results.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        const user = results[0];

        // Check if password exists
        if (!user.hash_password) {
            return res.status(500).json({ error: "Invalid user data" });
        }

        // Compare provided password with hashed password
        const passwordMatch = await bcrypt.compare(password, user.hash_password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate Access & Refresh Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Store tokens in database
        await storeTokens(user.email, accessToken, refreshToken);

        return res.status(200).json({ success: true, accessToken, refreshToken });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Refresh Access Token when expired

export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }

        // Check if refresh token is valid
        const user = await getStoredRefreshToken(refreshToken);
        if (!user) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        // Generate new Access & Refresh Tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // Store new tokens in DB
        await storeTokens(user.email, accessToken, newRefreshToken);

        return res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken });

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Check User Authorization

export const checkAuthorization = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Access token is required" });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Access token expired. Please refresh." });
                }
                return res.status(403).json({ message: "Invalid token" });
            }
            req.user = decoded;
            next(); // Proceed if token is valid
        });
    } catch (error) {
        console.error("Error checking authorization:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
