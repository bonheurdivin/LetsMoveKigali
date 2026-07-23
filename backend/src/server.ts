import express from "express";
// backend/src/server.ts
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import managementRoutes from "./routes/managementRoutes";
import tripRoutes from "./routes/tripRoutes";
import prisma from "./config/prisma";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // fine for development; restrict in production
  },
});

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api", managementRoutes);
app.use("/trips", tripRoutes);

// Basic health check route — confirms the server is alive
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Let'sMove Kigali backend is running" });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("gps:update", async (data: { tripId: string; latitude: number; longitude: number; speed?: number }) => {
    try {
      const location = await prisma.gPSLocation.create({
        data: {
          tripId: data.tripId,
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
        },
      });
      // Broadcast to everyone watching this trip (passenger apps)
      io.emit(`gps:${data.tripId}`, location);
    } catch (error) {
      console.error("GPS update error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});