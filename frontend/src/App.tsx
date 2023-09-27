import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import NavbarSignIn from "./components/NavbarSignIn";
import Course from "./components/MainCourse";
import CreateCourse from './components/CreateCourse';
import CreateLesson from './components/CreateLesson';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import NavbarNotSignIn from './components/NavbarNotSignIn';
import CourseDetail from './components/CourseDetail';
import CourseStudy from './components/CourseStudy';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  return (
    <Router>
   <div>
   {isLoggedIn ? <NavbarSignIn setIsLoggedIn={setIsLoggedIn} /> : <NavbarNotSignIn />}
   <Routes>
       <Route path='/' element={<SignIn/>}></Route>
       <Route path='/register' element={<SignUp/>}></Route>
       <Route path="/Course" element={<Course />} />
       <Route path='/createCourse' element={<CreateCourse/>}/>
       <Route path='/createLesson' element={<CreateLesson/>}/>
       <Route path='/courseDetail/:courseId' element={<CourseDetail/>}></Route>
       <Route path='/courseStudy/:courseId' element={<CourseStudy/>}></Route>
   </Routes>
   </div>
  </Router>
  );
}

export default App;
