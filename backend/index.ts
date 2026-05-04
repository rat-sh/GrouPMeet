import app from "./src/app";
import { connectDB } from "./src/config/database";
import { createServer } from "http";
import { initializeSocket } from "./src/utils/socket";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
try {
    initializeSocket(httpServer);
} catch (error) {
    console.error("Failed to initialize socket server:", error);
    httpServer.close();
    process.exit(1);
}

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
        console.error("Error connecting to database: ", error);
        process.exit(1);
    });