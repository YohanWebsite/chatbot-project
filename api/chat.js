// api/chat.js

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Import products.json from the root directory
const products = require(path.join(__dirname, '..', 'products.json'));

app.post('/api/chat', async (req, res) => {
  console.log("Chat endpoint hit!");

  try {
    let conversationHistory = req.body.history || [];

    // Prepare product summaries
    const productSummaries = products.map(product => {
      return `${product.name}: ${product.description} Learn more at ${product.link}`;
    }).join('\n');

    // Updated system message with product information
    const systemMessageContent = `You are an AI assistant for a hair care company. Your task is to assist customers by answering their questions and recommending products from the list below when relevant.

Products:
${productSummaries}

Provide helpful and friendly responses.

Note: Do not mention products that are not in the list.`;

    // Ensure the system message is present
    if (!conversationHistory.find(msg => msg.role === 'system')) {
      conversationHistory.unshift({
        role: "system",
        content: systemMessageContent
      });
    }

    const userMessage = conversationHistory[conversationHistory.length - 1].content;
    console.log("Received user message:", userMessage);

    console.log("Sending conversation history to OpenAI API...");

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

    console.log("OpenAI API response:", data);

    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from OpenAI API");
    }

    // Get assistant's reply
    const assistantMessage = data.choices[0].message.content;

    // Add assistant's reply to conversation history
    conversationHistory.push({ role: "assistant", content: assistantMessage });

    res.status(200).json({ reply: assistantMessage });

  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the app for Vercel
module.exports = app;
