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

    // Prepare product summaries with HTML links
    const productSummaries = products.map(product => {
      return `${product.name}: ${product.description} <a href="${product.link}" target="_blank">${product.name}</a>.`;
    }).join('\n');
    
    const systemMessageContent = 
    `
    You are an AI assistant for a hair care company. Answer customer questions and recommend products from the list below.
    
    Guidelines:
    1. Use product names as clickable links. Example: <a href="https://example.com" target="_blank">Product Name</a>.
    2. Suggest complementary products (e.g., pair shampoos with conditioners).
    3. Reveal prices only if the customer asks.
    4. Be concise, friendly, and professional. Avoid repeating product names in a response.
    5. Only recommend products from the list.
    6. Politely decline irrelevant questions.
    7. Ensure recommendations match the user's hair type or concern. 
    
    Products:
    ${productSummaries}
    `;
    

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
        model: "gpt-4o",          /// gpt-4o   or    gpt-3.5-turbo    


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
