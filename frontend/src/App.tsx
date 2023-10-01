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
import RegisteredCourses from './components/RegisteredCourses';
import NavbarAdmin from './components/NavbarAdmin';
import EditCourse from './components/EditCourse';
import ShowCourseAdmin from './components/ShowCourseAdmin';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      fetch('http://localhost:8080/secure-route', {
        method: 'GET',
        headers: {
          Authorization: `${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        setUserRole(data.role);
        console.log(userRole);
      })
      .catch(error => {
        console.error('Error fetching user role:', error);
      });
    }
  }, []);

  return (
    <Router>
      <div>
      {isLoggedIn && userRole === 'admin' ? <NavbarAdmin setIsLoggedIn={setIsLoggedIn} /> : isLoggedIn ? <NavbarSignIn setIsLoggedIn={setIsLoggedIn} /> : <NavbarNotSignIn />}
        <Routes>
          <Route path='/' element={<SignIn/>}></Route>
          <Route path='/register' element={<SignUp/>}></Route>
          <Route path="/Course" element={<MainCourse />} />
          <Route path='/createCourse' element={userRole === 'admin' ? <CreateCourse /> : <MainCourse />} />
          <Route path='/createLesson' element={userRole === 'admin' ? <CreateLesson /> : <MainCourse />} />
          <Route path='/showCourse' element={userRole === 'admin' ? <ShowCourseAdmin /> : <MainCourse />} />
          <Route path='/editCourse/:courseId' element={userRole === 'admin' ? <EditCourse /> : <MainCourse />} />
          <Route path='/courseDetail/:courseId' element={<CourseDetail/>}></Route>
          <Route path='/courseStudy/:courseId' element={<CourseStudy/>}></Route>
          <Route path='/editProfile/:userId' element={<EditProfile/>}></Route>
          <Route path='/editProfile/:userId/changePassword' element={<ChangePassword/>}></Route>
          <Route path='/myCourses/:userId' element={<RegisteredCourses/>}></Route>
          <Route path="/allCourse/:page" element={<AllCourses />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
