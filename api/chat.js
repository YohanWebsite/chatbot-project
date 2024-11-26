const fs = require('fs');
const pdf = require('pdf-parse');
const fetch = require('node-fetch');

let pdfText = ""; // This will store the extracted PDF content

// Load and parse the PDF at server startup
fs.readFile('./New Handbook.pdf', async (err, data) => {
  if (err) {
    console.error("Error reading the PDF:", err);
    return;
  }

  try {
    const pdfData = await pdf(data);
    pdfText = pdfData.text; // Store the extracted content
    console.log("PDF content successfully loaded.");
  } catch (error) {
    console.error("Error parsing the PDF:", error);
  }
});

module.exports = async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Log the extracted PDF content being sent to the OpenAI API
    console.log("PDF content being sent to OpenAI API:", pdfText.substring(0, 500)); // Logs the first 500 characters

    // Send the extracted PDF content to the OpenAI API as context
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a company handbook assistant. Answer questions based on the company handbook provided below. Do not answer questions not related to the handbook" },
          { role: "assistant", content: pdfText }, // Pass the PDF text as context
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

