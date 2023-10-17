import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Course, Progress, Quiz } from '../interfaces/ICourse';
import Swal from 'sweetalert2';
import './css/coursestudy.css';

function CourseStudy() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(0);
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>();
  const user_id = localStorage.getItem('_id') || '';
  const token = localStorage.getItem('token') || '';
  const [isEnrolled, setIsEnrolled] = useState<boolean>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizData, setQuizData] = useState<Quiz[] | undefined>();
  const [lessonId , setLessonId] = useState();
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<null | NodeJS.Timer>(null);
  const [progress,setProgress] = useState<Progress>();

  const startVideoTimer = () => {
    if (!intervalId) {
      const newIntervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
      setIntervalId(newIntervalId);
    }
  };
  
  const stopVideoTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      const apiUrl = `http://localhost:8080/getProgress/${lessonId}`;
      const option = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      };
      fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => {
          const currentPercentageWatched = (timer / videoDuration) * 100;
          if (res.videoProgress > currentPercentageWatched) {
            return
          } else {
            const apiUrlProgress = 'http://localhost:8080/updateOrCreateVideoProgress';
            const optionProgress = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
              },
              body: JSON.stringify({
                courseId: courseId,
                lessonId: lessons[currentLesson]._id,
                videoProgress: currentPercentageWatched,
              }),
            };
            fetch(apiUrlProgress, optionProgress)
              .then((res) => res.json())
              .then((res) => {
                console.log(res);
              })
              .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการอัพเดตความคืบหน้าวิดีโอ', error);
              });
          }
        })
    }
  };
  
  const getCourseDetail = () => {
    setIsLoading(true);
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
            setIsLoading(false);
          }
        } else {
          console.log('Can not get Course');
          setIsLoading(false);
        }
      });
  };
  
  const loadLessonData = async() => {
    if (lessons[currentLesson]?._id) {
      setLessonId(lessons[currentLesson]._id)
    }
  }

  const getProgress = () => {
    const apiUrl = `http://localhost:8080/getProgress/${lessons[currentLesson]._id}`;
    const option = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`
        },
    };
    fetch(apiUrl,option)
    .then((res) => res.json())
    .then((res) => {
      if (res) {
        setProgress(res);
      }
    })
  }
  
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
          } else {
            console.log('Can not get Quiz');
          }
        });
    } else {
      setQuizData(undefined);
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
              onLoadedData={handleVideoLoadedData}
              onPlay={startVideoTimer}
              onPause={stopVideoTimer}
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

  const checkQuizProgress = () => {
    if (progress && progress.quizAnswer && progress.quizAnswer.length > 0) {
      goToNextLesson();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'คุณต้องทำแบบทดสอบก่อน',
        text: 'โปรดทำแบบทดสอบก่อนที่คุณจะไปยังบทเรียนถัดไป',
      });
    };
  };
  
  const handleVideoLoadedData = (event: any) => {
    const videoDuration = event.target.duration;
    setVideoDuration(videoDuration);
    if (videoRef.current) {
      videoRef.current.currentTime = timer;
    }
  };
  
  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log(selectedAnswers);
    console.log(quizData?.length);
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
        const passingScore = lessons[currentLesson].scorePass;

        if ((correctAnswers / totalQuestions) * 100 >= passingScore) {
            Swal.fire({
              icon: 'success',
              title: 'คะแนนของคุณ',
              text: `คุณได้ ${correctAnswers} / ${totalQuestions} คะแนน`,
              showCancelButton: true,
              cancelButtonText: 'ทำแบบทดสอบใหม่',
              confirmButtonText: 'ยืนยัน',
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
                setSelectedAnswers({});
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
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'คะแนนของคุณ',
            html: `คุณทำแบบทดสอบได้ไม่ถึง ${lessons[currentLesson].scorePass}%<br/>คุณได้ ${correctAnswers} / ${totalQuestions} คะแนน`,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: 'ทำแบบทดสอบใหม่',
            reverseButtons: true,
          }).then((result) => {
            if (result.isDismissed) {
              setSelectedAnswers({});
              const radioInputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]');
                radioInputs.forEach((input) => {
                  input.checked = false;
              });
            }
          });
        };
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

  const CheckVideoProgress = () => {
    setIsLoading(true);
    if (progress?.videoProgress) {
      console.log(progress?.videoProgress);
      const currentPercentageWatched = progress?.videoProgress;
      const watchedTimeInSeconds = (currentPercentageWatched / 100) * videoDuration;
      const newTimerValue = Math.floor(watchedTimeInSeconds);
      setTimer(newTimerValue);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getCourseDetail();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadLessonData();
      CheckVideoProgress();
      if (lessons[currentLesson]) {
        getProgress();
      }
    }
  }, [course, isEnrolled, currentLesson, isLoading]);

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
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <React.Fragment>
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
                onClick={checkQuizProgress}
                disabled={currentLesson === lessons.length - 1}
                className="lesson-control-button-study"
              >
                บทเรียนถัดไป
              </button>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default CourseStudy;