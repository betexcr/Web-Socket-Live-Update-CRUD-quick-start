const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { v4: uuidv4 } = require("uuid"); // For generating random filenames

// Create Express app
const app = express();
app.use(cors({
  origin: 'http://localhost:5174', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "admin",
  database: "db",
});

// REST API to fetch initial data
app.get("/api/data", (req, res) => {
  db.query("SELECT * FROM db.rows", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query("SELECT * FROM db.related_objects", (err, relatedObjects) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ rows, relatedObjects });
    });
  });
});

app.post("/api/update", (req, res) => {
  const { id, changes } = req.body;

  const fields = Object.keys(changes).map((key) => `${key} = ?`).join(", ");
  const values = [...Object.values(changes), id];

  db.query(`UPDATE db.rows SET ${fields} WHERE id = ?`, values, (err) => {
    if (err) {
      console.error("Database update error:", err.message);
      return res.status(500).json({ error: "Failed to update row" });
    }

    res.json({ success: true });
  });
});

// WebSocket Server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const update = JSON.parse(message);
    const { id, changes } = update;
console.log('update',update)
    // Update the database
    const fields = Object.keys(changes).map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(changes), id];

    db.query(`UPDATE db.rows SET ${fields} WHERE id = ?`, values, (err) => {
      if (err) console.error(err);
    });

    // Broadcast the update to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  });
});
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Use a unique name for each file
  },
});

const upload = multer({ storage });

// Image upload endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Generate the file URL
  const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;

  res.json({ imageUrl }); // Return the URL to the client
});
app.post("/api/delete", (req, res) => {
  const { id } = req.body;

  db.query("DELETE FROM db.rows WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Failed to delete row:", err.message);
      return res.status(500).json({ error: "Failed to delete row" });
    }

    res.json({ success: true });
    wss.clients.forEach((client) => {
      if ( client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({id:id,type:"DELETE",}));
      }
    });
  });
});


app.post("/api/uploadBase64", (req, res) => {
  const { base64Data } = req.body;

  if (!base64Data) {
    return res.status(400).json({ error: "No base64 data provided" });
  }

  // Extract image format from the base64 string
  const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return res.status(400).json({ error: "Invalid base64 data" });
  }

  const imageFormat = matches[1].split("/")[1]; // Extract format (e.g., 'png', 'jpeg')
  const imageData = matches[2];

  // Generate a unique filename
  const uniqueFileName = `${uuidv4()}.${imageFormat}`;
  const uploadDirectory = path.join(__dirname, "uploads");

  // Ensure the 'uploads/' directory exists
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const filePath = path.join(uploadDirectory, uniqueFileName);

  // Save the image to the filesystem
  fs.writeFile(filePath, Buffer.from(imageData, "base64"), (err) => {
    if (err) {
      console.error("Error saving image:", err.message);
      return res.status(500).json({ error: "Failed to save image" });
    }

    // Respond with the image URL
    const imageUrl = `http://localhost:5000/uploads/${uniqueFileName}`;
    res.json({ imageUrl });
  });
});
app.options('/api/delete', cors()); // Handle preflight requests
app.post("/api/add", (req, res) => {
  const defaultRow = {
    name: "New Item",
    age: 0,
    status: false,
    related_id: null,
    date: null,
    color: "#ffffff",
    image: null,
  };
  app.options('/api/add', cors()); // Handle preflight requests
  db.query("INSERT INTO db.rows SET ?", defaultRow, (err, result) => {
    if (err) {
      console.error("Failed to add row:", err.message);
      return res.status(500).json({ error: "Failed to add row" });
    }

    // Return the new row with its id
    res.json({ id: result.insertId, ...defaultRow });
    wss.clients.forEach((client) => {
      if ( client.readyState === WebSocket.OPEN) {
        console.log('result',result)
        client.send(JSON.stringify({id:result.insertId,type:"ADD",changes:{ id: result.insertId, ...defaultRow }}));
      }
    });
  });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Start the Express server
app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});