import React, { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      // Call your chatbot API here
      fetchBotResponse(input);
    }
  };

  const fetchBotResponse = async (userMessage) => {
    // Simulate bot response (replace with API call)
    const botResponse = `You said: ${userMessage}`;
    setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <p style={{ background: msg.sender === "user" ? "#d1e7dd" : "#f8d7da", padding: "5px", borderRadius: "5px" }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "80%", padding: "10px" }}
      />
      <button onClick={handleSend} style={{ padding: "10px" }}>
        Send
      </button>
    </div>
  );
};

export default Chatbot;
