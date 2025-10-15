const API = "/api";

async function sendMail() {
  const to = document.getElementById("to").value;
  const subject = document.getElementById("subject").value;
  const text = document.getElementById("message").value;

  const res = await fetch(`${API}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, text }),
  });

  const data = await res.json();
  alert(data.message);
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
