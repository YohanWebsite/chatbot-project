const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let conversationHistory = []; // Store conversation history
let products = []; // Store product information

// Define possible paths for products.json
const possiblePaths = [
  path.join(__dirname, 'products.json'), // In the same folder as chat.js
  path.join(__dirname, 'api/products.json') // In the api folder
];

// Attempt to load products.json from any of the paths
function loadProductsFile() {
  let loaded = false;
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        products = JSON.parse(data);
        console.log("Products successfully loaded from:", filePath);
        loaded = true;
        break;
      }
    } catch (error) {
      console.error("Error reading products.json from:", filePath, error);
    }
  }

  // Fallback: Static hardcoded file path
  if (!loaded) {
    const staticPath = path.join(__dirname, 'products.json'); // Adjust as needed
    try {
      const data = fs.readFileSync(staticPath, 'utf-8');
      products = JSON.parse(data);
      console.log("Products successfully loaded from static path:", staticPath);
    } catch (error) {
      console.error("Failed to load products.json from static path:", staticPath, error);
    }
  }
}

// Call the function to load the file
loadProductsFile();

app.post('/api/chat', async (req, res) => {
  console.log("Chat endpoint hit!"); // Check if the endpoint is being triggered

  try {
    const userMessage = req.body.message;
    console.log("Received user message:", userMessage); // Log user input

    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    // Add the system message at the start of the conversation
    if (conversationHistory.length === 1) {
      conversationHistory.unshift({
        role: "system",
        content: "You are an AI assistant. Answer questions as accurately as possible. If relevant, recommend a product from the list provided."
      });
    }

    // Debug: Log the conversation history
    console.log("Current conversation history:", conversationHistory);

    // Simple product recommendation logic
    let productRecommendation = null;
    if (userMessage.toLowerCase().includes("dandruff")) {
      productRecommendation = products.find(product =>
        product.name.toLowerCase().includes("dandruff")
      );
    }

    // Debug: Log the product recommendation logic result
    console.log("Product recommendation found:", productRecommendation);

    if (productRecommendation) {
      const recommendationMessage = `Based on your input, I recommend: ${productRecommendation.name}. You can learn more here: ${productRecommendation.link}`;
      conversationHistory.push({ role: "assistant", content: recommendationMessage });
      console.log("Product recommendation sent:", recommendationMessage); // Log the recommendation
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
        model: "gpt-4o", // Model
        messages: conversationHistory
      })
    });

    const data = await response.json();

    // Debug: Log the OpenAI API response
    console.log("OpenAI API response:", data);

    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from OpenAI API");
    }

    // Add assistant's reply to the conversation history
    const assistantMessage = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: assistantMessage });

    res.status(200).json({ reply: assistantMessage });

  } catch (error) {
    console.error("Error during processing:", error); // Log errors
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the HTTP server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
