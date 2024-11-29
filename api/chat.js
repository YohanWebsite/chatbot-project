const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let conversationHistory = []; // Store conversation history
let products = []; // Store product information

// Load products.json at startup
fs.readFile('./products.json', 'utf-8', (err, data) => {
  if (err) {
    console.error("Error reading products.json:", err);
    return;
  }

  try {
    products = JSON.parse(data);
    console.log("Products successfully loaded:", products);
  } catch (error) {
    console.error("Error parsing products.json:", error);
  }
});

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
        content: "You are an AI assistant. Recommend products based on the provided list. If no product matches, provide general advice."
      });
    }

    // Product recommendation logic
    let productRecommendation = null;
    products.forEach(product => {
      if (userMessage.toLowerCase().includes("dandruff")) {
        productRecommendation = product;
      }
    });

    if (productRecommendation) {
      const recommendationMessage = `
        Based on your input, I recommend: **${productRecommendation.name}**.
        - **Category**: ${productRecommendation.category}
        - **Description**: ${productRecommendation.description}
        - [Learn more about this product](${productRecommendation.link})
      `;
      conversationHistory.push({ role: "assistant", content: recommendationMessage });
      res.status(200).json({ reply: recommendationMessage });
      return;
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
        model: "gpt-4o", // Model
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
