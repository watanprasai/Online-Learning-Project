import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Course } from "../interfaces/ICourse";

function CourseDetail() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course>();

    const getCourseDetail = () => {
        const apiUrl = `http://localhost:8080/courses/${courseId}`;
        const option = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        };
        fetch(apiUrl, option)
            .then((res) => res.json())
            .then((res) => {
                if (res) {
                    setCourse(res);
                } else {
                    console.log("Can not get Course");
                }
            });
    };

    const lessonElement = course?.lessons.map((lesson)=>{
        return (
            <div>
                <p><b>ชื่อเนื้อหา: </b> {lesson.title}</p>
                <p><b>เนื้อหาการสอน: </b> {lesson.content}</p>
                <video width="320" height="240" controls>
                    <source
                        src={require(`../files/${lesson.videoURL}`)}
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
            </div>
        )
    });

    useEffect(() => {
        getCourseDetail();
    }, []);

    return (
        <div>
            <div className="course-detail-course">
            {course ? (
                <>
                    <img src={require(`../files/${course?.url}`)} width="320" height="240" />
                    <p><b>รหัส: </b>{course._id}</p>
                    <p><b>ชื่อคอร์ส: </b>{course.title}</p>
                    <p><b>คำอธิบาย: </b>{course.description}</p>
                    <p><b>ครูผู้สอน: </b>{course.instructor.username}</p>
                    <button>ลงทะเบียนเรียน</button>
                </>
            ) : (
                <p>Loading...</p>
            )}   
                    </div>
            <hr />
            <div className="course-detail-lesson">
                {lessonElement}
            </div>
        </div>
    );
}

export default CourseDetail;
