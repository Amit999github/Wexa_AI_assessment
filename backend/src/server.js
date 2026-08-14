import dotenv from "dotenv";
import app from "./app.js";
import { verifyConnectivity } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await verifyConnectivity();
    console.log("[server] Connected to CognoDB.");
  } catch (err) {
    console.error(
      "[server] Could not verify CognoDB connectivity at startup:",
      err.message,
    );
  }

  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

start();
