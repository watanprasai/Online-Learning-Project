import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Course, Progress, User } from "../interfaces/ICourse";
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
    const [lessonElements, setLessonElements] = useState<JSX.Element[] | null>(null);

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

    const click_start = async () => {
        navigate(`/StudyPage/0/${courseId}`);
    };

    const enroll_course = async () => {
        if (!user_id) {
            await Swal.fire({
                title: 'คุณยังไม่ได้เข้าสู่ระบบ',
                text: 'คุณต้องเข้าสู่ระบบก่อนที่จะลงทะเบียนเรียน',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'เข้าสู่ระบบ',
                cancelButtonText: 'ยกเลิก'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        } else {
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
    }

    const fetchUserData = async () => {
        try {
          const apiUrl = 'http://localhost:8080/getuser';
          const option = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${token}`,
            },
          };
          const response = await fetch(apiUrl, option);
          if (!response.ok) {
            throw new Error('มีข้อผิดพลาดในการร้องขอข้อมูล');
          }
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error('มีข้อผิดพลาดในการร้องขอข้อมูล:', error);
        }
    };

    const check_progress = () => {
        if (course) {
            const progressPromises = course.lessons.map((lesson) => {
                const apiUrl = `http://localhost:8080/getProgress/${lesson._id}`;
                const option = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`
                    },
                };
                return fetch(apiUrl, option)
                    .then((res) => res.json())
                    .then((res) => {
                        if (res) {
                            if (res.error) {
                                return 0;
                            } else {
                                if (res.quizAnswer.length > 0) {
                                    return 100;
                                } else {
                                    return res.videoProgress;
                                }
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('มีข้อผิดพลาดในการร้องขอข้อมูล progress:', error);
                    });
            });
            Promise.all(progressPromises)
                .then((progressArray) => {
                    
                   
                    const totalProgress = progressArray.reduce((accumulator, currentProgress) => {
                        return accumulator + currentProgress;
                    }, 0);
                    const averageProgress = totalProgress / progressArray.length;
                    if (averageProgress >= 80) {
                        Swal.fire({
                            title: 'คุณได้รับ Certificate แล้ว',
                            text: 'คุณได้เสร็จสิ้นคอร์สเรียนและได้รับ Certificate',
                            icon: 'success',
                            confirmButtonText: 'รับทราบ'
                        }).then(() => {
                            navigate(`/getCertificate/${courseId}/${user_id}`);
                        });
                    } else {
                        Swal.fire({
                            title: 'ความคืบหน้ายังไม่ถึง 80%',
                            text: 'โปรดเรียนให้ครบถ้วนเพื่อรับ certificate',
                            icon: 'warning',
                            confirmButtonText: 'รับทราบ'
                        })
                    }
                })
                .catch((error) => {
                    console.error('มีข้อผิดพลาดในการร้องขอข้อมูล progress:', error);
                });
        }
    };
    

    useEffect(() => {
        getUser();
        getCourseDetail();
        fetchUserData();
    }, []);

    useEffect(() => {
        if (course) {
            const progressPromises = course.lessons.map((lesson) => {
                const apiUrl = `http://localhost:8080/getProgress/${lesson._id}`;
                const option = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`
                    },
                };
                return fetch(apiUrl, option)
                    .then((res) => res.json())
                    .then((res) => {
                        if (res) {
                            if (res.error) {
                                return 0;
                            } else {
                                if (res.quizAnswer.length > 0) {
                                    return 100;
                                } else {
                                    return res.videoProgress;
                                }
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('มีข้อผิดพลาดในการร้องขอข้อมูล progress:', error);
                    });
            });

            Promise.all(progressPromises)
                .then((progressArray) => {
                    const lessonElements = course.lessons.map((lesson, index) => {
                        const isVideoLesson = lesson.videoURL;
                        const isQuizLesson = lesson.quizzes.length > 0;
                        const progress = progressArray[index];
                        
                        const progressPercentage = progress / 100;
                    
                        return (
                            <div className="course-detail-lesson" key={index}>
                                <p><b>{index + 1}</b></p>
                                {isVideoLesson && (
                                    <>
                                        <p><b>ชื่อเนื้อหา: </b> {lesson.title}</p>
                                        <p><b>เนื้อหาการสอน: </b> {lesson.content}</p>
                                    </>
                                )}
                                {isQuizLesson && (
                                    <>
                                        <p><b>แบบทดสอบ</b></p>
                                        <p><b>เนื้อหา: </b> {lesson.title}</p>
                                    </>
                                )}
                    
                                {isEnrolled && (
                                    <>
                                        <progress max="1" value={progressPercentage}></progress>
                                        <p><b>ความคืบหน้า: </b> {Math.round(progress)}%</p>
                                    </>
                                )}
                            </div>
                        );
                    });
                    setLessonElements(lessonElements);
                })
                .catch((error) => {
                    console.error('มีข้อผิดพลาดในการร้องขอข้อมูล progress:', error);
                });
        }
    }, [course, token]);

    return (
        <div className="course-detail-page">
            <div className="course-detail-container">
                <div className="course-detail-course">
                    {course ? (
                        <>
                            <div className="course-detail-left">
                                <img className="course-detail-image" src={require(`../files/${course?.url}`)} alt="Course" />
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
                                            <button className="click-to-certificate" onClick={check_progress}>เรียนให้ครบ 80% เพื่อรับ Certificate</button>
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
                <hr style={{ width: '95%', textAlign: 'center', marginTop: '20px', marginBottom: '30px' }} />
                <div className="course-detail-lesson-container">
                    <p className="course-detail-lesson-header">Learning path</p>
                    {lessonElements}
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;
