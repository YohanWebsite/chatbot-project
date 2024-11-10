const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

    // Log response data for debugging
    console.log("API response:", data);

    if (!response.ok) {
      console.error("Error:", data); // Log errors if the response isn't OK
      return res.status(response.status).json({ error: data });
    }

    const botReply = data.choices[0].message.content;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
