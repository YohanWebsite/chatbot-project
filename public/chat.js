// public/chat.js

let conversationHistory = []; // To store chat history

// Function to reset the conversation history
function resetConversation() {
  conversationHistory = [];
  document.getElementById("messages").innerHTML = "";

  // Add bot's initial message
  const initialMessage = "Hey, how can I help you with your hair care needs today? Tell me about your hair and I'll give advice.";
  conversationHistory.push({ role: "assistant", content: initialMessage });

  // Display the bot's initial message in the chat
  addMessage("Barbera", initialMessage, "bot");
}

// Function to add messages to the chat
function addMessage(sender, text, type) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("p");

  // Assign class for styling (only "bot" messages get a background)
  if (type === "bot") {
    messageElement.className = type; // "bot"
  }

  // Set sender name
  const senderName = type === "bot" ? "Barbera" : "You";

  // Create message content
  messageElement.innerHTML = `<strong>${senderName}:</strong> ${text}`;

  // Append to the messages div
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
}

// Existing sendMessage function
async function sendMessage() {
  const userInput = document.getElementById("user-input").value.trim();
  if (!userInput) return;

  // Display the user's message in the chat
  addMessage("You", userInput, "user");

  // Add user's message to conversation history
  conversationHistory.push({ role: "user", content: userInput });

  try {
    // Send the conversation history to the server
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: conversationHistory }),
    });

    const data = await response.json();

    // Display the bot's response
    addMessage("Barbera", data.reply, "bot");

    // Add assistant's reply to conversation history
    conversationHistory.push({ role: "assistant", content: data.reply });

    // Clear the input box
    document.getElementById("user-input").value = "";
  } catch (error) {
    console.error("Error sending message:", error);
    addMessage("Error", "Could not get a response.", "bot");
  }
}

// Call resetConversation() when the page loads
window.onload = function () {
  resetConversation();
};
