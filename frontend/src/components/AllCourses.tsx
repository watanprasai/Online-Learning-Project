import { useEffect, useState } from 'react';
import './css/course.css';
import { Course, Lesson, User, Type } from '../interfaces/ICourse';
import { Link } from 'react-router-dom';

function AllCourses() {
    const [isSearch,setIsSearch] = useState(false);
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

     const [currentPage, setCurrentPage] = useState<number>(1);
     const itemsPerPage: number = 9;
 
     const indexOfLastCourse: number = currentPage * itemsPerPage;
     const indexOfFirstCourse: number = indexOfLastCourse - itemsPerPage;
     const currentCourses: Course[] = courses.slice(indexOfFirstCourse, indexOfLastCourse);
     const pageNumbers: number[] = [];
     for (let i = 1; i <= Math.ceil(courses.length / itemsPerPage); i++) {
         pageNumbers.push(i);
     }
 
     const renderPageNumbers: React.ReactNode[] = pageNumbers.map((number) => (
        <li key={number} className={number === currentPage ? 'current' : ''}>
          <Link
            to={`/allCourse/${number}`}
            onClick={() => setCurrentPage(number)}
            style={{ textDecoration: 'none', color: 'black' }}
          >
            {number}
          </Link>
        </li>
      ));

      const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);
      const filterCourses = () => {
        const filtered = courses.filter((course) => {
            const titleMatch = course.title.toLowerCase().includes(searchCourse.toLowerCase());
            const typeMatch = selectedType === '' || course.type._id === selectedType;
            return titleMatch && typeMatch;
        });
        setFilteredCourses(filtered);
        setCurrentPage(1);
        setIsSearch(true);
    };

    const handleReset = () => {
        setIsSearch(false);
        setSelectedType("");
        setSearchCourse("");
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
                <input type="text" id='type' name='type' placeholder='ค้นหา Course' value={searchCourse} onChange={(event) => setSearchCourse(event.target.value)} />
                <button onClick={filterCourses} className='all-course-search-button'>ค้นหา</button>
                <button onClick={handleReset} className='all-course-reset-button'>รีเซ็ท</button>
            </div>
            <ul className='page-numbers-top'>
                {renderPageNumbers}
            </ul>
            <div className='course-grid-allcourse'>
                {isSearch ? (
                    filteredCourses.map((course) => (
                        <div className='course-item-allcourse' key={course._id}>
                            <img src={require(`../files/${course.url}`)} alt={course.title} />
                            <h4>{course.title}</h4>
                            <Link to={`/courseDetail/${course._id}`}>
                                <button>ดูรายละเอียด</button>
                            </Link>
                        </div>
                    ))
                ) : (
                    currentCourses.map((course) => (
                        <div className='course-item-allcourse' key={course._id}>
                            <img src={require(`../files/${course.url}`)} alt={course.title} />
                            <h4>{course.title}</h4>
                            <Link to={`/courseDetail/${course._id}`}>
                                <button>ดูรายละเอียด</button>
                            </Link>
                        </div>
                    ))
                )}
            </div>
            <ul className='page-numbers-bottom'>
                {renderPageNumbers}
            </ul>
        </div>
    );
};

export default AllCourses;