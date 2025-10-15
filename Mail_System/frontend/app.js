const API = "/api";

async function sendMail() {
  try {
    const to = document.getElementById("to").value;
    const subject = document.getElementById("subject").value;
    const text = document.getElementById("message").value;

    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text }),
    });

    const textResponse = await res.text();
    console.log("Raw response:", textResponse);

    try {
      const data = JSON.parse(textResponse);
      alert(data.message);
    } catch {
      alert("❌ Response không phải JSON: " + textResponse);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi kết nối backend: " + err.message);
  }
}
async function getMail() {
  const res = await fetch(`${API}/receive`);
  const emails = await res.json();

  const div = document.getElementById("emails");

  if (emails.length === 0) {
    div.innerHTML = "<p>Không có email nào</p>";
    return;
  }

  div.innerHTML = emails
    .map(
      (email) => `
      <div class="email-item">
        <strong>Từ:</strong> ${email.from}<br>
        <strong>Tiêu đề:</strong> ${email.subject}<br>
        <strong>Nội dung:</strong> ${email.text}<br>
        <small>${new Date(email.date).toLocaleString("vi-VN")}</small>
      </div>
    `
    )
    .join("");
}
