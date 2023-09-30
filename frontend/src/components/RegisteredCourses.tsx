import React, { useState, useEffect } from 'react';
import { User } from '../interfaces/ICourse';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Import Visibility icon from @mui/icons-material

const RegisteredCourses = () => {
  const [user, setUser] = useState<User>();
  const { userId } = useParams();
  const token = localStorage.getItem('token') || '';
  const fetchUserData = async () => {
    try {
      const apiUrl = 'http://localhost:8080/getuser';
      const option = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      };
      const response = await fetch(apiUrl, option);
      if (!response.ok) {
        throw new Error('มีข้อผิดพลาดในการร้องขอข้อมูล');
      }
      const userData = await response.json();
      console.log(userData);
      setUser(userData);
    } catch (error) {
      console.error('มีข้อผิดพลาดในการร้องขอข้อมูล:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Course Title', width: 200 },
    {
      field: 'instructorName',
      headerName: 'Instructor',
      width: 1100,
    },
    {
      field: 'details',
      headerName: '',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Link to={`/courseDetail/${params.row.id}`}>
          <VisibilityIcon />
        </Link>
      ),
    },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const rows = user?.courseEnrolled.map((course) => ({
    id: course._id,
    title: course.title,
    instructorName: course.instructor.username,
  })) || [];

  return (
    <div>
      <h2>รายการคอร์สที่ลงทะเบียน</h2>
      <Box sx={{ height: 400, width: '80%', margin: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoPageSize
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
};

export default RegisteredCourses;
