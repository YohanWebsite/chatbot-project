// public/chat.js

let conversationHistory = []; // To store chat history

async function sendMessage() {
  const userInput = document.getElementById("user-input").value;
  if (!userInput) return;

  // Display the user's message in the chat
  document.getElementById("messages").innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

  // Add user's message to conversation history
  conversationHistory.push({ role: "user", content: userInput });

  try {
    // Send the user's message and history to the server
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: conversationHistory })
    });

    const data = await response.json();

    // Display the bot's response
    document.getElementById("messages").innerHTML += `<p><strong>Bot:</strong> ${data.reply}</p>`;

    // Add assistant's reply to conversation history
    conversationHistory.push({ role: "assistant", content: data.reply });

    // Clear the input box
    document.getElementById("user-input").value = "";
  } catch (error) {
    console.error("Error sending message:", error);
    document.getElementById("messages").innerHTML += `<p><strong>Error:</strong> Could not get a response.</p>`;
  }
}
