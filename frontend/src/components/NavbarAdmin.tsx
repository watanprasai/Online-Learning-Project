import React, { useEffect, useState } from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SchoolIcon from "@mui/icons-material/School";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from '@mui/icons-material/Category';
import EditIcon from "@mui/icons-material/Edit";
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function  NavbarAdmin({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState("");
    const [userName, setUserName] = useState("");
    const _id = localStorage.getItem('_id') || "";
    const token = localStorage.getItem('token') || '';
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('_id');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        navigate('/login');
        handleClose();
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const clickEditProfile = () => {
        navigate(`/editProfile/${_id}`);
        handleClose();
    };

    const clickCreateCourse = () => {
        navigate(`/createCourse`);
        handleClose();
    };

    const clickEditCourse = () => {
        navigate(`/showCourse`);
        handleClose();
    };

    const clickMyCourses = () => {
        navigate(`/myCourses/${_id}`);
        handleClose();
    };

    const clickEditType = () => {
        navigate(`/typesDetail`);
        handleClose();
    };

    const clickHandleRequest = () => {
        navigate(`/request-admin`);
        handleClose();
    };

    useEffect(() => {
        if (token) {
          fetch('http://localhost:8080/secure-route', {
            method: 'GET',
            headers: {
              Authorization: `${token}`
            }
          })
          .then(response => response.json())
          .then(data => {
            setUserRole(data.role);
          })
          .catch(error => {
            console.error('Error fetching user role:', error);
          });
        }
        fetch(`http://localhost:8080/getuser`, {
            method: 'GET',
            headers: {
              Authorization: `${token}`
            }
        })
        .then(response => response.json())
          .then(data => {
            console.log(data)
            setUserName(data.username)
          })
          .catch(error => {
            console.error('Error fetching user data:', error);
          });
      }, []);

    return (
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" style={{ background: '#272829' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <Link to="/">
                <IconButton sx={{ mr: 2 }}>
                <SchoolIcon style={{ color: '#FF5733' }} />
                </IconButton>
            </Link>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Online Learning with me
            </Typography>
            {userRole === 'admin-root' && (
                <IconButton>
                    <Link to='/request-admin'>
                    <EmojiPeopleIcon style={{ color: '#FF5733' }} />
                    </Link>
                </IconButton>
            )}
            <IconButton>
                <Link to='/showCourse'>
                    <EditIcon style={{ color: '#FF5733' }} />
                </Link>
            </IconButton>
            {userRole === 'admin-root' && (
                <IconButton>
                    <Link to='/typesDetail' style={{ textDecoration: 'none' }}>
                        <CategoryIcon style={{ color: '#FF5733' }} />
                    </Link>
                </IconButton>
            )}
            <IconButton>
                <Link to='/createCourse'>
                <AddCircleIcon style={{ color: '#FF5733' }} />
                </Link>
            </IconButton>
            <IconButton>
                <Link to={`/myCourses/${_id}`} style={{ textDecoration: 'none' }}>
                <Typography className="navbar-signin-a" variant="body1" style={{ color: '#FF5733', textDecoration: 'none' }}>
                    คอร์สเรียนของฉัน
                </Typography>
                </Link>
            </IconButton>
            <IconButton>
                <Link to={`/`} style={{ textDecoration: 'none' }}>
                <Typography className="navbar-signin-a" variant="body1" style={{ color: '#FF5733', textDecoration: 'none' }}>
                    หน้าแรก
                </Typography>
                </Link>
            </IconButton>
            <Typography style={{ color: '#FF5733'}}>{userName}</Typography>
            <IconButton onClick={handleProfileClick}>
                <PersonIcon style={{ color: '#FF5733' }} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={clickEditProfile}>ข้อมูลส่วนตัว</MenuItem>
                {userRole === 'admin-root' && (
                    <MenuItem onClick={clickHandleRequest}>รายการคำขอ</MenuItem>
                )}
                <MenuItem onClick={clickMyCourses}>คอร์สเรียนของฉัน</MenuItem>
                <MenuItem onClick={clickCreateCourse}>สร้างคอร์ส</MenuItem>
                <MenuItem onClick={clickEditCourse}>แก้ไขคอร์ส</MenuItem>
                {userRole === 'admin-root' && (
                    <MenuItem onClick={clickEditType}>แก้ไขประเภท</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
            </Toolbar>
        </AppBar>
        </Box>
    );
}

export default NavbarAdmin;