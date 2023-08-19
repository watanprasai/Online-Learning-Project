import { useEffect, useState } from 'react';
import './css/course.css'
import { Course, Lesson, User , Type} from '../interfaces/ICourse';

function MainCourse() {

    const [users, setUser] = useState<User[]>([]);
    const getUser = async() => {
        const apiUrl = "http://localhost:8080/users";
        const option = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        };
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                setUser(res);
            }
            else {
                console.log("Can not get users");
            }
        });
    };

    const [courses, setCourse] = useState<Course[]>([]);
    const getCourse = async() => {
        const apiUrl = "http://localhost:8080/courses";
        const option = {
            method: "GET",
            headers: {"Content-Type" : "application/json"},
        };
        fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                setCourse(res);
            }
            else {
                console.log("Can not get courses");
            }
        });
    };

    const [types, setType] = useState<Type[]>([]);
    const getType = async() => {
        const apiUrl = "http://localhost:8080/types";
        const option = {
            method: "GET",
            headers: {"Content-Type" : "application/json"},
        };
        fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                setType(res);
            }
            else {
                console.log("Can not get types");
            }
        });
    };

    const [lessons, setLesson] = useState<Lesson[]>([]);
    const getLesson = async() => {
        const apiUrl = "http://localhost:8080/lessons";
        const option = {
            method: "GET",
            headers: {"Content-Type" : "application/json"},
        };
        fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                setLesson(res);
            }
            else {
                console.log("Can not get lessons");
            }
        });
    };
    

    useEffect(() => {
        getUser();
        getCourse();
        getType();
        getLesson();
        
    }, []);

    return (
        <div className='page'>
        <h1>All Users</h1>
        <ul>
            {users.map((user) => (
            <li key={user._id}>
                Username: {user.username}, Email: {user.email}
            </li>
            ))}
        </ul>
        <br/>
        <h1>All Courses</h1>
        <ul>
            {courses.map((course) => (
            <li key={course._id}>
                Title: {course.title}, Description: {course.description}
            </li>
            ))}
        </ul>
        <br/>
        <h1>All Lessons</h1>
        <ul>
            {lessons.map((lesson) => (
            <li key={lesson._id}>
                Title: {lesson.title}
            </li>
            ))}
        </ul>
        <br/>
        <h1>All Types</h1>
        <ul>
            {types.map((type) => (
            <li key={type._id}>
                Name: {type.name}
            </li>
            ))}
        </ul>
        </div>
    )
}

export default MainCourse;