const express = require("express");
const nodemailer = require("nodemailer");
// const POP3Client = require("poplib");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

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
app.get("/receive", (req, res) => {
  const client = new POP3Client(995, "pop.gmail.com", {
    enabletls: true,
    debug: false,
    tls: { rejectUnauthorized: false },
  });

  let emails = [];
  client.on("connect", () => client.login(EMAIL, PASSWORD));
  client.on("login", (status) => {
    if (status) client.list();
    else res.status(500).json({ message: "Đăng nhập POP3 thất bại" });
  });

  client.on("list", (status, msgcount) => {
    if (msgcount === 0) {
      res.json([]);
      client.quit();
    } else {
      client.retr(msgcount);
    }
  });

  client.on("retr", (status, msgnumber, data) => {
    emails.push(data);
    res.json(emails);
    client.quit();
  });

  client.on("error", (err) => res.status(500).json({ message: err.message }));
});

app.listen(3000, () =>
  console.log("🚀 Mail System backend chạy tại http://localhost:3000")
);
