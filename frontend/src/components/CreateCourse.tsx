import { Course, Lesson, User , Type} from '../interfaces/ICourse';
import './css/createcourse.css'
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave , faCirclePlus} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

function CreateCourse() {
    const navigate = useNavigate();
    const [userID , setUserID] = useState("64da7b0959e38b181c753a3c");
    const [user , setUser] = useState<User>();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [types, setType] = useState<Type[]>([]);
    const [selectedType, setSelectedType] = useState('');
    const getType = async() => {
        const apiUrl = "http://localhost:8080/types";
        const option = {
            method: "GET",
            headers: { "Content-Type" : "apllication/json"},
        };
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res) => {
            if (res){
                setType(res);
            }
            else {
                alert("Can not get types");
            }
        })
    }
    const getUserbyID = async() => {
        const apiUrl = `http://localhost:8080/users/${userID}`;
        const option = {
            method : "GET",
            headers : { "Content-Type" : "application/json"},  
        };
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res) => {
            if (res){
                setUser(res);
            }
            else {
                alert("Can not get user by _id");
            }
        })
    }

    const submit = () => {
        let data = {
            "title": title,
            "description": description,
            "instructor": userID,
            "type": selectedType,
            "url":url
        };
        const apiUrl = "http://localhost:8080/courses";
        const option = {
            method: "POST",
            headers: { "Content-Type" : "application/json",},
            body: JSON.stringify(data),
        }
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                console.log(res);
                navigate(`/createLesson`,{state : {courseID: res._id}});
                alert("Create course succeed");
            }else {
                alert("Can not create course");
            }
        });
    }

    useEffect(() => {
        getType();
        getUserbyID();
    },[])

    return (
        <div className="page2">
            <div className='header'>
                Course Create
            </div>
            <div className="course-create-container">
                <div className='course-line'>
                    หัวข้อ 
                    <input type="text" id='title' name='title' placeholder='กรอกหัวข้อ' value={title} onChange={(event) => setTitle(event.target.value)}/>
                </div>
                <div className='course-line'>
                    คำอธิบาย
                    <input type="text" id="description" name='description' placeholder='กรอกคำอธิบาย' value={description} onChange={(event) => setDescription(event.target.value)}/>
                </div>
                <div className='course-line'>
                    ครูผู้สอน
                    <input type="text" id='instructor' name='instructor' placeholder='กรอกชื่อครูผู้สอน' value={user?.username}/>
                </div>
                <div className='course-line'>
                    หมวดหมู่
                    <select name="types" id="types" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                        <option value="">กรุณาเลือกหมวดหมู่</option>
                        {types.map((type) => (
                            <option key={type._id} value={type._id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='course-line'>
                    รูปปก
                    <input type="text" id='url' name='url' placeholder='กรอก url รูปหน้าปก' value={url} onChange={(event) => setUrl(event.target.value)}/>
                </div>
                <div className="course-create-button">
                    <button onClick={submit}>บันทึก <FontAwesomeIcon icon={faSave} /></button>
                </div>
            </div>
        </div>
    );
}

export default CreateCourse;