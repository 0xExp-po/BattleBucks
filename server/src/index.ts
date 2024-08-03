import https from "https";
import fs from "fs";
import app from "./app";
import { io } from "./socket";

const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

// Read SSL certificate files
const privateKey = fs.readFileSync("./keys/server.key", "utf8");
const certificate = fs.readFileSync("./keys/server.cert", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the HTTPS server
httpsServer.listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});

// Socket.IO server (also using HTTPS)
const socketServer = https.createServer(credentials);
io.attach(socketServer);

socketServer.listen(Number(SOCKET_PORT), () => {
  console.log(`Socket.IO server running on https://localhost:${SOCKET_PORT}`);
});
