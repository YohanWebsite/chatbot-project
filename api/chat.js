const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const userMessage = req.body.message; // User's latest input
    const conversationHistory = req.body.history || []; // Previous conversation history

    // Add the user's latest message to the conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    // Send the conversation history to the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that remembers context." },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    // Add the bot's reply to the conversation history
    conversationHistory.push({ role: "assistant", content: botReply });

    res.status(200).json({ reply: botReply, history: conversationHistory });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
