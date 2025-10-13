import dotenv from "dotenv";
import { Client } from "node-poplib-gowhich";
import { simpleParser } from "mailparser";

dotenv.config();

const client = new Client({
  hostname: process.env.POP3_HOST,
  port: Number(process.env.POP3_PORT) || 995,
  tls: true,
  user: process.env.EMAIL,
  pass: process.env.PASSWORD,
  debug: true,
});

client.on("ready", async () => {
  console.log("✅ Connected & Logged in");

  const { count } = await client.stat();
  console.log(`📬 You have ${count} emails`);

  if (count > 0) {
    const raw = await client.retr(count);
    const parsed = await simpleParser(raw);
    console.log("📨 From:", parsed.from?.text);
    console.log("✉️ Subject:", parsed.subject);
    console.log("📝 Body:", parsed.text?.substring(0, 200));
  }

  client.quit();
});

client.on("error", (err) => console.error("❌ POP3 Error:", err));
client.on("close", () => console.log("👋 Connection closed"));

client.connect();
