import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Loginpage";
import Signup from "./pages/Signuppage";
import Chat from "./pages/Chatpage";
import User from "./pages/User";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/user" element={<User />} />
    </Routes>
  );
}

export default App;
