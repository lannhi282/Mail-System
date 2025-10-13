const API = "http://localhost:3000";

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
  div.textContent = emails.join("\n\n--------------------\n\n");
}
