import React, { useState, useEffect } from 'react';
import { Course } from '../interfaces/ICourse';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import './css/showcourseadmin.css';

function ShowCourseAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    const apiUrl = 'http://localhost:8080/courseByUserId';
    const option = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    };
    fetch(apiUrl, option)
      .then((response) => response.json())
      .then((data) => {
        const formattedCourses = data.map((course: any) => ({
          id: course._id,
          title: course.title,
          description: course.description,
          lessonCount: course.lessons.length,
          userCount: course.enrolledStudents.length,
        }));
        setCourses(formattedCourses);
        console.log(formattedCourses);
      })
      .catch((error) => {
        console.error('Error fetching course data:', error);
      });
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Course ID', width: 250 },
    { field: 'title', headerName: 'หัวข้อ', width: 200 },
    { field: 'description', headerName: 'คำอธิบาย', width: 400 },
    { field: 'lessonCount', headerName: 'จำนวนบทเรียน', width: 200 },
    { field: 'userCount', headerName: 'จำนวนผู้ลงทะเบียน', width: 200 },
    {
      field: 'edit',
      headerName: '',
      width: 150,
      renderCell: (params) => (
        <Link to={`/editCourse/${params.row.id}`}>
          <EditIcon />
        </Link>
      ),
    },

  ];

  return (
    <div className='show-course-admin-page'>
      <h2 className='show-course-admin-header'>รายการคอร์ส</h2>
      <div style={{ height: 400, width: '80%', margin: 'auto'}}>
        <DataGrid rows={courses} columns={columns} autoPageSize />
      </div>
    </div>
  );
}

export default ShowCourseAdmin;
