import express from "express";
import nodemailer from "nodemailer";
import Imap from "imap-simple";
import { simpleParser } from "mailparser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || EMAIL;
const RECEIVER_PASSWORD = process.env.RECEIVER_PASSWORD || PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("❌ Thiếu EMAIL hoặc PASSWORD trong file .env");
  process.exit(1);
}

// API gửi email
app.post("/send", async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL, pass: PASSWORD },
    });

    await transporter.sendMail({
      from: EMAIL,
      to,
      subject,
      text,
    });

    res.json({ success: true, message: "✅ Gửi email thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API nhận email
app.get("/receive", async (req, res) => {
  try {
    const config = {
      imap: {
        user: EMAIL,
        password: PASSWORD,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000,
      },
    };

    const connection = await Imap.connect(config);
    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: ["HEADER", "TEXT", ""],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = [];

    // Lấy 10 email mới nhất
    for (const item of messages.slice(-10)) {
      const all = item.parts.find((part) => part.which === "");
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";
      const parsed = await simpleParser(idHeader + all.body);

      emails.push({
        from: parsed.from?.text || "Unknown",
        subject: parsed.subject || "No Subject",
        text: parsed.text?.substring(0, 200) || "No Content",
        date: parsed.date || new Date(),
      });
    }

    connection.end();
    res.json(emails.reverse());
  } catch (err) {
    console.error("❌ IMAP Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// API nhận email cho hệ thống nhận mail riêng
app.get("/receiver", async (req, res) => {
  try {
    const config = {
      imap: {
        user: RECEIVER_EMAIL,
        password: RECEIVER_PASSWORD,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000,
      },
    };

    const connection = await Imap.connect(config);
    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: ["HEADER", "TEXT", ""],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = [];

    // Lấy 20 email mới nhất
    for (const item of messages.slice(-20)) {
      const all = item.parts.find((part) => part.which === "");
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";
      const parsed = await simpleParser(idHeader + all.body);

      emails.push({
        id: id,
        from: parsed.from?.text || "Unknown",
        subject: parsed.subject || "No Subject",
        text: parsed.text || parsed.html || "No Content",
        date: parsed.date || new Date(),
      });
    }

    connection.end();
    res.json(emails.reverse());
  } catch (err) {
    console.error("❌ IMAP Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(3001, "127.0.0.1", () => {
  console.log("🚀 Mail System backend đã khởi động tại http://127.0.0.1:3001");
  console.log("📧 Email gửi:", EMAIL);
  console.log("📬 Email nhận:", RECEIVER_EMAIL);
  console.log("✅ Sẵn sàng nhận request");
});
