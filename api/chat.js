const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let conversationHistory = []; // Store conversation history

app.post('/api/chat', async (req, res) => {
  console.log("Chat endpoint hit!");

  try {
    const userMessage = req.body.message;
    console.log("Received user message:", userMessage);

    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    // Add the system message at the start of the conversation
    if (conversationHistory.length === 1) {
      conversationHistory.unshift({
        role: "system",
        content: "You are an AI assistant. Answer questions as accurately as possible."
      });
    }

    console.log("Conversation history being sent to OpenAI API:", conversationHistory);

    // Send the conversation history to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: conversationHistory
      })
    });

    const data = await response.json();

    // Add assistant's reply to the conversation history
    const assistantMessage = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: assistantMessage });

    console.log("OpenAI API response:", data);
    res.status(200).json({ reply: assistantMessage });

  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the HTTP server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
