
const API = "/api";
let autoRefreshInterval = null;
let isAutoRefreshEnabled = true;

async function loadEmails() {
  const emailList = document.getElementById("emailList");
  emailList.innerHTML = '<p class="loading">🔄 Đang tải email...</p>';

  try {
    const res = await fetch(`${API}/receiver`);
    const emails = await res.json();

    if (!emails || emails.length === 0) {
      emailList.innerHTML = '<p class="no-emails">📭 Chưa có email nào</p>';
      updateStats(0, "--");
      return;
    }

    const latestDate = new Date(emails[0].date).toLocaleString("vi-VN");
    updateStats(emails.length, latestDate);

    emailList.innerHTML = emails
      .map(
        (email) => `
        <div class="email-card">
          <div class="email-header">
            <div class="email-from">📤 ${escapeHtml(email.from)}</div>
            <div class="email-date">${new Date(email.date).toLocaleString("vi-VN")}</div>
          </div>
          <div class="email-subject">✉️ ${escapeHtml(email.subject)}</div>
          <div class="email-preview">${escapeHtml(email.text.substring(0, 200))}${email.text.length > 200 ? '...' : ''}</div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    emailList.innerHTML = `<p class="loading">❌ Lỗi: ${error.message}</p>`;
  }
}

function updateStats(total, latest) {
  document.getElementById("totalEmails").textContent = total;
  document.getElementById("latestEmail").textContent = latest;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function toggleAutoRefresh() {
  const btn = document.getElementById("autoRefreshBtn");
  
  if (isAutoRefreshEnabled) {
    clearInterval(autoRefreshInterval);
    btn.textContent = "▶️ Bật tự động làm mới";
    btn.classList.add("paused");
    isAutoRefreshEnabled = false;
  } else {
    startAutoRefresh();
    btn.textContent = "⏸️ Tắt tự động làm mới";
    btn.classList.remove("paused");
    isAutoRefreshEnabled = true;
  }
}

function startAutoRefresh() {
  autoRefreshInterval = setInterval(loadEmails, 30000); // 30 giây
}

// Tải email khi trang được load
loadEmails();

// Tự động làm mới mỗi 30 giây
startAutoRefresh();
