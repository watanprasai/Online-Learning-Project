import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Course, User } from "../interfaces/ICourse";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import './css/coursedetail.css'

function CourseDetail() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course>();
    const [ user , setUser ] = useState<User>();
    const user_id = localStorage.getItem('_id') || "";
    const token = localStorage.getItem('token') || "";
    const [isEnrolled , setIsEnrolled] = useState<boolean>();

    const getUser = () => {
        const apiUrl = `http://localhost:8080/users/${user_id}`;
        const option = {
            method : "GET",
            headers : {
                "Content-Type" : "application/json"
            }
        }
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res) => {
            if (res) {
                setUser(res);
            }
            else {
                console.log("Can not get User");
            }
        })
    };

    const getCourseDetail = () => {
        const apiUrl = `http://localhost:8080/courses/${courseId}`;
        const option = {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization" : `bearer ${token}`
            },
        };
        fetch(apiUrl, option)
            .then((res) => res.json())
            .then((res) => {
                if (res) {
                    setCourse(res);
                    const userEnrolled = res.enrolledStudents.some((student: { _id: string; }) => student._id === user_id);
                    setIsEnrolled(userEnrolled);
                } else {
                    console.log("Can not get Course");
                }
            });
    };

    const lessonElement = course?.lessons.map((lesson, index)=>{
        return (
            <div className="course-detail-lesson">
                <p><b>{index + 1}</b></p>
                <p><b>ชื่อเนื้อหา: </b> {lesson.title}</p>
                <p><b>เนื้อหาการสอน: </b> {lesson.content}</p>
                {/* <video width="320" height="240" controls>
                    <source
                        src={require(`../files/${lesson.videoURL}`)}
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video> */}
            </div>
        )
    });

    const click_start = async () => {
        navigate(`/courseStudy/${courseId}`);
    };

    const enroll_course = async () => {
        const apiUrl = `http://localhost:8080/courses/${courseId}/enroll`;
        const option = {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                Authorization: token,
            },
        };
        const res = await fetch(apiUrl,option);
        const data = await res.json();
        if (res.ok) {
            await Swal.fire({
                title: 'ลงทำเบียนเรียนสำเร็จ',
                text: 'คุณได้ลงทะเบียนเรียนคอร์สนี้แล้ว',
                icon: 'success',
                confirmButtonText: 'รับทราบ'
            })
            window.location.reload();
        }else {
            await Swal.fire({
                title: 'ลงทะเบียนเรียนไม่สำเร็จ',
                text: data.error,
                icon: 'error',
                confirmButtonText: 'รับทราบ'
            });
        }
    }

    useEffect(() => {
        getUser();
        getCourseDetail();
    }, []);


    return (
        <div className="course-detail-page">
            <div className="course-detail-container">
                <div className="course-detail-course">
                {course ? (
                    <>
                        <div className="course-detail-left">
                            <img className="course-detail-image" src={require(`../files/${course?.url}`)}/>
                        </div>
                        <div className="course-detail-right">
                            <div className="course-detail-right-header">
                                <p><b>ชื่อคอร์ส: </b>{course.title}</p>
                            </div>
                            <div className="course-detail-right-text">
                                <p><b>คำอธิบาย: </b>{course.description}</p>
                            </div>
                            <div className="course-detail-right-text">
                                <p><b>ครูผู้สอน: </b>{course.instructor.username}</p>
                            </div>
                            <div className="course-detail-right-text">
                                <p><b>รหัส: </b>{course._id}</p>
                            </div>
                            <div className="course-detail-enroll">
                                {isEnrolled ? (
                                    <div className="course-detail-registered">
                                        <p className="enrolled-message">คุณลงทะเบียนคอร์สนี้แล้ว</p>
                                        <button className="start-button" onClick={click_start}>เริ่มเรียน</button>
                                    </div>
                                ) : (
                                    <button className="enroll-button" onClick={enroll_course}>ลงทะเบียนเรียน</button>    
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )}   
                </div>
                <hr style={{ width: '95%', textAlign: 'center',marginTop:'20px',marginBottom:'30px'}} />
                <div className="course-detail-lesson-container">
                    <p className="course-detail-lesson-header">Learning path</p>
                    {lessonElement}
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;
