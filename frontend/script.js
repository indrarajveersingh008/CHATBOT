/* ======================================
   AI NEXUS
   SCRIPT.JS
====================================== */
console.log("AI Nexus script loaded");

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

/* ---------- Chat History ---------- */

let chatHistory =
    JSON.parse(localStorage.getItem("chatHistory")) || [];

/* ---------- Markdown ---------- */

marked.setOptions({
    breaks: true,
    gfm: true
});

function formatMessage(text) {
    return marked.parse(text);
}

/* ---------- Save History ---------- */

function saveHistory() {
    localStorage.setItem(
        "chatHistory",
        JSON.stringify(chatHistory)
    );
}

/* ---------- Time ---------- */

function currentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

/* ---------- Scroll ---------- */

function scrollBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* ---------- Add Message ---------- */

function addMessage(text, sender, save = true) {

    const message = document.createElement("div");

    message.className = `message ${sender}`;

    const avatar =
        sender === "bot"
            ? "🤖"
            : "👤";

    message.innerHTML = `

        <div class="avatar">
            ${avatar}
        </div>

        <div class="content">

            <div class="bubble">
                ${formatMessage(text)}
            </div>

            <div class="message-footer">

                <div class="time">
                    ${currentTime()}
                </div>

                ${sender === "bot"
            ? `<button class="copy-btn">📋 Copy</button>`
            : ""
        }

            </div>

        </div>

    `;

    chatBox.appendChild(message);

    /* Highlight code */

    if (window.hljs) {

        message.querySelectorAll("pre code").forEach((block) => {

            hljs.highlightElement(block);

        });

    }

    /* Copy Button */

    const copyBtn = message.querySelector(".copy-btn");

    if (copyBtn) {

        copyBtn.addEventListener("click", () => {

            const code = message.querySelector("pre code");

            if (code) {

                navigator.clipboard.writeText(code.innerText);

            } else {

                navigator.clipboard.writeText(text);

            }

            copyBtn.innerText = "✅ Copied";

            setTimeout(() => {

                copyBtn.innerText = "📋 Copy";

            }, 1500);

        });

    }

    scrollBottom();

    if (save) {

        chatHistory.push({

            sender,

            text

        });

        saveHistory();

    }

}

/* ---------- Typing ---------- */

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "message bot";

    typing.id = "typing";

    typing.innerHTML = `

        <div class="avatar">
            🤖
        </div>

        <div class="content">

            <div class="bubble typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;

    chatBox.appendChild(typing);

    scrollBottom();

}

function hideTyping() {

    const typing = document.getElementById("typing");

    if (typing) {

        typing.remove();

    }

}

/* ---------- Send Message ---------- */

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    addMessage(text, "user");

    messageInput.value = "";

    messageInput.focus();

    showTyping();
    sendBtn.disabled = true;
    sendBtn.innerHTML = "⏳";

    try {

        const response = await fetch(

            ""https://chatbot-41tu.onrender.com/chat"/",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    message: text

                })

            }

        );

        hideTyping();

        if (!response.ok) {

            throw new Error("Server Error");

        }

        const data = await response.json();

        console.log("Backend Response:", data);

        sendBtn.disabled = false;
        sendBtn.innerHTML = "➤";

        if (!data.reply) {

            throw new Error("No 'reply' received from backend.");

        }

        addMessage(data.reply, "bot");
    }

    catch (error) {

        sendBtn.disabled = false;
        sendBtn.innerHTML = "➤";

        hideTyping();

        addMessage(

            "⚠️ Sorry, something went wrong while contacting Gemini.",

            "bot"

        );

        console.error("Frontend Error:", error);

        alert(error.message);

    }

}

/* ---------- Events ---------- */

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

});

/* ---------- New Chat ---------- */

clearBtn.addEventListener("click", function () {

    if (!confirm("Start a new chat?")) {

        return;

    }

    chatHistory = [];

    localStorage.removeItem("chatHistory");

    chatBox.innerHTML = "";

    addMessage(

        "👋 Hello Rajveer! I'm AI Nexus. How can I help you today?",

        "bot",

        false

    );

    messageInput.focus();

});

/* ---------- Restore History ---------- */

window.addEventListener("load", function () {

    chatBox.innerHTML = "";

    if (chatHistory.length > 0) {

        chatHistory.forEach((msg) => {

            addMessage(

                msg.text,

                msg.sender,

                false

            );

        });

    }

    else {

        addMessage(

            "👋 Hello Rajveer! I'm AI Nexus. How can I help you today?",

            "bot",

            false

        );

    }

    messageInput.focus();

});

messageInput.focus();