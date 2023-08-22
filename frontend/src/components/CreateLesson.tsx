import { Course, Lesson, User , Type} from '../interfaces/ICourse';
import './css/createcourse.css'
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave , faCirclePlus} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';

function CreateLesson() {
    const location = useLocation();
    const courseID = location.state.courseID;

    const [lessonTitle, setLessonTitle] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const [course, setCourse] = useState<Course>();
    const getCourseByID = async() => {
        const apiUrl = `http://localhost:8080/courses/${courseID}`;
        const option = {
            method: "GET",
            headers: { "Content-Type" : "apllication/json"},
        }
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res)=> {
            if (res){
                setCourse(res);
            }
            else {
                alert("Can not get course by _id");
            }
        })
    }

    const submit = () => {
        let data = {
            "course" : courseID,
            "title" : lessonTitle,
            "content" : content,
            "videoURL" : videoUrl
        };
        const apiUrl = "http://localhost:8080/lessons";
        const option = {
            method : "POST",
            headers : { "Content-Type" : "application/json"},
            body : JSON.stringify(data),
        }
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                alert("Add lesson successfully");
            }else {
                alert("Can not add lesson");
            }
        });
    }

    useEffect(() => {
        getCourseByID();
    },[])

    return (
        <div className="page2">
            <div className='header'>
                Lesson Create
            </div>
            <div className="course-create-container">
                <div className='course-line'>
                    หัวข้อ 
                    <input type="text" id='title' name='title' placeholder='กรอกหัวข้อ' value={course?.title}/>
                </div>
                <div className='course-line'>
                    คำอธิบาย
                    <input type="text" id="description" name='description' placeholder='กรอกคำอธิบาย' value={course?.description}/>
                </div>
                <div className='course-line'>
                    ครูผู้สอน
                    <input type="text" id='instructor' name='instructor' placeholder='กรอกชื่อครูผู้สอน' value={course?.instructor.username}/>
                </div>
                <div className='course-line'>
                    หมวดหมู่
                    <select name="types" id="types" >
                        <option value="">{course?.type.name}</option>
                    </select>
                </div>
                <div className='course-line'>
                    รูปปก
                    <input type="text" id='url' name='url' placeholder='กรอก url รูปหน้าปก' value={course?.url}/>
                </div>
                <hr className="line-divider" />
                <div className="lesson-line">
                    เนื้อหาการสอน
                <button className='add-lesson-button'>
                    <FontAwesomeIcon icon={faCirclePlus} size="2xl" style={{color: "#eb4600",}} />
                </button>
                </div>
                <div className="lesson-line">
                    หัวข้อ
                    <input type="text" id='lesson-title' name='lesson-title' placeholder='กรอกชื่อเนื้อหาการสอน' value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)}/>
                </div>
                <div className="lesson-line">เนื้อหา<input type="text" id='content' name='content' placeholder='กรอกรายละเอียดเนื้อหา' value={content} onChange={(event) => setContent(event.target.value)}/></div>
                <div className="lesson-line">Video<input type="text" id='videoUrl' name='videoUrl' placeholder='กรอก url Video การเรียนการสอน' value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)}/></div>
                <div className="course-create-button">
                    <button onClick={submit}>บันทึก <FontAwesomeIcon icon={faSave} /></button>
                </div>
            </div>
        </div>
    );
}

export default CreateLesson;