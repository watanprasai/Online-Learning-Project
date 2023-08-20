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
    const courseElement = courses.map((course) => {
        return (<div className='course-item'>
        <img src={require(`../images/${course.url}`)} />
        <h4>{course.title}</h4>
        </div>
        );
        
    })


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
            <div className='header'>
                Course
            </div>
            <div className='search-tab'>
                <select name="types" id="types">
                    {types.map((type) => (
                        <option key={type._id} value={type._id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                    <input type="text" id='type' name='type'/>
            </div>
            <div className='course-grid'>
                {courseElement}
            </div>
            <div className='more-button'>
                <button>ดูทั้งหมด</button>
            </div>
        </div>
    )
}

export default MainCourse;