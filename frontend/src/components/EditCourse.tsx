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
    const [isNewQuestionAdded, setIsNewQuestionAdded] = useState(false);
    const [originalLesson , setOriginalLesson] = useState<Lesson[]>([]);
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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const apiUrl = `http://localhost:8080/courses/${courseId}`;
            const option = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            try {
                const response = await fetch(apiUrl, option);
                if (response.ok) {
                    const res = await response.json();
                    if (res) {
                        setOriginalLesson(res.lessons);
                    }
                } else {
                    console.error('พบข้อผิดพลาดในการดึงข้อมูลคอร์ส');
                }
            } catch (error) {
                console.error('พบข้อผิดพลาดในการเรียก API:', error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [courseId]);
    
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

    const editQuestion = (lessonIndex: number, questionIndex: number, updatedQuestionData: any) => {
        const newLessons = [...lessons];
        const questionToUpdate = newLessons[lessonIndex].quizzes[questionIndex];
    
        questionToUpdate.question = updatedQuestionData.question;
        questionToUpdate.options = updatedQuestionData.options;
        const updatedCorrectOption = {
            _id: updatedQuestionData.options.find((option:any) => option.option === updatedQuestionData.correctOption.option)?._id || '',
            option: updatedQuestionData.correctOption.option,
        };
        
        questionToUpdate.correctOption = {
            _id : updatedCorrectOption._id,
            option: updatedCorrectOption.option,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        setLessons(newLessons);
    };
    
    const addQuestion = (lessonIndex: number) => {
        const newLessons = [...lessons];
        const createdAtDate = new Date();
        setIsNewQuestionAdded(true);
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
    
    const saveNewQuestions = async (lessonIndex:number) => {
        setIsLoading(true);
        
        const addedQuizzes = lessons[lessonIndex].quizzes.filter(currentQuiz => {
            return !originalLesson[lessonIndex].quizzes.some(originalQuiz => originalQuiz._id === currentQuiz._id);
        });

        let hasEmptyFields = false;

        try {
            addedQuizzes.forEach((quiz) => {
                if (quiz.correctOption.option !== '' && quiz.options.every(option => option.option !== '')) {
                    hasEmptyFields  = false;
                } else {
                    hasEmptyFields  = true;
                }
            });
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
        }

        if (hasEmptyFields) {
            await Swal.fire({
                title: 'คำถามไม่สามารถบันทึกได้',
                text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
            window.location.reload();
        } else {
            try {
                addedQuizzes.map((quiz) => {
                    const apiUrl = 'http://localhost:8080/createQuiz';
                    const optionUrl = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${token}`,
                        },
                        body: JSON.stringify({ question: quiz.question, lessonId: quiz.lesson }),
                    };
                    fetch(apiUrl,optionUrl)
                    .then((res) => res.json())
                    .then((res) => {
                        const quizId = res._id;
                        quiz.options.map((option) => {
                            const name = option.option;
                            console.log(name);
                            const apiUrl = 'http://localhost:8080/options-with-quizId';
                            const optionUrl = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `${token}`,
                                },
                                body: JSON.stringify({ option: name , quizId }),
                            };
                            fetch(apiUrl,optionUrl)
                            .then((res) => res.json())
                            .then((res) => {
                                if (quiz.correctOption.option == name) {
                                    const correctOptionId = res._id
                                    const apiUrl = 'http://localhost:8080/options-add-correct-quizId';
                                    const optionUrl = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `${token}`,
                                        },
                                        body: JSON.stringify({ correctOptionId , quizId }),
                                    };
                                    fetch(apiUrl,optionUrl)
                                    .then((res) => res.json())
                                    .then((res) => {
                                        if (res.message) {
                                            console.log("ok")
                                        }
                                    })
                                }
                            });
                        })
                    })
                })
            } catch (error) {
                console.error('เกิดข้อผิดพลาด:', error);
            }
            await Swal.fire({
                title: 'สร้างคำถามสำเร็จ',
                text: 'ทำการเพิ่มคำถามเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            });
            window.location.reload();
        }
        
        setIsLoading(false);
        setIsNewQuestionAdded(false);
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

    const confirmDeleteQuestion = (lessonIndex: number, questionIndex: number) => {
        Swal.fire({
            title: 'คุณแน่ใจที่จะลบคำถามนี้?',
            text: 'คำถามที่ลบจะไม่สามารถกู้คืนได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ลบคำถาม',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                console.log(lessons[lessonIndex].quizzes[questionIndex]._id)
                const quizId = lessons[lessonIndex].quizzes[questionIndex]._id;
                const apiUrl = `http://localhost:8080/quizzes/${quizId}`;
                const option = {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                };
                fetch(apiUrl,option)
                .then((res) => res.json())
                .then((res) => {
                    if (res.message === 'ลบควิซสำเร็จ') {
                        Swal.fire({
                            title: 'ลบคำถามสำเร็จ',
                            text: 'คำถามถูกลบแล้ว',
                            icon: 'success',
                            confirmButtonText: 'ตกลง',
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'เกิดข้อผิดพลาดในการลบคำถาม',
                            text: 'ไม่สามารถลบคำถามได้',
                            icon: 'error',
                            confirmButtonText: 'ตกลง',
                        });
                    }
                })
            }
        });
    };  

    function compareArray(original:any, updated:any) {
        const deletedIds = original
            .filter((originalItem:any) => !updated.some((updatedItem:any) => originalItem._id === updatedItem._id))
            .map((deletedItem:any) => deletedItem._id);
        return deletedIds;
    }
    
    const updateQuiz = async (index:number) => {
        lessons[index].quizzes.map((quiz,quizIndex) => {
            quiz.options.map((option) => {
                if (quiz.options.length < originalLesson[index].quizzes[quizIndex]?.options.length) {
                    console.log("ลบ")
                    const differences = compareArray(originalLesson[index].quizzes[quizIndex].options, quiz.options);
                    differences.forEach((optionId:any) => {
                        const apiUrl = `http://localhost:8080/option/remove/${optionId}`;
                        const optionUpdateOption = {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `${token}`,
                            },
                        };
                        fetch(apiUrl, optionUpdateOption)
                            .then((res) => res.json())
                            .then((res) => {
                                console.log(res);
                            });
                    });
                }
                if (option._id != '') {
                    console.log("อัพเดท Option")
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
                    
                } else {
                    if (option.option == quiz.correctOption.option) {
                        console.log("เพิ่ม Option ที่เป้น CorrectOption");
                        const apiUrl = `http://localhost:8080/option/add/correct/${quiz._id}`;
                        const optionUpdateOption = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `${token}`,
                            },
                            body: JSON.stringify({option: option.option}),
                        };
                        fetch(apiUrl,optionUpdateOption)
                        .then((res) => res.json())
                        .then((res) => {
                            console.log(res.res);
                            const newLessons = [...lessons];
                            const newOption = {
                                _id: res._id,
                                option: option.option,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            };
                            const updatedOptions = newLessons[index].quizzes[quizIndex].options.filter(
                                (opt) => opt._id !== ''
                            );
                            newLessons[index].quizzes[quizIndex].options = updatedOptions;
                            newLessons[index].quizzes[quizIndex].options.push(newOption);
                            newLessons[index].quizzes[quizIndex].correctOption = newOption;
                            setLessons(newLessons);
                        });
                    } else {
                        console.log("เพิ่ม Option")
                        console.log(lessons)
                        const apiUrl = `http://localhost:8080/option/add/${quiz._id}`;
                        const optionUpdateOption = {
                            method: 'POST',
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
                        });
                    }
                };
            });
            if (quiz.correctOption._id != '') {
                console.log("อัพเดท quiz");
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
            }

            const apiUrl = `http://localhost:8080/lessons/${lessons[index]._id}`;
            const data = {
                title: lessons[index].title,
            };
            const option = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            };
            try {
                const response = fetch(apiUrl, option).then((response) => response.json())
                .then((response) => {
                    setIsLoading(false);
                    Swal.fire({
                        title: 'แก้ไขแบบทดสอบสำเร็จ',
                        icon: 'success',
                        confirmButtonText: 'ตกลง',
                    }).then((result) => {
                        window.location.reload();
                    });
                })
            } catch (error) {
                setIsLoading(false);
                console.error('Error updating lesson:', error);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาดในการแก้ไขบทเรียน',
                    icon: 'error',
                    confirmButtonText: 'ตกลง',
                });
            }
        });
    };

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
                                                        onChange={(event) => {
                                                            const newLessons = [...lessons];
                                                            newLessons[index].title = event.target.value;
                                                            setLessons(newLessons);
                                                            console.log(newLessons)
                                                        }}
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
                                                                    value={question.correctOption.option}
                                                                    onChange={(event) => {
                                                                        const updatedQuestionData = { ...question };
                                                                        updatedQuestionData.correctOption.option = event.target.value;
                                                                        editQuestion(index, questionIndex, updatedQuestionData);
                                                                    }}
                                                                    className="custom-select"
                                                                >
                                                                    <option value="">เลือกตัวเลือกที่ถูกต้อง</option>
                                                                    {question.options.map((option, optionIndex) => (
                                                                        <option key={optionIndex} value={option.option}>
                                                                            {option.option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="custom-button-line">
                                                                <button className="custom-button-add-option" onClick={() => addOption(index, questionIndex)}>
                                                                    เพิ่มตัวเลือก
                                                                </button>
                                                                <button className="custom-button" onClick={() => confirmDeleteQuestion(index, questionIndex)}>
                                                                    ลบคำถาม
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                    ))}
                                                    {isNewQuestionAdded && (
                                                        <div className="course-create-button">
                                                        <button onClick={() => saveNewQuestions(index)}>
                                                            บันทึกคำถามที่เพิ่ม <FontAwesomeIcon icon={faSave} />
                                                        </button>
                                                        </div>
                                                    )}
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