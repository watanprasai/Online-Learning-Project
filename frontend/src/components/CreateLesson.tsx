import { Course } from '../interfaces/ICourse';
import './css/createcourse.css'
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTeeth } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

function CreateLesson() {
    const location = useLocation();
    const courseID = location.state.courseID;
    const token = localStorage.getItem('token') || "";

    const [lessonTitle, setLessonTitle] = useState('');
    const [content, setContent] = useState('');

    const [videoFile, setVideo] = useState(null);

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '']); // เริ่มต้นด้วย 3 ตัวเลือก
    const [selectedCorrectOption, setSelectedCorrectOption] = useState('');
   

    const handleQuestionSubmit = () => {

        if (!lessonTitle || !question || options.some((option) => !option) || !selectedCorrectOption) {
            Swal.fire({
                icon: 'error',
                title: 'ข้อมูลไม่ครบ',
                text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
            });
            return; 
        }
        console.log('บันทึกคำถาม:', { question, options, selectedCorrectOption });
        const optionIds : string[] = [];
        let correctOptionID = '';
    
        const optionPromises = options.map((optionText) => {
            const apiUrlOption = `http://localhost:8080/options`;
            const optionOption = {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization" : `${token}`
                },
                body: JSON.stringify({ option: optionText })
            };
    
            return fetch(apiUrlOption, optionOption)
                .then((res) => res.json())
                .then((res) => {
                    if (res) {
                        if (selectedCorrectOption === optionText) {
                            correctOptionID = res._id;
                        }
                        optionIds.push(res._id);
                        return res._id;
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: error,
                    });
                });
        });
    
        Promise.all(optionPromises)
            .then(() => {
                console.log('Option IDs:', optionIds);
                console.log('Correct Option ID:', correctOptionID);
    
                return fetch('http://localhost:8080/lessons-quiz', {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization" : `${token}`
                    },
                    body: JSON.stringify({ title: lessonTitle , course : courseID})
                });
            })
            .then((res) => res.json())
            .then((res) => {
                if (res) {
                    const apiUrlQuiz = `http://localhost:8080/lessons/${res._id}/quizzes`;
                    const optionQuiz = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization" : `${token}`
                        },
                        body: JSON.stringify({
                            question: question,
                            options: optionIds,
                            correctOption: correctOptionID
                        })
                    };
                    return fetch(apiUrlQuiz, optionQuiz);
                }
            })
            .then(() => {
                setQuestion('');
                setOptions(['', '', '']);
                setSelectedCorrectOption('');
                setLessonTitle('');
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    text: 'คำถามของคุณถูกบันทึกแล้ว',
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error,
                });
            });
    };
    

    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        const updatedOptions = [...options];
        updatedOptions.splice(index, 1);
        setOptions(updatedOptions);
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
                    <input type="text" id='lesson-title' name='lesson-title' placeholder='กรอกชื่อเนื้อหาการสอน' value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)}/>
                </div>
                <div className="lesson-line">เนื้อหา<input type="text" id='content' name='content' placeholder='กรอกรายละเอียดเนื้อหา' value={content} onChange={(event) => setContent(event.target.value)}/></div>
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
        return (
            <div className="quiz-form">
                <div className="form-group">
                    <label htmlFor="lesson-title">หัวข้อ:</label>
                    <input type="text" id="lesson-title" name="lesson-title" placeholder="กรอกชื่อหัวข้อ" value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} className="custom-input" />
                </div>
                <div className="form-group">
                    <label htmlFor="question">คำถาม:</label>
                    <input
                        type="text"
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="custom-input"
                    />
                </div>
                {options.map((option, index) => (
                    <div className="form-group-choice" key={index}>
                        <label htmlFor={`option-${index}`}>ตัวเลือก {index + 1}:</label>
                        <input
                            type="text"
                            id={`option-${index}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="custom-input"
                        />
                        <button onClick={() => handleRemoveOption(index)} className="custom-button">ลบ</button>
                    </div>
                ))}
                <div className="form-group">
                    <label htmlFor="selectedCorrectOption">ตัวเลือกที่ถูกต้อง:</label>
                    <select
                        id="selectedCorrectOption"
                        value={selectedCorrectOption}
                        onChange={(e) => setSelectedCorrectOption(e.target.value)}
                        className="custom-select"
                    >
                        <option value="">เลือกตัวเลือกที่ถูกต้อง</option>
                        {options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="custom-button-line">
                    <button onClick={handleAddOption} className="custom-button-add-option">เพิ่มตัวเลือก</button>
                    <button onClick={handleQuestionSubmit} className="custom-button-submit-question">บันทึกคำถาม</button>
                </div>
            </div>
        );
    }

    const [course, setCourse] = useState<Course>();
    const getCourseByID = async() => {
        const apiUrl = `http://localhost:8080/courses/${courseID}`;
        const option = {
            method: "GET",
            headers: { "Content-Type" : "apllication/json"},
        }
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res)=> {
            if (res){
                setCourse(res);
            }
            else {
                alert("Can not get course by _id");
            }
        })
    }

    const submit = async() => {
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
            "course" : courseID,
            "title" : lessonTitle,
            "content" : content,
            "videoURL" : videoName,
        };
        const apiUrl = "http://localhost:8080/lessons";
        const option = {
            method : "POST",
            headers : { "Content-Type" : "application/json"},
            body : JSON.stringify(data),
        }
        const res = await fetch(apiUrl,option);
        const message = await res.json();
        if(res.ok){
            await Swal.fire({
                title: 'สร้าง Lesson สำเร็จ',
                text: 'เพิ่มเนื้อหาใหม่โดยการกดปุ่มบันทึก',
                icon: 'success',
                confirmButtonText: 'รับทราบ'
            });
            setLessonTitle("");
            setContent("");
        }else {
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


    useEffect(() => {
        getCourseByID();
    },[])

    return (
        <div className="page2">
            <div className='header'>
                Lesson Create
            </div>
            <div className="course-create-container">
                <div className='course-line'>
                    หัวข้อ 
                    <input type="text" id='title' name='title' placeholder='กรอกหัวข้อ' value={course?.title}/>
                </div>
                <div className='course-line'>
                    คำอธิบาย
                    <input type="text" id="description" name='description' placeholder='กรอกคำอธิบาย' value={course?.description}/>
                </div>
                <div className='course-line'>
                    ครูผู้สอน
                    <input type="text" id='instructor' name='instructor' placeholder='กรอกชื่อครูผู้สอน' value={course?.instructor.username}/>
                </div>
                <div className='course-line'>
                    หมวดหมู่
                    <select name="types" id="types" >
                        <option value="">{course?.type.name}</option>
                    </select>
                </div>
                <div className='course-line'>
                    รูปปก
                    <input type="text" id='url' name='url' placeholder='กรอก url รูปหน้าปก' value={course?.url}/>
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