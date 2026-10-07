require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDatabase = require("./config/database");
const { authenticateSocket } = require("./middleware/socketAuth.middleware");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDatabase();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"],
      },
    });

    app.set("io", io);

    io.use(authenticateSocket);

    io.on("connection", (socket) => {
      const userId = socket.user._id.toString();

      socket.join(`user:${userId}`);

      console.log(
        `Socket connected: ${socket.id} | User: ${socket.user.email}`
      );

      socket.on("disconnect", () => {
        console.log(
          `Socket disconnected: ${socket.id} | User: ${socket.user.email}`
        );
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`MeroAsha server running on port ${PORT}`);
      console.log(`Socket.IO running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start MeroAsha server:", error);
    process.exit(1);
  }
};

startServer();
