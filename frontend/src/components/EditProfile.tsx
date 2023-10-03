import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "../interfaces/ICourse";
import { useNavigate } from "react-router-dom";
import './css/profile.css';
import Swal from 'sweetalert2';

function EditProfile() {
    const navigate = useNavigate();    
    const { userId } = useParams();
    const [user, setUser] = useState<User>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); 

    const getUser = () => {
        const apiUrl = `http://localhost:8080/users/${userId}`;
        const option = {
            method : "GET",
            headers : {
                "Content-Type" : "application/json"
            }
        }
        fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => {
            if (res) {
                setUser(res);
                setName(res.username);
                setOriginalName(res.username);
                setEmail(res.email);
                setOriginalEmail(res.email);
            }
            else {
                console.log("Can not get User");
            }
        });
    };

    const handleEditMode = () => {
        setIsEditMode(true);
        setIsEditing(true);
    }

    const handleCloseEditMode = () => {
        setIsEditMode(false);
        setIsEditing(false);
        setName(originalName);
        setEmail(originalEmail);
    }

    const saveProfile = async () => {
        if (!name || !email) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกชื่อและอีเมล',
                text: 'ชื่อและอีเมลห้ามเป็นค่าว่าง',
            });
            return;
        }
    
        const apiUrl = `http://localhost:8080/users/${userId}`;
        const option = {
            method : "PUT",
            headers : {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({ username: name, email: email })
        };
        try {
            const response = await fetch(apiUrl, option);
            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    text: 'ข้อมูลผู้ใช้ถูกอัพเดทแล้ว'
                });
                window.location.reload();
            } else {
                console.log("Failed to update user profile.");
            }
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    };
    

    useEffect(() => {
        getUser();
    },[]);

    return (
        <div className="profile-page">
            <div className="profile-container">
                {isEditMode? (<h2>แก้ไขข้อมูลส่วนตัว</h2>) : (<h2>ข้อมูลส่วนตัว</h2>)}
                    <div className="profile-line">
                        <label>ชื่อ นามสกุล:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="profile-line">
                        <label>อีเมล:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={true} 
                        />
                    </div>
                    <div className="profile-line">
                        <label>Role:</label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            value={user?.role}
                            disabled={true} 
                        />
                    </div>
                    {isEditMode ? (
                        <div>
                            <div className="profile-button-line">
                                <button type="button" className="change-password-button" onClick={() => {navigate(`/editProfile/${userId}/changePassword`)}}>แก้ไขรหัสผ่าน</button>
                            </div>
                            <div className="profile-button-back-save-line">
                                <button type="button" onClick={handleCloseEditMode} className="profile-button-back-button">ย้อนกลับ</button>
                                <button type="button" onClick={saveProfile} className="profile-button-save-button">บันทึก</button>
                            </div>
                        </div>  
                    ) : (
                        <div>
                            <div className="profile-button-line">
                                <button type="button" onClick={() => {navigate(`/editProfile/${userId}/changePassword`)}} className="change-password-button">แก้ไขรหัสผ่าน</button>
                            </div>
                            <div className="profile-button-line">
                                <button type="button" onClick={handleEditMode} className="edit-profile-button">แก้ไขข้อมูลส่วนตัว</button>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default EditProfile;
