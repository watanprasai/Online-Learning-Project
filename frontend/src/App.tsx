import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import NavbarSignIn from "./components/NavbarSignIn";
import MainCourse from "./components/MainCourse";
import CreateCourse from './components/CreateCourse';
import CreateLesson from './components/CreateLesson';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import NavbarNotSignIn from './components/NavbarNotSignIn';
import CourseDetail from './components/CourseDetail';
import CourseStudy from './components/CourseStudy';
import AllCourses from './components/AllCourses';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';

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
          <Route path="/Course" element={<MainCourse />} />
          <Route path='/createCourse' element={<CreateCourse/>}/>
          <Route path='/createLesson' element={<CreateLesson/>}/>
          <Route path='/courseDetail/:courseId' element={<CourseDetail/>}></Route>
          <Route path='/courseStudy/:courseId' element={<CourseStudy/>}></Route>
          <Route path='/editProfile/:userId' element={<EditProfile/>}></Route>
          <Route path='/editProfile/:userId/changePassword' element={<ChangePassword/>}></Route>
          <Route path="/allCourse/:page" element={<AllCourses />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
