import https from "https";
import http from "http";
import fs from "fs";
import app from "./app";
import { Server } from "socket.io";
import { setupSocket } from "./socket";

const PORT = process.env.PORT || 5000;

// Read SSL certificate files
const privateKey = fs.readFileSync("./keys/server.key", "utf8");
const certificate = fs.readFileSync("./keys/server.cert", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const server = process.env.NODE_ENV === "production" ? https.createServer(app) : http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGINS : "*",
  }
});

// Setup Socket.IO
setupSocket(io);

// Start the HTTPS server with Socket.IO
server.listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});
