import React, { useEffect, useState, useMemo, useRef } from "react";
import { io } from "socket.io-client";

const App = () => {
  const socket = useMemo(() => io("http://localhost:4000"), []);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const name = prompt("Enter your name");
    setUsername(name || "Anonymous");
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("hello", (m) => {
      console.log(m);
    });

    socket.on("re-message", (data) => {
      setMessages((prev) => [
        ...prev,
        { text: data.text, user: data.user, isMe: false },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll input into view on focus (mobile keyboard fix)
  const onFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const handler = (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    const messageData = {
      user: username,
      text: text.trim(),
    };

    setMessages((prev) => [...prev, { ...messageData, isMe: true }]);

    socket.emit("message", messageData);
    setText("");
  };

  return (
    <div
      className="flex flex-col bg-gray-100"
      style={{ height: "100dvh" }} // dynamic viewport height for mobile
    >
      <div className="bg-green-600 text-white p-3 font-bold text-lg">
        Chat App
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`bg-green-300 rounded-xl px-4 py-2 max-w-xs break-words`}
            >
              <div className="text-sm font-semibold text-gray-700">
                {/* {msg.user} */}
              </div>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handler} className="flex p-3 bg-white border-t">
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={onFocus}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default App;
