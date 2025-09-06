import { useState } from "react";

export default function Login() {
  const [emailOrUsername, setEU] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("https://chatapp-viui.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await res.json();
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id); // <-- add this line
        window.location.href = "/chat";
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <input
          className="w-full border p-2 rounded"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEU(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
        <p className="text-center">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
