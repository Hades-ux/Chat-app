import LogIn from "./component/LogIn.page.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx"
import Register from "./pages/Register.jsx"
import Forgotpassword from'./pages/Forgotpassword.jsx'
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/registerUser" element={<Register />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ForgotPassword" element={<Forgotpassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  )
}

export default App