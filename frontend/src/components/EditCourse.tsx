import { useEffect, useState } from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import { Course, Lesson, Type, User } from '../interfaces/ICourse';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faPlus , faTrash} from '@fortawesome/free-solid-svg-icons';
import './css/editcourse.css'

function EditCourse() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course>();
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [types, setType] = useState<Type[]>([]);
    const [selectedType, setSelectedType] = useState('');
    const [file, setFile] = useState(null);
    const [user, setUser] = useState<User>();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [videoFile, setVideo] = useState(null);
    const [lessonQuizzes, setLessonQuizzes] = useState<Lesson[]>([]);
    const _id = localStorage.getItem('_id') || '';
    const token = localStorage.getItem('token') || '';
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([
        {
            _id: '', 
            question: '',
            options: ['', '', '',''],
            correctOption: '',
            lessonId: '',
        },
    ]);
    
    const handleQuestionChange = (questionIndex:any, value:any) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].question = value;
        setQuestions(newQuestions);
    };
    
    const handleOptionChange = (questionIndex:any, optionIndex:any, value:any) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(newQuestions);
    };
    
    const handleCorrectOptionChange = (questionIndex:any, value:any) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].correctOption = value;
        setQuestions(newQuestions);
    };
    
    const handleAddQuestion = (index:any) => {
        const newQuestions = [...questions];
        newQuestions.push({
            _id: '',
            question: '',
            options: ['', '', '',''],
            correctOption: '',
            lessonId: lessons[index]._id,
        });
        setQuestions(newQuestions);
    };
    
    const handleRemoveQuestion = async (questionIndex: any) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: 'คุณต้องการลบคำถามนี้หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ลบคำถาม',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const questionId = questions[questionIndex]._id;
                    const response = await fetch(`http://localhost:8080/quizzes/${questionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${token}`,
                        },
                    });
    
                    if (response.ok) {
                        const newQuestions = [...questions];
                        newQuestions.splice(questionIndex, 1);
                        setQuestions(newQuestions);
    
                        Swal.fire('ลบคำถามสำเร็จ', '', 'success');
                    } else {
                        Swal.fire('เกิดข้อผิดพลาดในการลบคำถาม', '', 'error');
                    }
                } catch (error) {
                    console.error('เกิดข้อผิดพลาดในการส่งคำขอลบ:', error);
                    Swal.fire('เกิดข้อผิดพลาดในการส่งคำขอลบคำถาม', '', 'error');
                }
            }
        });
    };

    const handleDeleteCourse = async () => {
        const isConfirmed = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้?',
            text: 'กรุณากรอกชื่อคอร์สเพื่อยืนยันการลบ:',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            inputValidator: (value) => {
                if (!value) {
                    return 'คุณต้องกรอกชื่อคอร์สเพื่อยืนยันการลบ';
                }
            }
        });
    
        if (isConfirmed.isConfirmed) {
            const courseName = isConfirmed.value;
            if (courseName === title) {
                const apiUrl = `http://localhost:8080/courses/${courseId}`;
                const options = {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
    
                try {
                    const response = await fetch(apiUrl, options);
    
                    if (response.ok) {
                        await Swal.fire({
                            icon: 'success',
                            text: `คอร์ส "${courseName}" ถูกลบเรียบร้อยแล้ว`,
                        });
                        navigate('/showCourse');
                    } else {
                        await Swal.fire({
                            icon: 'error',
                            text: 'เกิดข้อผิดพลาดในการลบคอร์ส',
                        });
                    }
                } catch (error) {
                    console.error('เกิดข้อผิดพลาดในการส่งคำขอ:', error);
                    await Swal.fire({
                        icon: 'error',
                        text: 'เกิดข้อผิดพลาดในการลบคอร์ส',
                    });
                }
            } else {
                await Swal.fire({
                    icon: 'error',
                    text: 'ชื่อคอร์สที่คุณกรอกไม่ตรงกับชื่อคอร์ส',
                });
            }
        }
    };
    
    const handleAddOption = (questionIndex:any) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.push('');
        setQuestions(newQuestions);
    };
    
    const handleRemoveOption = (questionIndex:any, optionIndex:any) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuestions(newQuestions);
    };

    const getUserbyID = () => {
        setIsLoading(true);
        const apiUrl = `http://localhost:8080/users/${_id}`;
        const option = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch(apiUrl, option)
            .then((res) => res.json())
            .then((res) => {
                if (res) {
                    setUser(res);
                } else {
                    alert('Can not get user by _id');
                }
            });
        setIsLoading(false);
    };

    const handleFileChange = (event: any) => {
        const selectedFile = event.target.files[0];

        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
        } else {
            Swal.fire({
                title: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
            }).then((result) => {
                if (result.isConfirmed) {
                    setFile(null);
                    window.location.reload();
                }
            });
        }
    };

    const handleVideoChange = (event: any) => {
        const selectedVideo = event.target.files[0];
        if (selectedVideo && selectedVideo.type.startsWith('image/')) {
            Swal.fire({
                title: 'กรุณาเลือกวิดีโอเท่านั้น',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
            }).then((result) => {
                if (result.isConfirmed) {
                    setVideo(null);
                    window.location.reload();
                }
            });
        } else {
            setVideo(selectedVideo);
        }
    }

    const getType = () => {
        setIsLoading(true);
        const apiUrl = 'http://localhost:8080/types';
        const option = {
            method: 'GET',
            headers: { 'Content-Type': 'apllication/json' },
        };
        fetch(apiUrl, option)
            .then((res) => res.json())
            .then((res) => {
                if (res) {
                    setType(res);
                } else {
                    alert('Can not get types');
                }
            });
        setIsLoading(false);
    };

    const getCourse = async () => {
        setIsLoading(true);
        const apiUrl = `http://localhost:8080/courses/${courseId}`;
        const option = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch(apiUrl, option);
        const res = await response.json();
        if (res) {
            setCourse(res);
            setTitle(res.title);
            setDescription(res.description);
            setLessons(res.lessons);
            setLessonQuizzes(res.lessons);
        } else {
            console.log('can not get course');
        }
        setIsLoading(false);
    };

    const submit = async () => {
        setIsLoading(true);
        let photoName = course?.url;
    
        if (file) {
            const photo = new FormData();
            photo.append('file', file);
    
            const apiUrlUpload = 'http://localhost:8080/upload';
            const optionUpload = {
                method: 'POST',
                body: photo,
            };
            const photoRes = await fetch(apiUrlUpload, optionUpload);
            photoName = await photoRes.json();
        }
    
        const selectedTypeValue = selectedType || course?.type;
    
        const apiUrl = `http://localhost:8080/courses/${courseId}`;
        const data = {
            title: title,
            description: description,
            type: selectedTypeValue,
            url: photoName,
        };
        const option = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
    
        try {
            const response = await fetch(apiUrl, option);
            const data = await response.json();
            if (response.ok) {
                setIsLoading(false);
                Swal.fire({
                    title: 'แก้ไขคอร์สสำเร็จ',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                }).then((result) => {});
            } else {
                setIsLoading(false);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาดในการแก้ไขคอร์ส',
                    icon: 'error',
                    confirmButtonText: 'ตกลง',
                });
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error updating course:', error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาดในการแก้ไขคอร์ส',
                icon: 'error',
                confirmButtonText: 'ตกลง',
            });
        }
    };

    const submitLesson = async (index: number) => {
        setIsLoading(true);
    
        const selectedLesson = lessons[index];
        let videoName = selectedLesson.videoURL;
    
        if (videoFile) {
            const video = new FormData();
            video.append('file', videoFile || "");
            const apiUrlUpload = "http://localhost:8080/upload";
            const optionUpload = {
                method: "POST",
                body: video,
            };
            const videoRes = await fetch(apiUrlUpload, optionUpload)
            videoName = await videoRes.json()
        }
    
        const apiUrl = `http://localhost:8080/lessons/${selectedLesson._id}`;
        const data = {
            title: selectedLesson.title,
            content: selectedLesson.content,
            videoURL: videoName,
        };
        const option = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
    
        try {
            const response = await fetch(apiUrl, option);
            if (response.ok) {
                setIsLoading(false);
                Swal.fire({
                    title: 'แก้ไขบทเรียนสำเร็จ',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                }).then((result) => {});
            } else {
                setIsLoading(false);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาดในการแก้ไขบทเรียน',
                    icon: 'error',
                    confirmButtonText: 'ตกลง',
                });
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error updating lesson:', error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาดในการแก้ไขบทเรียน',
                icon: 'error',
                confirmButtonText: 'ตกลง',
            });
        }
    }

    const submitQuizLesson = async () => {
        setIsLoading(true);
    
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
    
        try {
            const apiUrlUpdateQuiz = 'http://localhost:8080/updateQuiz';
            const updatePromises = questions.map((question, index) => {
                return fetch(apiUrlUpdateQuiz, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                    body: JSON.stringify({
                        _id: question._id,
                        question: question.question,
                        options: optionIdsPerQuestion[index],
                        correctOption: correctOptions[index],
                        lesson: question.lessonId,
                    }),
                });
            });
            await Promise.all(updatePromises);
            console.log('อัปเดตคำถามควิซเสร็จสิ้น');
            await Swal.fire({
                title: 'บันทึกแบบทดสอบสำเร็จ',
                text: 'คำถามควิซได้รับการอัปเดตเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง',
            });
    
            setIsLoading(false);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการส่งคำถามไปยัง /updateQuiz:', error);
    
            await Swal.fire({
                title: 'เกิดข้อผิดพลาดในการบันทึกแบบทดสอบ',
                text: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
                icon: 'error',
                confirmButtonText: 'รับทราบ',
            });
    
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCourse();
        getType();
        getUserbyID();
    }, []);

    useEffect(() => {
        if (course?.lessons) {
            const quizLessons = course.lessons.filter((lesson) => lesson.quizzes.length > 0);
            const quizzes = quizLessons.map((t) => t.quizzes);
            if (quizzes.length > 0) {
                setQuestions([]);
                const newQuestions = quizzes.map((quiz) => {
                    const inQuestion = quiz.map((info) => {
                        return {
                            _id: info._id,
                            question: info.question,
                            options: info.options.map((option) => option.option.toString()),
                            correctOption: info.correctOption.option.toString(),
                            lessonId: info.lesson,
                        }
                    });
                    return inQuestion;
                });
                setQuestions((prevQuestions) => prevQuestions.concat(...newQuestions));
            }
        }
    }, [course]);

    console.log(questions);
    return (
        <div>
            {isLoading ? (
                <div className="loading-spinner"></div>
            ) : (
                <div className="course-create-container">
                    <div className="course-line">
                        หัวข้อ
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="กรอกหัวข้อ"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>
                    <div className="course-line">
                        คำอธิบาย
                        <input
                            type="text"
                            id="description"
                            name="description"
                            placeholder="กรอกคำอธิบาย"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>
                    <div className="course-line">
                        ครูผู้สอน
                        <input
                            type="text"
                            id="instructor"
                            name="instructor"
                            placeholder="กรอกชื่อครูผู้สอน"
                            value={user?.username}
                            disabled
                        />
                    </div>
                    <div className="course-line">
                        หมวดหมู่
                        <select
                            name="types"
                            id="types"
                            value={selectedType}
                            onChange={(event) => setSelectedType(event.target.value)}
                        >
                            <option value="">กรุณาเลือกหมวดหมู่</option>
                            {types.map((type) => (
                                <option key={type._id} value={type._id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="course-line-upload">
                        รูปปก
                        <input type="file" id="file" name="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="course-create-button">
                        <button onClick={submit}>
                            แก้ไข <FontAwesomeIcon icon={faSave} />
                        </button>
                    </div>
                    <div className="course-create-button">
                        <button onClick={handleDeleteCourse}>
                            ลบคอร์ส <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                    <div className="lessons-list">
                        <h3>บทเรียน</h3>
                        <ul>
                            {lessons.map((lesson, index) => (
                                <li key={lesson._id}>
                                    <div>
                                        <strong>เนื้อหา:</strong>
                                        {lesson.quizzes.length > 0 ? (
                                            <div>
                                                ประเภท: ควิซ
                                                <div>
                                                    <div className="lesson-line-quiz-title">
                                                    หัวข้อ
                                                    <input
                                                        type="text"
                                                        id='lesson-title'
                                                        name='lesson-title'
                                                        placeholder='กรอกชื่อบทเรียน'
                                                        value={lesson.title}
                                                        className='titleBox-quiz'
                                                    />
                                                    <button onClick={() => handleAddQuestion(index)} className='add-question-button'>
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
                                                        <div className="course-create-button">
                                                                <button onClick={submitQuizLesson}>
                                                                    แก้ไขควิซ <FontAwesomeIcon icon={faSave} />
                                                                </button>
                                                        </div>
                                                    <div className="custom-button-line-save">
                                                </div>
                                                </div>  
                                            </div>
                                        ) : (
                                            <div>
                                                ประเภท: วิดีโอ
                                                <div className="lesson-line">
                                                    หัวข้อ
                                                    <input
                                                        type="text"
                                                        id='lesson-title'
                                                        name='lesson-title'
                                                        placeholder='กรอกชื่อเนื้อหาการสอน'
                                                        value={lesson.title}
                                                        onChange={(event) => {
                                                            const newLessons = [...lessons];
                                                            newLessons[index].title = event.target.value;
                                                            setLessons(newLessons);
                                                        }}
                                                    />
                                                </div>
                                                <div className="lesson-line">เนื้อหา<input type="text" id='content' name='content' placeholder='กรอกรายละเอียดเนื้อหา' value={lesson.content} onChange={(event) => {
                                                    const newLessons = [...lessons];
                                                    newLessons[index].content = event.target.value;
                                                    setLessons(newLessons);
                                                }}/></div>
                                                <div className="lesson-line-upload">
                                                    Video
                                                    <input type="file" id='video' name='video' onChange={handleVideoChange} accept="video/*" />
                                                </div>
                                                <div className="course-create-button">
                                                    <button onClick={() => submitLesson(index)}>
                                                        แก้ไข <FontAwesomeIcon icon={faSave} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditCourse;
