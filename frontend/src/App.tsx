import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Course from "./components/MainCourse";
import CreateCourse from './components/CreateCourse';
import CreateLesson from './components/CreateLesson';

function App() {
  return (
    <Router>
   <div>
   <Navbar />
   <Routes>
       <Route path="/Course" element={<Course />} />
       <Route path='/createCourse' element={<CreateCourse/>}/>
       <Route path='createLesson' element={<CreateLesson/>}/>
   </Routes>
   </div>
  </Router>
  );
}

export default App;
