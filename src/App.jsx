import React, { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";

const App = () => {
  const socket = useMemo(() => io("https://chatapp-viui.onrender.com/"), []);
  const [text, setText] = useState("");
  const [massage, setMessage] = useState([]);
  const [username, setUsername] = useState();

  useEffect(() => {
    const name = prompt("enter your name");
    if (name) {
      setUsername(name);
    } else {
      setUsername("Anonymous");
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("hello", (m) => {
      console.log(m);
    });

    socket.on("re-message", (data) => {
      setMessage((pre) => [...pre, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]); // Empty dependency array ensures this runs only once

  const handler = (e) => {
    e.preventDefault();

    const messageData = {
      user: username,
      text: text.trim(),
    };

    socket.emit("message", messageData);
    setText("");
  };
  return (
    <>
      <div>chat</div>
      <div>Username: {username}</div>
      <form onSubmit={handler}>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          required
        />
        <button type="submit">Send</button>
      </form>
      <div style={{ marginTop: "20px" }}>
        {massage.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.user}: </strong> {msg.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
