import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Course, Type, User } from '../interfaces/ICourse';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons';

function EditCourse() {
    const { courseId } = useParams();
    const [ course , setCourse ] = useState<Course>();
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [types, setType] = useState<Type[]>([]);
    const [selectedType, setSelectedType] = useState('');
    const [file, setFile] = useState(null);
    const [user,setUser] = useState<User>();

    const _id = localStorage.getItem('_id') || "";
    const getUserbyID = () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }

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
    }

    const getType = () => {
        setIsLoading(true);
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
        setIsLoading(false);
    }

    const getCourse = async () => {
        setIsLoading(true);
        const apiUrl = `http://localhost:8080/courses/${courseId}`;
        const option = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
        const response = await fetch(apiUrl,option);
        const res = await response.json();
        if (res) {
            setCourse(course);
            setTitle(res.title);
            setDescription(res.description);
            console.log(res.instructor.username);
        } else {
            console.log("can not get course");
        }
        setIsLoading(false);
    }

    const submit = async() => {
        alert("sumbit");
    }
    
    useEffect(() => {
        getCourse();
        getType();
        getUserbyID();
    },[])
    return (
        <div>
            <h2>Edit Course</h2>
            <p>Editing course with ID: {courseId}</p>
            {isLoading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
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
                    <input type="file" id='file' name='file' accept='image/*' onChange={handleFileChange} />
                </div>
                <div className="course-create-button">
                    <button onClick={submit}>บันทึก <FontAwesomeIcon icon={faSave} /></button>
                </div>
            </div>
            )}
        </div>

    );
}

export default EditCourse;
