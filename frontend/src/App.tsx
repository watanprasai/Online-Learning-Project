import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Course from "./components/MainCourse";

function App() {
  return (
    <Router>
   <div>
   <Navbar />
   <Routes>
       <Route path="/Course" element={<Course />} />
   </Routes>
   </div>
  </Router>
  );
}

export default App;
