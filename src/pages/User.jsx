import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const myId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.filter((u) => u._id !== myId)); // exclude self
    }
    fetchUsers();
  }, [myId]);

  function openChat(otherUserId) {
    const conversationId = [myId, otherUserId].sort().join("_");
    navigate(`/chat/${conversationId}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Select User to Chat</h1>
      <div className="space-y-3">
        {users.map((u) => (
          <button
            key={u._id}
            onClick={() => openChat(u._id)}
            className="w-full bg-white shadow p-3 rounded-lg hover:bg-blue-100 text-left"
          >
            {u.username}
          </button>
        ))}
      </div>
    </div>
  );
}
