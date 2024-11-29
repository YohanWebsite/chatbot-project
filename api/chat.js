// api/chat.js

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(bodyParser.json());

let conversationHistory = []; // Store conversation history

// Import products.json from the root directory
const products = require(path.join(__dirname, '..', 'products.json'));

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
        content: "You are an AI assistant. Answer questions as accurately as possible. If relevant, recommend a product from the list provided."
      });
    }

    console.log("Current conversation history:", conversationHistory);

    // Simple product recommendation logic
    let productRecommendation = null;

    // Convert user message to lowercase for case-insensitive matching
    const lowerCaseMessage = userMessage.toLowerCase();

    // Check for keywords in the user message
    if (lowerCaseMessage.includes("dandruff")) {
      productRecommendation = products.find(product =>
        product.name.toLowerCase().includes("dandruff")
      );
    }

    console.log("Product recommendation found:", productRecommendation);

    if (productRecommendation) {
      const recommendationMessage = `Based on your input, I recommend: ${productRecommendation.name}. You can learn more here: ${productRecommendation.link}`;
      conversationHistory.push({ role: "assistant", content: recommendationMessage });
      console.log("Product recommendation sent:", recommendationMessage);
      res.status(200).json({ reply: recommendationMessage });
      return;
    }

    console.log("Sending conversation history to OpenAI API...");

    // Send the conversation history to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4", // Adjust the model as needed
        messages: conversationHistory
      })
    });

    const data = await response.json();

    console.log("OpenAI API response:", data);

    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from OpenAI API");
    }

    // Add assistant's reply to the conversation history
    const assistantMessage = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: assistantMessage });

    res.status(200).json({ reply: assistantMessage });

  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the app for Vercel
module.exports = app;
