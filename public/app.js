const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messagesElement = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const sendBtn = document.getElementById("sendBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("mobileOverlay");

let conversation = [];
let busy = false;

function openMenu() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeMenu() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

document.getElementById("menuBtn").addEventListener("click", openMenu);
document.getElementById("closeSidebar").addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

function addMessage(role, content, isError = false) {
  welcome.hidden = true;

  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}${isError ? " error" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "Y" : "D";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;

  wrapper.append(avatar, bubble);
  messagesElement.appendChild(wrapper);

  document.getElementById("chatArea").scrollTop =
    document.getElementById("chatArea").scrollHeight;

  return wrapper;
}

function setBusy(value) {
  busy = value;
  sendBtn.disabled = value;
  input.disabled = value;
  sendBtn.innerHTML = value ? "…" : "<span>↑</span>";
}

async function sendMessage(text) {
  const content = text.trim();

  if (!content || busy) return;

  conversation.push({ role: "user", content });
  addMessage("user", content);

  input.value = "";
  input.style.height = "auto";
  setBusy(true);

  const typing = addMessage("assistant", "DCO AI is thinking...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to process your message.");
    }

    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("The AI returned an empty response.");
    }

    conversation.push({
      role: "assistant",
      content: data.reply
    });

    typing.querySelector(".bubble").textContent = data.reply;

  } catch (error) {
    typing.classList.add("error");
    typing.querySelector(".bubble").textContent = error.message;
    conversation.pop();
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 150) + "px";
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

document.getElementById("newChat").addEventListener("click", () => {
  conversation = [];
  messagesElement.replaceChildren();
  welcome.hidden = false;
  closeMenu();
  input.value = "";
  input.focus();
});

document.getElementById("chatNav").addEventListener("click", closeMenu);
document.getElementById("historyNav").addEventListener("click", () => {
  closeMenu();
  alert("Conversation history will be available in a future release.");
});

console.log("DCO AI frontend initialized.");
