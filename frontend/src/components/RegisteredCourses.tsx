import React, { useState, useEffect } from 'react';
import { User } from '../interfaces/ICourse';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './css/registercourse.css';

const RegisteredCourses = () => {
  const [user, setUser] = useState<User>();
  const { userId } = useParams();
  const token = localStorage.getItem('token') || '';
  const [progress, setProgress] = useState<any[]>([]);
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
      width: 950,
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
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
  

  const rows = user?.courseEnrolled.map((course, index) => {
    const courseProgress = progress[index];
    if (!courseProgress) {
      return {
        id: course._id,
        title: course.title,
        instructorName: course.instructor.username,
        videoProgress: 'N/A',
        quizAnswer: 'N/A',
        overallProgress: 'N/A',
      };
    }
    return {
      id: course._id,
      title: course.title,
      instructorName: course.instructor.username,
      progress: Math.round(courseProgress.overallProgress) + '%',
    };
  }) || [];
  
  const lessonIdArray = user?.courseEnrolled.map((course) => {
    return course.lessons;
  });
  
  if (lessonIdArray && lessonIdArray.length > 0) {
    const getProgressPromises = lessonIdArray.map((lessonIds) => {
      const progressPromises = lessonIds.map((lessonId) => {
        const apiUrl = `http://localhost:8080/getProgress/${lessonId}`;
        const option = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        };
        return fetch(apiUrl, option)
          .then((response) => {
            return response.json();
          })
          .catch((error) => {
            console.error('มีข้อผิดพลาดในการร้องขอข้อมูล progress:', error);
            return null; 
          });
      });
      return Promise.all(progressPromises);
    });
  
    Promise.all(getProgressPromises)
      .then((progressData) => {
        const progressPercentrage = calculateCourseProgress(progressData);
        setProgress(progressPercentrage);
      })
      .catch((error) => {
        console.error('มีข้อผิดพลาดในการร้องขอข้อมูล progress:', error);
      });
  }
  
  function calculateCourseProgress(progressData:any) {
    return progressData.map((progress:any) => {
      
      let videoProgressTotal = 0;
      let quizAnswerPercentage = 0;

      progress.forEach((item:any) => {
        if (item.videoProgress !== undefined) {
          videoProgressTotal += item.videoProgress;
        }
        if (item.quizAnswer && item.quizAnswer.length > 0) {
          quizAnswerPercentage = 100;
        }
      });
  
      const videoProgressPercentage = videoProgressTotal;
      const overallProgress = (videoProgressPercentage + quizAnswerPercentage) / progress.length;
      progress = {
        videoProgressPercentage,
        quizAnswerPercentage,
        overallProgress,
      };
      return {
        videoProgressPercentage,
        quizAnswerPercentage,
        overallProgress,
      };
    });
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className='register-course-page'>
      <div className="register-course-header">
        <h2 className='register-course-header'>รายการคอร์สที่ลงทะเบียน</h2>
      </div>
      <div className="register-course-container">
        
        <Box sx={{ height: 400, width: '100%', margin: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            autoPageSize
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </div>
    </div>
  );
};

export default RegisteredCourses;
