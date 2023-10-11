import { useEffect, useState } from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import { Course, Lesson, Type, User ,Quiz} from '../interfaces/ICourse';
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

    const editQuestion = (lessonIndex: number, questionIndex: number, updatedQuestionData:any) => {
        const newLessons = [...lessons];
        const questionToUpdate = newLessons[lessonIndex].quizzes[questionIndex];
        
        questionToUpdate.question = updatedQuestionData.question;
        questionToUpdate.options = updatedQuestionData.options;
        questionToUpdate.correctOption = updatedQuestionData.correctOption;
        
        setLessons(newLessons);
    };  

    const addQuestion = (lessonIndex: number) => {
        const newLessons = [...lessons];
        const createdAtDate = new Date();

        const newQuestion: Quiz = {
            _id: '',
            lesson: lessons[lessonIndex]._id,
            question: '',
            options: [{
                _id: '',
                option: '',
                createdAt: createdAtDate,
                updatedAt: createdAtDate,
                },
                {
                    _id: '',
                    option: '',
                    createdAt: createdAtDate,
                    updatedAt: createdAtDate,
                },
                {
                    _id: '',
                    option: '',
                    createdAt: createdAtDate,
                    updatedAt: createdAtDate,
                },
                {
                    _id: '',
                    option: '',
                    createdAt: createdAtDate,
                    updatedAt: createdAtDate,
                },
            ],
            correctOption: {
                _id: '',
                option: '',
                createdAt: createdAtDate,
                updatedAt: createdAtDate,
            },
            createdAt: createdAtDate,
            updatedAt: createdAtDate,
        };
    
        newLessons[lessonIndex].quizzes.push(newQuestion);
        setLessons(newLessons);
    };
    
    const addOption = (lessonIndex: number, questionIndex: number) => {
        const newLessons = [...lessons];
        const newOption = {
            _id: '',
            option: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    
        newLessons[lessonIndex].quizzes[questionIndex].options.push(newOption);
        setLessons(newLessons);
    };
    
    const deleteOption = (lessonIndex: number, questionIndex: number, optionIndex: number) => {
        const newLessons = [...lessons];
        newLessons[lessonIndex].quizzes[questionIndex].options.splice(optionIndex, 1);
        setLessons(newLessons);
    };

    const deleteQuestion = (lessonIndex: number, questionIndex: number) => {
        const newLessons = [...lessons];
        newLessons[lessonIndex].quizzes.splice(questionIndex, 1);
        setLessons(newLessons);
    };

    const updateQuiz = async (index:number) => {
        lessons[index].quizzes.map((quiz) => {
            quiz.options.map((option) => {
                const apiUrl = `http://localhost:8080/option/${option._id}`;
                const optionUpdateOption = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                    body: JSON.stringify({option: option.option}),
                };
                fetch(apiUrl,optionUpdateOption)
                .then((res) => res.json())
                .then((res) => {
                    console.log(res);
                })
            })
            console.log(quiz.correctOption._id)
            const apiUrl = `http://localhost:8080/quizzes/${quiz._id}`;
            const optionQuiz = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`,
                },
                body: JSON.stringify({
                    question : quiz.question,
                    correctOption: quiz.correctOption._id,
                }),
            }
            fetch(apiUrl,optionQuiz)
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
            })
        })
    }

    console.log(lessons);

    useEffect(() => {
        getCourse();
        getType();
        getUserbyID();
    }, []);
    
    return (
        <div className='edit-course-page'>
            {isLoading ? (
                <div className="loading-spinner"></div>
            ) : (
                <div className="edit-update-lesson-container">
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
                    
                    <div className="edit-course-course-button-line">
                         <div className="edit-course-update-button">
                            <button onClick={submit}>
                                แก้ไข <FontAwesomeIcon icon={faSave} />
                            </button>
                        </div>
                        <div className="edit-course-remove-button">
                            <button onClick={handleDeleteCourse}>
                                ลบคอร์ส <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
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
                                                    <button className='add-question-button' onClick={() => addQuestion(index)}>
                                                        เพิ่มคำถาม <FontAwesomeIcon icon={faPlus} />
                                                    </button>

                                                    </div>
                                                    {lesson.quizzes.map((question,questionIndex) => (
                                                        <div key={questionIndex} className="quiz-form">
                                                             <div className="form-group">
                                                                <label htmlFor={`question-${questionIndex}`}>คำถาม:</label>
                                                                <input
                                                                    type="text"
                                                                    id={`question-${questionIndex}`}
                                                                    value={question.question}
                                                                    onChange={(event) => {
                                                                        const updatedQuestionData = { ...question };
                                                                        updatedQuestionData.question = event.target.value;
                                                                        editQuestion(index, questionIndex, updatedQuestionData);
                                                                      }}
                                                                    className="custom-input"
                                                                />
                                                            </div>
                                                            {question.options.map((option, optionIndex) => (
                                                                <div className="form-group-choice" key={optionIndex}>
                                                                    <label htmlFor={`option-${questionIndex}-${optionIndex}`}>{`ตัวเลือก ${optionIndex + 1}:`}</label>
                                                                    <input
                                                                        type="text"
                                                                        id={`option-${questionIndex}-${optionIndex}`}
                                                                        value={option.option}
                                                                        onChange={(event) => {
                                                                            const updatedQuestionData = { ...question };
                                                                            updatedQuestionData.options[optionIndex].option = event.target.value;
                                                                            editQuestion(index, questionIndex, updatedQuestionData);
                                                                        }}
                                                                        className="custom-input"
                                                                    />
                                                                    <button className="custom-button" onClick={() => deleteOption(index, questionIndex, optionIndex)}>
                                                                        ลบ
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <div className="form-group">
                                                                <label htmlFor={`correctOption-${questionIndex}`}>ตัวเลือกที่ถูกต้อง:</label>
                                                                <select
                                                                    id={`correctOption-${questionIndex}`}
                                                                    value={question.correctOption._id}
                                                                    onChange={(event) => {
                                                                        const updatedQuestionData = { ...question };
                                                                        updatedQuestionData.correctOption._id = event.target.value;
                                                                        editQuestion(index, questionIndex, updatedQuestionData);
                                                                    }}
                                                                    className="custom-select"
                                                                >
                                                                    <option value="">เลือกตัวเลือกที่ถูกต้อง</option>
                                                                    {question.options.map((option, optionIndex) => (
                                                                        <option key={optionIndex} value={option._id}>
                                                                            {option.option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="custom-button-line">
                                                                <button className="custom-button-add-option" onClick={() => addOption(index, questionIndex)}>
                                                                    เพิ่มตัวเลือก
                                                                </button>
                                                                <button className="custom-button" onClick={() => deleteQuestion(index, questionIndex)}>
                                                                    ลบคำถาม
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="course-create-button">
                                                        <button onClick={() => updateQuiz(index)}>
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