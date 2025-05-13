// index.js
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import dotenv from "dotenv";
import urlSchema from "./schema/urlSchema.js";
import { generateSafeId } from "./utils/idGenerator.js";
import mime from "mime";

// Load environment variables
const imports = dotenv.config();

console.log(imports);

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an instance of the Express application
const app = express();

// Set the port number
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Import the UrlModel
const UrlModel = urlSchema;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// serve CSS correctly
// Serve static files with explicit MIME type setting
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      const mimeType = mime.getType(filePath);
      if (mimeType) {
        res.setHeader("Content-Type", mimeType);
      }
    },
  })
);

// Route for serving the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Get API route names from environment variables
const redirectURLparams = process.env.REDIRECT_URL_PARAMS || "redirect";
const shortenURL = process.env.SHORTEN_URL || "shorten";
const API_PASSWORD = process.env.API_PASSWORD || "default_password";

// Route for shortening URLs (custom API endpoint)
app.post(`/${shortenURL}`, async (req, res) => {
  try {
    // Extract password and longURL from request body
    const { password, longURL } = req.body;

    // Check if password is correct
    if (password !== API_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized: Invalid password" });
    }

    // Validate longURL
    if (!longURL) {
      return res.status(400).json({ error: "longURL parameter is required" });
    }

    // Generate a unique short code
    // const shortCode = uuidv4().substring(0, 8); // Use first 8 characters for shorter codes
    const shortCode = generateSafeId();

    // Create new URL document
    const newUrl = new UrlModel({
      shortCode,
      originalUrl: longURL,
    });

    // Save to database
    await newUrl.save();

    // Construct the shortened URL
    const shortenedUrl = `${req.protocol}://${req.get(
      "host"
    )}/${redirectURLparams}/${shortCode}`;

    // Send the shortened URL to the client
    res.json({
      success: true,
      shortCode,
      shortenedUrl,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route for redirecting to the original URL (custom API endpoint)
app.get(`/${redirectURLparams}/:shortCode`, async (req, res) => {
  try {
    // Extract the short code from the request parameters
    const shortCode = req.params.shortCode;

    // Find the URL in the database
    const urlDoc = await UrlModel.findOne({ shortCode });

    if (urlDoc) {
      // If the short code exists, redirect to the original URL with params preserved
      let originalUrl = urlDoc.originalUrl;

      // Preserve query parameters
      const queryString = req.url.split("?")[1];
      if (queryString) {
        // Check if original URL already has query parameters
        const separator = originalUrl.includes("?") ? "&" : "?";
        originalUrl += separator + queryString;
      }

      res.redirect(originalUrl);
    } else {
      // If the short code does not exist, send a 404 error
      res.status(404).json({ error: "Shortened URL not found" });
    }
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route for shortening URLs (web interface form)
app.post("/shorten", async (req, res) => {
  try {
    // Extract the password and original URL from the request body
    const { password, longUrl } = req.body;

    // Check if password is correct
    if (password !== API_PASSWORD) {
      return res.status(401).send("Unauthorized: Invalid password");
    }

    // Validate longUrl
    if (!longUrl) {
      return res.status(400).send("Original URL is required");
    }

    // Generate a unique short code
    // const shortCode = uuidv4().substring(0, 8);
    const shortCode = generateSafeId();

    // Create new URL document
    const newUrl = new UrlModel({
      shortCode,
      originalUrl: longUrl,
    });

    // Save to database
    await newUrl.save();

    // Construct the shortened URL
    const shortenedUrl = `${req.protocol}://${req.get(
      "host"
    )}/${redirectURLparams}/${shortCode}`;

    // Send the shortened URL to the client
    res.send(
      `Your URL has been shortened: <a href="${shortenedUrl}">${shortenedUrl}</a>`
    );
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).send("Error creating short URL");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Shorten API endpoint: POST /${shortenURL}`);
  console.log(`Redirect API endpoint: GET /${redirectURLparams}/:shortCode`);
});
