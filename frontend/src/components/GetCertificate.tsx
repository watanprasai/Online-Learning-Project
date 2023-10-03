import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './css/getcertificate.css'; 
import CertificateCanvas from './CertificateCanvas';
import { Course, User } from '../interfaces/ICourse';

function GetCertificate() {
    const certificateImageUrl = 'testCertificate.png';
    const { courseId , userId } = useParams();
    const [user, setUser] = useState<User>();
    
    const getUser = async() => {
        const apiUrl = `http://localhost:8080/users/${userId}`;
        const option = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        };
        fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                setUser(res);
            }
            else {
                console.log("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
            }
        });
    };

    const [course, setCourse] = useState<Course>();
    
    const getCourse = async() => {
        const apiUrl = `http://localhost:8080/courses/${courseId}`;
        const option = {
            method: "GET",
            headers: {"Content-Type" : "application/json"},
        };
        fetch(apiUrl, option)
        .then((res) => res.json())
        .then((res) => {
            if(res){
                setCourse(res);
            }
            else {
                console.log("ไม่สามารถดึงข้อมูลคอร์สได้");
            }
        });
    };

    useEffect(() => {
        getCourse();
        getUser();
    },[]);

    return (
        <div className="certificate-container">
            <h2 className='certificate-header'>ใบประกาศนี้สำหรับการสำเร็จการเรียน</h2>
            <CertificateCanvas courseTitle={course?.title} studentName={user?.username} />
        </div>
    );
}

export default GetCertificate;
