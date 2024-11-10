async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;
  
    document.getElementById("messages").innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
  
    // Call the serverless function
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput })
    });
  
    const data = await response.json();
    document.getElementById("messages").innerHTML += `<p><strong>Bot:</strong> ${data.reply}</p>`;
    document.getElementById("user-input").value = "";
  }
  