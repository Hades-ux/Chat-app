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
        <Route path="/registerUser" element={<Register />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ForgotPassword" element={<Forgotpassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ChatProvider>
  )
}

export default App