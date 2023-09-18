import { Course } from '../interfaces/ICourse';
import './css/createcourse.css'
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

function CreateLesson() {
    const location = useLocation();
    const courseID = location.state.courseID;
    const token = localStorage.getItem('token') || "";

    const [lessonTitle, setLessonTitle] = useState('');
    const [content, setContent] = useState('');

    const [videoFile, setVideo] = useState(null);

    const [questions, setQuestions] = useState([
        {
            question: '',
            options: ['', '', ''],
            correctOption: '',
        },
    ]);

    const handleSaveQuestions = async () => {
        try {
            console.log(lessonTitle)
            if (!lessonTitle || questions.length === 0) {
                Swal.fire({
                    title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                    icon: 'warning',
                    confirmButtonText: 'ตกลง',
                });
                return;
            }
            const quizResponse = await fetch('http://localhost:8080/lessons-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`,
                },
                body: JSON.stringify({ title: lessonTitle, course: courseID }),
            });
            const quizResult: { _id: string; error?: string } = await quizResponse.json();
            const lessonId = quizResult._id;
            if (!quizResponse.ok || quizResult.error) {
                throw new Error(quizResult.error || 'Failed to create quiz');
            }

            const optionIdsPerQuestion: string[][] = [];
            const correctOptions: string[] = [];

            const optionsData = questions.flatMap((question) =>
                question.options.map((option) => ({
                    option,
                    isCorrect: option === question.correctOption,
                }))
            );

            const createOptions = await Promise.all(optionsData.map(async (optionData) => {
                const response = await fetch('http://localhost:8080/options', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                    body: JSON.stringify({ option: optionData.option }),
                });
                const result: { _id: string } = await response.json();

                if (optionData.isCorrect) {
                    correctOptions.push(result._id);
                }
                return result._id;
            }));

            let currentIndex = 0;
            for (const question of questions) {
                const numOptions = question.options.length;
                const optionIds = createOptions.slice(currentIndex, currentIndex + numOptions);
                optionIdsPerQuestion.push(optionIds);
                currentIndex += numOptions;
            }

            console.log(optionIdsPerQuestion);
            console.log(correctOptions);

            const quizData = questions.map((question,index) => ({
                question: question.question,
                options: optionIdsPerQuestion[index],
                correctOption: correctOptions[index],
            }))
            console.log(quizData);
            const createQuizzes = quizData.map((quiz) => {
                return fetch(`http://localhost:8080/lessons/${lessonId}/quizzes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                    body: JSON.stringify({
                        question: quiz.question,
                        options: quiz.options,
                        correctOption: quiz.correctOption,
                    }),
                });
            });
            await Promise.all(createQuizzes);

            setLessonTitle('');
            setQuestions([
                {
                    question: '',
                    options: ['', '', ''],
                    correctOption: '',
                },
            ]);
    
            await Swal.fire({
                title: 'สร้าง Quiz สำเร็จ',
                text: 'เพิ่มเนื้อหาใหม่โดยการกดปุ่มบันทึก',
                icon: 'success',
                confirmButtonText: 'รับทราบ'
            });
        } catch (error) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาดในการบันทึกแบบทดสอบ',
                text: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
                icon: 'error',
                confirmButtonText: 'รับทราบ',
            });
        }
    };

    const handleVideoChange = (event: any) => {
        const selectedVideo = event.target.files[0];
        setVideo(selectedVideo);
    }

    const addVideoForm = () => {
        return (
            <div>
                <div className="lesson-line">
                    หัวข้อ
                    <input type="text" id='lesson-title' name='lesson-title' placeholder='กรอกชื่อเนื้อหาการสอน' value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} />
                </div>
                <div className="lesson-line">เนื้อหา<input type="text" id='content' name='content' placeholder='กรอกรายละเอียดเนื้อหา' value={content} onChange={(event) => setContent(event.target.value)} /></div>
                <div className="lesson-line-upload">
                    Video
                    <input type="file" id='video' name='video' onChange={handleVideoChange} />
                </div>
                <div className="course-create-button">
                    <button onClick={submit}>บันทึก <FontAwesomeIcon icon={faSave} /></button>
                </div>
            </div>
        )
    }

    const createQuizForm = () => {
        const areOptionsEmpty = questions.some((question) =>
            question.question.trim() === '' ||
            question.options.some((option) => option.trim() === '') ||
            question.correctOption.trim() === ''
        );
        return (
            <div>
                 <div className="lesson-line-quiz-title">
                หัวข้อ
                <input
                    type="text"
                    id='lesson-title'
                    name='lesson-title'
                    placeholder='กรอกชื่อบทเรียน'
                    value={lessonTitle}
                    className='titleBox-quiz'
                    onChange={(event) => setLessonTitle(event.target.value)}
                />
                <button onClick={handleAddQuestion} className='add-question-button'>
                    เพิ่มคำถาม <FontAwesomeIcon icon={faPlus} />
                </button>
                </div>
                {questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="quiz-form">
                        <div className="form-group">
                            <label htmlFor={`question-${questionIndex}`}>คำถาม:</label>
                            <input
                                type="text"
                                id={`question-${questionIndex}`}
                                value={question.question}
                                onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                                className="custom-input"
                            />
                        </div>
                        {question.options.map((option, optionIndex) => (
                            <div className="form-group-choice" key={optionIndex}>
                                <label htmlFor={`option-${questionIndex}-${optionIndex}`}>{`ตัวเลือก ${optionIndex + 1}:`}</label>
                                <input
                                    type="text"
                                    id={`option-${questionIndex}-${optionIndex}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                    className="custom-input"
                                />
                                <button onClick={() => handleRemoveOption(questionIndex, optionIndex)} className="custom-button">
                                    ลบ
                                </button>
                            </div>
                        ))}
                        <div className="form-group">
                            <label htmlFor={`correctOption-${questionIndex}`}>ตัวเลือกที่ถูกต้อง:</label>
                            <select
                                id={`correctOption-${questionIndex}`}
                                value={question.correctOption}
                                onChange={(e) => handleCorrectOptionChange(questionIndex, e.target.value)}
                                className="custom-select"
                            >
                                <option value="">เลือกตัวเลือกที่ถูกต้อง</option>
                                {question.options.map((option, optionIndex) => (
                                    <option key={optionIndex} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="custom-button-line">
                            <button onClick={() => handleAddOption(questionIndex)} className="custom-button-add-option">
                                เพิ่มตัวเลือก
                            </button>
                            <button onClick={() => handleRemoveQuestion(questionIndex)} className="custom-button">
                                ลบคำถาม
                            </button>
                        </div>
                    </div>
                ))}
                <div className="custom-button-line-save">
                <button onClick={() => {
                    if (areOptionsEmpty) {
                        Swal.fire({
                            title: 'กรุณากรอกตัวเลือกที่ถูกต้องสำหรับทุกคำถาม',
                            icon: 'warning',
                            confirmButtonText: 'ตกลง',
                        });
                    } else {
                        handleSaveQuestions();
                    }
                }} className="custom-button-save-option">
                    บันทึกคำถาม
                </button>
            </div>
            </div>
        );
    };


    const [course, setCourse] = useState<Course>();
    const getCourseByID = async () => {
        const apiUrl = `http://localhost:8080/courses/${courseID}`;
        const option = {
            method: "GET",
            headers: { "Content-Type": "apllication/json" },
        }
        fetch(apiUrl, option)
            .then((res) => res.json())
            .then((res) => {
                if (res) {
                    setCourse(res);
                }
                else {
                    alert("Can not get course by _id");
                }
            })
    }

    const submit = async () => {
        const video = new FormData();
        video.append('file', videoFile || "");
        const apiUrlUpload = "http://localhost:8080/upload";
        const optionUpload = {
            method: "POST",
            body: video,
        };
        const videoRes = await fetch(apiUrlUpload, optionUpload)
        const videoName = await videoRes.json()

        let data = {
            "course": courseID,
            "title": lessonTitle,
            "content": content,
            "videoURL": videoName,
        };
        const apiUrl = "http://localhost:8080/lessons";
        const option = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }
        const res = await fetch(apiUrl, option);
        const message = await res.json();
        if (res.ok) {
            await Swal.fire({
                title: 'สร้าง Lesson สำเร็จ',
                text: 'เพิ่มเนื้อหาใหม่โดยการกดปุ่มบันทึก',
                icon: 'success',
                confirmButtonText: 'รับทราบ'
            });
            setLessonTitle("");
            setContent("");
        } else {
            await Swal.fire({
                title: 'สร้าง Lesson ไม่สำเร็จ',
                text: message.error,
                icon: 'error',
                confirmButtonText: 'รับทราบ'
            });
        }
    }
    const [selectedOption, setSelectedOption] = useState('video');

    const handleAddVideo = () => {
        setSelectedOption('video');
    }

    const handleAddQuiz = () => {
        setSelectedOption('quiz');
    }

    const handleQuestionChange = (index: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].question = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(updatedQuestions);
    };

    const handleCorrectOptionChange = (questionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].correctOption = value;
        setQuestions(updatedQuestions);
    };

    const handleAddOption = (questionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.push('');
        setQuestions(updatedQuestions);
    };

    const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuestions(updatedQuestions);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', ''], correctOption: '' }]);
    };

    const handleRemoveQuestion = (index: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        setQuestions(updatedQuestions);
    };

    useEffect(() => {
        getCourseByID();
    }, [])

    return (
        <div className="page2">
            <div className='header'>
                Lesson Create
            </div>
            <div className="course-create-container">
                <div className='course-line'>
                    หัวข้อ
                    <input type="text" id='title' name='title' placeholder='กรอกหัวข้อ' value={course?.title} />
                </div>
                <div className='course-line'>
                    คำอธิบาย
                    <input type="text" id="description" name='description' placeholder='กรอกคำอธิบาย' value={course?.description} />
                </div>
                <div className='course-line'>
                    ครูผู้สอน
                    <input type="text" id='instructor' name='instructor' placeholder='กรอกชื่อครูผู้สอน' value={course?.instructor.username} />
                </div>
                <div className='course-line'>
                    หมวดหมู่
                    <select name="types" id="types" >
                        <option value="">{course?.type.name}</option>
                    </select>
                </div>
                <div className='course-line'>
                    รูปปก
                    <input type="text" id='url' name='url' placeholder='กรอก url รูปหน้าปก' value={course?.url} />
                </div>
                <hr className="line-divider" />
                <div className="lesson-line">
                    เนื้อหาการสอน
                    <div className='lesson-choice'>
                        <div className='lesson-choice-line'>
                            <input
                                className="lesson-radio"
                                type="radio"
                                name="lessonType"
                                value="video"
                                checked={selectedOption === 'video'}
                                onChange={handleAddVideo}
                            />
                            เพิ่มวิดีโอ (video)
                        </div>
                        <div className='lesson-choice-line'>
                            <input
                                className="lesson-radio"
                                type="radio"
                                name="lessonType"
                                value="quiz"
                                checked={selectedOption === 'quiz'}
                                onChange={handleAddQuiz}
                            />
                            สร้างคำถาม (quiz)
                        </div>
                    </div>
                </div>
                <div>
                    {selectedOption === 'video' ? addVideoForm() : null}
                    {selectedOption === 'quiz' ? createQuizForm() : null}
                </div>
            </div>
        </div>
    );
}

export default CreateLesson;
