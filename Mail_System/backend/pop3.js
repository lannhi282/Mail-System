import dotenv from "dotenv";
import { POP3Client } from "node-pop3";
dotenv.config();

const client = new POP3Client(
  Number(process.env.POP3_PORT) || 995,
  process.env.POP3_HOST || "pop.gmail.com",
  {
    enabletls: true,
    debug: true,
    tls: { rejectUnauthorized: false },
  }
);

client.on("connect", () => {
  console.log("🔌 Đang kết nối...");
  client.login(process.env.EMAIL, process.env.PASSWORD);
});

client.on("login", (status, rawdata) => {
  if (status) {
    console.log("✅ Đăng nhập thành công!");
    client.list();
  } else {
    console.error("❌ Đăng nhập thất bại:", rawdata);
    client.quit();
  }
});

client.on("list", (status, msgcount, msgnumber, data, rawdata) => {
  console.log(`📬 Bạn có ${msgcount} email`);

  if (msgcount === 0) {
    console.log("📭 Hộp thư trống");
    client.quit();
  } else {
    console.log(`📨 Đang lấy email #${msgcount}...`);
    client.retr(msgcount);
  }
});

client.on("retr", (status, msgnumber, data, rawdata) => {
  console.log("\n📧 Email mới nhất:");
  console.log("─".repeat(50));

  const lines = data.split("\n");
  const fromLine = lines.find((l) => l.toLowerCase().startsWith("from:"));
  const subjectLine = lines.find((l) => l.toLowerCase().startsWith("subject:"));

  if (fromLine) console.log("📤", fromLine);
  if (subjectLine) console.log("✉️ ", subjectLine);

  console.log("\n📝 Nội dung (200 ký tự đầu):");
  const bodyStart = data.indexOf("\n\n");
  if (bodyStart > 0) {
    console.log(data.substring(bodyStart + 2, bodyStart + 202) + "...");
  }

  console.log("─".repeat(50));
  client.quit();
});

client.on("error", (err) => {
  console.error("❌ Lỗi POP3:", err.message);
  client.quit();
});

client.on("quit", () => {
  console.log("👋 Đã ngắt kết nối");
});
