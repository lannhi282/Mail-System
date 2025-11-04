import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const backendProcess = spawn("node", ["Mail_System/backend/index.js"], {
  stdio: "inherit",
  cwd: __dirname,
});

backendProcess.on("error", (err) => {
  console.error("Failed to start backend:", err);
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
  })
);

app.use(express.static(path.join(__dirname, "Mail_System/frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Mail_System/frontend/index.html"));
});

app.listen(5000, "0.0.0.0", () => {
  console.log("🎨 Frontend server running at http://0.0.0.0:5000");
});
