import { useState, useEffect, useRef } from 'react'; 
import { useParams } from "react-router-dom";
import { Course } from '../interfaces/ICourse';
import './css/coursestudy.css';

function CourseStudy() {
    const [currentLesson, setCurrentLesson] = useState(0);
    const [progress, setProgress] = useState(0);
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course>();
    const user_id = localStorage.getItem('_id') || "";
    const token = localStorage.getItem('token') || "";
    const [isEnrolled, setIsEnrolled] = useState<boolean>();
    const [lessons, setLessons] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const getCourseDetail = () => {
        const apiUrl = `http://localhost:8080/courses/${courseId}`;
        const option = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `bearer ${token}`
            },
        };
        fetch(apiUrl, option)
            .then((res) => res.json())
            .then((res) => {
                if (res) {
                    setCourse(res);
                    const userEnrolled = res.enrolledStudents.some((student: { _id: string; }) => student._id === user_id);
                    setIsEnrolled(userEnrolled);
                    if (res.lessons) {
                        setLessons(res.lessons);
                    }
                } else {
                    console.log("Can not get Course");
                }
            });
    };

    const handleVideoTimeUpdate = (event: any) => {
        setCurrentTime(event.target.currentTime);
        // คำนวณ progress จากเวลาในคลิปและบทเรียนทั้งหมด
        const totalLessonTime = lessons.reduce((total, lesson) => total + lesson.duration, 0);
        const currentTimeInCourse = lessons.slice(0, currentLesson).reduce((total, lesson) => total + lesson.duration, 0) + event.target.currentTime;
        const newProgress = (currentTimeInCourse / totalLessonTime) * 100;
        setProgress(newProgress);
    };

    const handleVideoLoadedData = (event: any) => {
        setVideoDuration(event.target.duration);
    };

    const loadLessonData = () => {
        if (course && isEnrolled) {
            if (lessons.length > 0) {
                const newProgress = ((currentLesson + 1) / lessons.length) * 100;
                setProgress(newProgress);
            }
        }
    };

    const goToNextLesson = () => {
        if (currentLesson < lessons.length - 1) {
            setCurrentLesson(currentLesson + 1);
        }
    };

    const goToPreviousLesson = () => {
        if (currentLesson > 0) {
            setCurrentLesson(currentLesson - 1);
        }
    };

    const handleVideoEnded = () => {
        const newProgress = ((currentLesson + 1) / lessons.length) * 100;
        setProgress(newProgress);
    };

    useEffect(() => {
        getCourseDetail();
    }, []);

    useEffect(() => {
        loadLessonData();
    }, [course, isEnrolled, currentLesson]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = require(`../files/${lessons[currentLesson].videoURL}`);
            videoRef.current.load();
            videoRef.current.play();
        }
    }, [currentLesson]);

    return (
        <div className="course-study-container">
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}>
                    {`${Math.floor(currentTime)} / ${Math.floor(videoDuration)} seconds`}
                </div>
            </div>
            <div className="lesson-content">
                {lessons.length > 0 && (
                    <>
                        <h1>{lessons[currentLesson].title}</h1>
                        <p>{lessons[currentLesson].content}</p>
                        <video ref={videoRef} width="320" height="240" controls
                            onEnded={handleVideoEnded}
                            onTimeUpdate={handleVideoTimeUpdate}
                            onLoadedData={handleVideoLoadedData}
                        >
                            <source
                                src={require(`../files/${lessons[currentLesson].videoURL}`)}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    </>
                )}
            </div>
            <div className="lesson-controls">
                <button
                    onClick={goToPreviousLesson}
                    disabled={currentLesson === 0}
                >
                    บทเรียนก่อนหน้า
                </button>
                <button
                    onClick={goToNextLesson}
                    disabled={currentLesson === lessons.length - 1}
                >
                    บทเรียนถัดไป
                </button>
            </div>
        </div>
    );
}

export default CourseStudy;
