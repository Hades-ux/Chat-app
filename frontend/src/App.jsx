import LogIn from "./pages/LogIn.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx"
import Register from "./pages/Register.jsx"
import Forgotpassword from'./pages/Forgotpassword.jsx'
import { Routes, Route } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";

const App = () => {
  return (
    <ChatProvider>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ChatProvider>
  )
}

export default App