import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const SOCKET_URL = "https://chatapp-viui.onrender.com";
const API_URL = "https://chatapp-viui.onrender.com/api";

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const [mobileView, setMobileView] = useState("list"); // "list" or "chat"
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const myId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Detect mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    }
    fetchUsers();
  }, [token]);

  // Socket setup
  useEffect(() => {
    if (!token) return;
    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on("onlineUsers", (data) => setOnlineUsers(data));

    newSocket.on("privateMessage", (msg) => {
      if (
        activeUser &&
        (msg.sender === activeUser._id || msg.receiver === activeUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    return () => newSocket.disconnect();
  }, [token, activeUser]);

  // Select user and fetch old messages
  const selectUser = async (user) => {
    setActiveUser(user);
    if (isMobile) setMobileView("chat");

    try {
      const res = await fetch(`${API_URL}/messages/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const oldMessages = await res.json();
      setMessages(oldMessages);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !activeUser || activeUser._id === myId) return;

    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to: activeUser._id, message: text }),
    });
    const savedMessage = await res.json();

    socket.emit("privateMessage", savedMessage);
    setMessages((prev) => [...prev, savedMessage]);
    setText("");
    scrollToBottom();
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Sidebar */}
      {(!isMobile || mobileView === "list") && (
        <div
          className={`flex flex-col w-1/3 max-w-[320px] border-r bg-white ${
            isMobile ? "absolute z-50 h-screen" : ""
          }`}
        >
          <div className="p-4 font-bold border-b text-lg">Chats</div>
          <div className="flex-1 overflow-y-auto">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => selectUser(u)}
                className={`p-3 cursor-pointer flex justify-between items-center hover:bg-gray-100 ${
                  activeUser?._id === u._id ? "bg-gray-200" : ""
                }`}
              >
                <span>{u.username}</span>
                {onlineUsers.includes(u._id) && (
                  <span className="text-green-500">●</span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="m-3 p-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Chat Window */}
      {/* Chat Window */}
      {(!isMobile || (isMobile && mobileView === "chat")) && activeUser && (
        <div className="flex-1 flex flex-col h-screen">
          {/* Header (fixed top) */}
          <div className="sticky top-0 z-10 p-4 bg-blue-600 text-white flex items-center">
            {isMobile && (
              <button
                onClick={() => setMobileView("list")}
                className="mr-2 text-white font-bold text-lg"
              >
                ←
              </button>
            )}
            <span className="text-lg font-semibold">{activeUser.username}</span>
          </div>

          {/* Messages (fills between header & input) */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2 bg-gray-50"
          >
            {messages.map((m, i) => {
              const senderId = m.sender.toString();
              const isMe = senderId === myId;
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3 py-2 max-w-[75%] break-words ${
                      isMe
                        ? "bg-sky-400 text-white rounded-l-2xl rounded-tr-2xl rounded-br-none"
                        : "bg-yellow-800 text-white rounded-r-2xl rounded-tl-2xl rounded-bl-none"
                    }`}
                  >
                    <span>{m.text}</span>
                    <div className="text-[10px] text-gray-100 text-right mt-1">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input (fixed bottom) */}
          <div className="sticky bottom-0 z-10 flex p-3 border-t bg-white">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-full"
               disabled={!activeUser}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
