import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Course, Quiz } from '../interfaces/ICourse';
import Swal from 'sweetalert2';
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizData, setQuizData] = useState<Quiz[] | undefined>();

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
            setLessons(res.lessons);
          }
        } else {
          console.log('Can not get Course');
        }
      });
  };

  const getQuizDetail = () => {
    if (lessons[currentLesson]?.quizzes.length > 0) {
      const quizApiUrl = `http://localhost:8080/quizzes-lesson/${lessons[currentLesson]._id}`;
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
  
  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log(selectedAnswers);
    if (Object.keys(selectedAnswers).length !== quizData?.length) {
      Swal.fire({
        icon: 'warning',
        title: 'คุณตอบคำถามไม่ครบ',
        text: 'โปรดตอบคำถามทุกข้อก่อนที่คุณจะส่งคำตอบ',
      });
      return;
    }
  
    const submitPromises = Object.keys(selectedAnswers).map((quizId) => {
      const apiUrl = `http://localhost:8080/checkQuizAnswer`;
      const option = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          quizId,
          selectedOptionId: selectedAnswers[quizId],
        }),
      };
  
      return fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => ({
          isCorrect: res.isCorrect,
          quizId,
          quizAnswerId: res.quiz_id,
        }));
    });
  
    Promise.all(submitPromises)
      .then((results) => {
        results.forEach((result) => {
          if (result.isCorrect) {
            console.log(`ข้อที่ ${result.quizId} คำตอบถูกต้อง`);
          } else {
            console.log(`ข้อที่ ${result.quizId} คำตอบไม่ถูกต้อง`);
          }
        });

        const quizAnswerId = results.map((result) => result.quizAnswerId);
        const correctAnswers = results.filter((result) => result.isCorrect).length;
        const totalQuestions = results.length;
        Swal.fire({
          icon: 'success',
          title: 'คะแนนของคุณ',
          text: `คุณได้ ${correctAnswers} / ${totalQuestions} คะแนน`,
          showCancelButton: true,
          cancelButtonText: 'ทำแบบทดสอบใหม่',
          confirmButtonText: 'ไปบทเรียนถัดไป',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            const apiUrlProgress = 'http://localhost:8080/updateQuizProgress';
            const optionProgress = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
              },
              body: JSON.stringify({
                courseId: courseId,
                lessonId: lessons[currentLesson]._id,
                quizId: quizAnswerId,
              }),
            }
            fetch(apiUrlProgress,optionProgress)
            .then((res) => res.json())
            .then((res) => {
              console.log(res);
            })
            goToNextLesson();
          } else if (result.isDismissed) {
            setIsSubmitted(false);
            setSelectedAnswers({});

            const radioInputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]');
            radioInputs.forEach((input) => {
              input.checked = false;
            });
          }
        });
      
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการส่งคำตอบ', error);
        setIsSubmitting(false);
      });
  };
  
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showQuiz = quizData?.map((quiz, no) => {
    return (
      <div key={quiz._id}>
        <b>ข้อที่ {no + 1}</b>
        <p>{quiz.question}</p>
        <ul>
          {quiz.options.map((option: any) => (
            <li key={option._id}>
              <label>
                <input
                  type="radio"
                  name={`answer_${quiz._id}`}
                  value={option._id}
                  onChange={(event) => {
                    const selectedAnswer = event.target.value;
                    setSelectedAnswers({ ...selectedAnswers, [quiz._id]: selectedAnswer });
                  }}
                  disabled={isSubmitted || isSubmitting}
                />
                {option.option}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  });
  
  const isQuizAvailable = lessons[currentLesson]?.quizzes.length > 0;
  const isQuizForm = isQuizAvailable && quizData;
  const quizForm = () => {
    return (
      <div className="quiz-form-study">
        <h2>แบบทดสอบ</h2>
        <hr style={{ width: '100%', textAlign: 'center', marginBottom: '15px' }} />
        <form onSubmit={handleSubmit}>
          {isQuizAvailable && quizData ? (
            <>
              {showQuiz}
              <button type="submit" disabled={isSubmitted || isSubmitting} className='quiz-form-study-button-send'>
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
  
  const lessonProgress = () => {
    const nextLesson = currentLesson < lessons.length - 1 ? lessons[currentLesson + 1] : null;
  
    return (
      <div className="lesson-progress">
        <p>
          บทเรียนที่ {currentLesson + 1} จาก {lessons.length}
        </p>
        {nextLesson && (
          <div className="next-lesson-info">
            <h3>บทเรียนถัดไป:</h3>
            <p>Title:{nextLesson.title}</p>
            <p>({nextLesson.quizzes.length > 0 ? 'Quiz' : 'Video'})</p>
          </div>
        )}
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
    if (videoRef.current && lessons[currentLesson]?.videoURL) {
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
      {lessonProgress()}
      {isQuizAvailable ? quizForm() : videoForm()}
      <div className="lesson-controls">
        <button
          onClick={goToPreviousLesson}
          disabled={currentLesson === 0}
          className="lesson-control-button-study"
        >
          บทเรียนก่อนหน้า
        </button>
        {!isQuizForm ? (
          <button
            onClick={goToNextLesson}
            disabled={currentLesson === lessons.length - 1}
            className="lesson-control-button-study"
          >
            บทเรียนถัดไป
          </button>
        ) : (
          <button
            onClick={() => {
              Swal.fire({
                icon: 'warning',
                title: 'คุณต้องทำแบบทดสอบก่อน',
                text: 'โปรดทำแบบทดสอบก่อนที่คุณจะไปยังบทเรียนถัดไป',
              });
            }}
            disabled={currentLesson === lessons.length - 1}
            className="lesson-control-button-study"
          >
            บทเรียนถัดไป
          </button>
        )}
      </div>
    </div>
  );
}

export default CourseStudy;
