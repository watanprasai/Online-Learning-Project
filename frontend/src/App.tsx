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
import AllCourses from './components/AllCourses';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';
import RegisteredCourses from './components/RegisteredCourses';
import NavbarAdmin from './components/NavbarAdmin';
import EditCourse from './components/EditCourse';
import ShowCourseAdmin from './components/ShowCourseAdmin';
import GetCertificate from './components/GetCertificate';
import TypeDetail from './components/TypeDetail';
import HandleRegister from './components/HandleRegister';
import SignUpAdmin from './components/SignUpAdmin';
import AdminReqeust from './components/AdminRequest';
import StudyPage from './components/StudyPage';

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
      })
      .catch(error => {
        console.error('Error fetching user role:', error);
      });
    }
  }, []);

  return (
    <Router>
      <div>
      {isLoggedIn && (userRole === 'admin' || userRole === 'admin-root') ? <NavbarAdmin setIsLoggedIn={setIsLoggedIn} /> : isLoggedIn ? <NavbarSignIn setIsLoggedIn={setIsLoggedIn} /> : <NavbarNotSignIn />}
        <Routes>
          <Route path='/login' element={<SignIn/>}></Route>
          <Route path='/register' element={<SignUp/>}></Route>
          <Route path='/register-as-admin' element={<SignUpAdmin/>}></Route>
          <Route path="/" element={<MainCourse />} />
          <Route path="/handle-register" element={<HandleRegister />} />
          <Route path='/createCourse' element={(userRole === 'admin' || userRole === 'admin-root') ? <CreateCourse /> : <MainCourse />} />
          <Route path='/createLesson' element={(userRole === 'admin' || userRole === 'admin-root') ? <CreateLesson /> : <MainCourse />} />
          <Route path='/typesDetail' element={userRole === 'admin-root'  ? <TypeDetail /> : <MainCourse />} />
          <Route path='/showCourse' element={(userRole === 'admin' || userRole === 'admin-root') ? <ShowCourseAdmin /> : <MainCourse />} />
          <Route path='/request-admin' element={userRole === 'admin-root' ? <AdminReqeust /> : <MainCourse />} />
          <Route path='/editCourse/:courseId' element={(userRole === 'admin' || userRole === 'admin-root') ? <EditCourse /> : <MainCourse />} />
          <Route path='/courseDetail/:courseId' element={<CourseDetail/>}></Route>
          <Route path='/editProfile/:userId' element={<EditProfile/>}></Route>
          <Route path='/editProfile/:userId/changePassword' element={<ChangePassword/>}></Route>
          <Route path='/myCourses/:userId' element={<RegisteredCourses/>}></Route>
          <Route path="/allCourse/:page" element={<AllCourses />}/>
          <Route path="/StudyPage/:lessonNumber/:courseId" element={<StudyPage />}/>
          <Route path="/getCertificate/:courseId/:userId" element={<GetCertificate />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
