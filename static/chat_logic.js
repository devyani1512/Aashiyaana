const chatLog = document.getElementById("chat-log");
const chatMessage = document.getElementById("chat-message");
const chatSend = document.getElementById("chat-send");

chatSend.addEventListener("click", sendMessage);
chatMessage.addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});

function appendMessage(sender, text) {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function sendMessage() {
    const message = chatMessage.value.trim();
    if (!message) return;

    appendMessage("You", message);
    chatMessage.value = "";

    fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message})
    })
    .then(res => res.json())
    .then(data => {
        appendMessage("AI", data.ai);
    })
    .catch(err => {
        appendMessage("AI", "ERROR: Could not reach server.");
        console.error(err);
    });
}
