import { Course, Lesson, User , Type} from '../interfaces/ICourse';
import './css/createcourse.css'
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave , faCirclePlus} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

function CreateCourse() {
    const _id = localStorage.getItem('_id') || "";
    const navigate = useNavigate();
    const [user , setUser] = useState<User>();

    const [file, setFile] = useState(null);

    const handleFileChange = (event: any) => {
        const selectedFile = event.target.files[0];
    
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
        } else {
            Swal.fire({
                title: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (รองรับเฉพาะไฟล์ JPEG และ PNG)',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
            }).then((result) => {
                if (result.isConfirmed) {
                    setFile(null);
                    window.location.reload();
                }
            });
        }
    }
    

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [types, setType] = useState<Type[]>([]);
    const [selectedType, setSelectedType] = useState('');
    const getType = () => {
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
    const getUserbyID = () => {
        const apiUrl = `http://localhost:8080/users/${_id}`;
        const option = {
            method : "GET",
            headers : { "Content-Type" : "application/json"},  
        };
        fetch(apiUrl,option)
        .then((res) => res.json())
        .then((res) => {
            if (res){
                setUser(res)
            }
            else {
                alert("Can not get user by _id");
            }
        })
    }

    const submit = async() => {

        const photo = new FormData();
        photo.append('file', file || "");
        const apiUrlUpload = "http://localhost:8080/upload";
        const optionUpload = {
            method: "POST",
            body: photo,
        };
        const photoRes = await fetch(apiUrlUpload, optionUpload)
        const photoName = await photoRes.json()
   
        let data = {
            "title": title,
            "description": description,
            "instructor": _id,
            "type": selectedType,
            "url": photoName
        };
        const apiUrl = "http://localhost:8080/courses";
        const option = {
            method: "POST",
            headers: { "Content-Type" : "application/json",},
            body: JSON.stringify(data),
        }
        const res = await fetch(apiUrl,option);
        const message = await res.json();
        
        if(res.ok){
            await Swal.fire({
                title: 'สร้าง Course สำเร็จ',
                text: 'ระบบจะพาท่านไปที่หน้าเพิ่มเนื้อหา',
                icon: 'success',
                confirmButtonText: 'รับทราบ'
            });
            navigate(`/createLesson`,{state : {courseID: message._id}});
        }else {
            await Swal.fire({
                title: 'สร้าง Course ไม่สำเร็จ',
                text: message.error,
                icon: 'error',
                confirmButtonText: 'รับทราบ'
            });
        }
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
                    <input type="text" id='instructor' name='instructor' placeholder='กรอกชื่อครูผู้สอน' value={user?.username} disabled/>
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
                <div className='course-line-upload'>
                    รูปปก
                    <br />( jpeg, png )
                    <input type="file" id='file' name='file' accept="image/jpeg, image/png" onChange={handleFileChange} />
                </div>
                <div className="course-create-button">
                    <button onClick={submit}>บันทึก <FontAwesomeIcon icon={faSave} /></button>
                </div>
            </div>
        </div>
    );
}

export default CreateCourse;