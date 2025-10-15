import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Chờ backend khởi động
setTimeout(() => {
  const backendProcess = spawn("node", ["Mail_System/backend/index.js"], {
    stdio: "inherit",
    cwd: __dirname,
  });

  backendProcess.on("error", (err) => {
    console.error("❌ Lỗi khởi động backend:", err);
  });
}, 1000);

// Proxy API requests tới backend
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
    onError: (err, req, res) => {
      console.error("❌ Proxy error:", err.message);
      res.status(500).json({ error: "Backend không phản hồi" });
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "Mail_System/frontend")));

// Serve index.html cho tất cả routes khác (fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "Mail_System/frontend/index.html"));
});

app.listen(5000, "0.0.0.0", () => {
  console.log("🎨 Frontend server đang chạy tại http://0.0.0.0:5000");
  console.log("🔄 Backend sẽ khởi động trong giây lát...");
});
