// Grab the elements we need from the page
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");

// Conversation history for the current session only.
// Each item looks like: { role: "user" | "assistant", content: "text" }
const conversation = [];

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = text; // textContent is safe: it never runs HTML
  chatBox.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function hideError() {
  errorEl.classList.add("hidden");
}

function setLoading(isLoading) {
  loadingEl.classList.toggle("hidden", !isLoading);
  sendBtn.disabled = isLoading;
  userInput.disabled = isLoading;
  if (isLoading) {
    scrollToBottom();
  } else {
    userInput.focus();
  }
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  hideError();
  addMessage(text, "user");
  conversation.push({ role: "user", content: text });
  userInput.value = "";
  setLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    conversation.push({ role: "assistant", content: data.reply });
    addMessage(data.reply, "ai");
  } catch (err) {
    // Remove the failed user message so history stays clean
    conversation.pop();
    showError(err.message || "Could not reach the server. Please try again.");
  } finally {
    setLoading(false);
  }
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});