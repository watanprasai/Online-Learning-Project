import { useEffect, useState, useRef } from 'react';
import { useParams , useNavigate} from 'react-router-dom';
import { Course, Lesson, Progress } from '../interfaces/ICourse';
import Swal from 'sweetalert2';
import './css/coursestudy.css'
function StudyPage () {
    const {lessonNumber , courseId} = useParams();
    const token = localStorage.getItem('token') || '';
    const user_id = localStorage.getItem('_id') || '';
    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState<Course>();
    const [lesson,setLesson] = useState<Lesson>();
    const [isQuiz , setIsQuiz] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | null>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState<null | NodeJS.Timer>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [progress,setProgress] = useState<Progress>();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const navigate = useNavigate();

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
            if (lessonNumber) {
                setCourse(res);
                setLesson(res.lessons[lessonNumber]);
                if (res.lessons[lessonNumber].quizzes.length > 0){
                    setIsQuiz(true);
                } else {
                    setIsQuiz(false);
                }
                const apiUrlProgress = `http://localhost:8080/getProgress/${res.lessons[lessonNumber]._id}`;
                const optionProgress = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`
                    },
                };
                fetch(apiUrlProgress,optionProgress)
                .then((res) => res.json())
                .then((res) => {
                if (res) {
                    setProgress(res);
                }
                })
            }
        } else {
            console.log('Can not get Course');
        }
        });
        
        setIsLoading(false);
    };

    const showQuiz = lesson?.quizzes?.map((quiz, no) => {
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

      const handleSubmit = (event: any) => {
        event.preventDefault();
        console.log(selectedAnswers);
        console.log(lesson?.quizzes?.length);
        if (Object.keys(selectedAnswers).length !== lesson?.quizzes?.length) {
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
            const passingScore = lesson.scorePass;
    
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
                        lessonId: lesson._id,
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
                html: `คุณทำแบบทดสอบได้ไม่ถึง ${lesson.scorePass}%<br/>คุณได้ ${correctAnswers} / ${totalQuestions} คะแนน`,
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

    const quizForm = () => {
        return (
            <div className="quiz-form-study">
            <h2>แบบทดสอบ</h2>
            <hr style={{ width: '100%', textAlign: 'center', marginBottom: '15px' }} />
            <form onSubmit={handleSubmit}>
              {isQuiz ? (
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

    const videoForm = () => {
        return (
          <div className="lesson-content-study">
            {lesson && (
              <>
                <h1>{lesson.title}</h1>
                <p>{lesson.content}</p>
                <video
                  controls
                  onLoadedData={handleVideoLoadedData}
                  onPlay={startVideoTimer}
                  onPause={stopVideoTimer}
                  ref={videoRef}
                >
                  <source
                    src={require(`../files/${lesson.videoURL}`)}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </>
            )}
          </div>
        );
      };

      const goToNextLesson = () => {
        if (lessonNumber && course) {
            const nextLessonNumber = parseInt(lessonNumber, 10) + 1;
            if (nextLessonNumber <= course.lessons.length-1) {
                navigate(`/StudyPage/${nextLessonNumber}/${courseId}`);
                window.location.reload();
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'สิ้นสุดบทเรียน',
                    html: 'คุณเรียนบทเรียนทั้งหมดแล้ว</br>คุณสามารถตรวจสอบหน้าคอร์สเรียนของฉัน</br>เพื่อรับเกียรติบัตรเมื่อเรียนครบ 80% ของคอร์สเรียน',
                });
            }
        }
    };
    
    const goToPreviousLesson = () => {
        if (lessonNumber && course) {
            const previousLessonNumber = parseInt(lessonNumber, 10) - 1;
            if (previousLessonNumber >= 0) {
                navigate(`/StudyPage/${previousLessonNumber}/${courseId}`);
                window.location.reload();
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'บทเรียนแรก',
                    text: 'นี่คือบทเรียนแรกแล้ว',
                });
            }
        }
    };

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
          const apiUrl = `http://localhost:8080/getProgress/${lesson?._id}`;
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
                    lessonId: lesson?._id,
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

      const handleVideoLoadedData = (event: any) => {
        const videoElement = videoRef.current;
        if (videoElement) {
          const videoDuration = videoElement.duration;
          setVideoDuration(videoDuration);
          if (progress?.videoProgress) {
            console.log(progress?.videoProgress);
            const currentPercentageWatched = progress?.videoProgress;
            const watchedTimeInSeconds = (currentPercentageWatched / 100) * videoDuration;
            videoElement.currentTime = watchedTimeInSeconds;
            setTimer(Math.floor(watchedTimeInSeconds));
          }
        }
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

    useEffect(() => {
        getCourseDetail();
      }, []);
    
      return (
        <div className="course-study-container">
            {isLoading ? (
                <div className="loading-spinner"></div>
            ) : (
                isQuiz ? quizForm() : videoForm()
            )}
            <div className="lesson-controls">
                <button
                    onClick={goToPreviousLesson}
                    className="lesson-control-button-study"
                >
                    บทเรียนก่อนหน้า
                </button>
                {isQuiz ? (
                    <button
                        onClick={checkQuizProgress}
                        className="lesson-control-button-study"
                    >
                        บทเรียนถัดไป
                    </button>
                ) : (
                    <button
                        onClick={goToNextLesson}
                        className="lesson-control-button-study"
                    >
                        บทเรียนถัดไป
                    </button>
                )}
            </div>
        </div>
    )
}

export default StudyPage;