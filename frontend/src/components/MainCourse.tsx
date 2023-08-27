import { useEffect, useState } from 'react';
import './css/course.css'
import { Course, Lesson, User , Type} from '../interfaces/ICourse';
import { Link } from 'react-router-dom';

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

    const [searchCourse, setSearchCourse] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const filteredCourse = courses.filter((course) => {
        const titleMatch = course.title.includes(searchCourse);
        const typeMatch = selectedType === '' || course.type._id === selectedType;
        return titleMatch && typeMatch;
    })

    const courseElement = filteredCourse.map((course) => {
        return (<div className='course-item'>
        <img src={require(`../../../backend/images/${course.url}`)} />
        <h4>{course.title}</h4>
        <Link to={`/courseDetail/${course._id}`}>
            <button>ดูรายละเอียด</button>
        </Link>
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
        <div className='page1'>
            <div className='header'>
                Course
            </div>
            <div className='search-tab'>
                <select name="types" id="types" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                    <option value="">เลือกประเภท</option>
                    {types.map((type) => (
                        <option key={type._id} value={type._id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                <input type="text" id='type' name='type' placeholder='ค้นหา Course' value={searchCourse} onChange={(event) => setSearchCourse(event.target.value)}/>
            </div>
            <div className='course-grid'>
                {courseElement}
            </div>
            <div className='more-button'>
                <Link to='/allCourse'>
                    <button>ดูทั้งหมด</button>
                </Link>
            </div>
        </div>
    )
}

export default MainCourse;