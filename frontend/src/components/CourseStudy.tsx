import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Course, Quiz } from '../interfaces/ICourse';
import './css/coursestudy.css';

function CourseStudy() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(0);
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>();
  const user_id = localStorage.getItem('_id') || '';
  const token = localStorage.getItem('token') || '';
  const [isEnrolled, setIsEnrolled] = useState<boolean>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizData, setQuizData] = useState<Quiz | undefined>();

  const getCourseDetail = () => {
    const apiUrl = `http://localhost:8080/courses/${courseId}`;
    const option = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      },
    };
    fetch(apiUrl, option)
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          setCourse(res);
          const userEnrolled = res.enrolledStudents.some(
            (student: { _id: string }) => student._id === user_id
          );
          setIsEnrolled(userEnrolled);
          if (res.lessons) {
            console.log(res);
            setLessons(res.lessons);
          }
        } else {
          console.log('Can not get Course');
        }
      });
  };

  const getQuizDetail = () => {
    if (lessons[currentLesson]?.quiz) {
      const quizApiUrl = `http://localhost:8080/quizzes/${lessons[currentLesson].quiz}`;
      const quizOption = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      };
      fetch(quizApiUrl, quizOption)
        .then((res) => res.json())
        .then((res) => {
          if (res) {
            setQuizData(res);
            console.log(res);
          } else {
            console.log('Can not get Quiz');
          }
        });
    } else {
      setQuizData(undefined);
    }
  };

  const handleVideoTimeUpdate = (event: any) => {
    setCurrentTime(event.target.currentTime);
    const totalLessonTime = lessons.reduce((total, lesson) => total + lesson.duration, 0);
    const currentTimeInCourse =
      lessons.slice(0, currentLesson).reduce((total, lesson) => total + lesson.duration, 0) +
      event.target.currentTime;
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

  const videoForm = () => {
    return (
      <div className="lesson-content-study">
        {lessons.length > 0 && (
          <>
            <h1>{lessons[currentLesson].title}</h1>
            <p>{lessons[currentLesson].content}</p>
            <video
              ref={videoRef}
              width="320"
              height="240"
              controls
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
    );
  };  

  const handleSubmit = () => {
    
  };

  const isQuizAvailable = lessons[currentLesson]?.quiz !== undefined;

  const quizForm = () => {
    return (
      <div className="quiz-form-study">
        <h2>แบบทดสอบ</h2>
        <hr style={{ width: '100%', textAlign: 'center',marginBottom:'15px'}} />
        <form onSubmit={handleSubmit}>
          {isQuizAvailable && quizData ? (
            <>
              <p>{quizData.question}</p>
              <ul>
                {quizData.options.map((option: any, index: any) => (
                  <li key={index}>
                    <label>
                      <input
                        type="radio"
                        name="answer"
                        value={option._id}
                        onChange={(event) => {
                          const selectedAnswer = event.target.value;
                          setAnswers({ answer: selectedAnswer });
                        }}
                        disabled={isSubmitted}
                      />
                      {option.option}
                    </label>
                  </li>
                ))}
              </ul>
              <button type="submit" disabled={isSubmitted} className='quiz-form-study-button-send'>
                ส่งคำตอบ
              </button>
            </>
          ) : (
            <p>ไม่มีคำถาม (Quiz) ในบทเรียนนี้</p>
          )}
        </form>
      </div>
    );
  };
  

  useEffect(() => {
    getCourseDetail();
  }, []);

  useEffect(() => {
    loadLessonData();
  }, [course, isEnrolled, currentLesson]);

  useEffect(() => {
    if (videoRef.current && lessons[currentLesson]?.videoUrl) {
      videoRef.current.src = require(`../files/${lessons[currentLesson].videoURL}`);
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [currentLesson]);

  useEffect(() => {
    getQuizDetail();
  }, [currentLesson, lessons]);

  return (
    <div className="course-study-container">
        {isQuizAvailable ? quizForm() : videoForm()}
        <div className="lesson-controls">
            <button
            onClick={goToPreviousLesson}
            disabled={currentLesson === 0}
            className="lesson-control-button-study"
            >
            บทเรียนก่อนหน้า
            </button>
            <button
            onClick={goToNextLesson}
            disabled={currentLesson === lessons.length - 1}
            className="lesson-control-button-study"
            >
            บทเรียนถัดไป
            </button>
        </div>
    </div>

  );
}

export default CourseStudy;
