import React, { useState } from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SchoolIcon from "@mui/icons-material/School";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonIcon from "@mui/icons-material/Person";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function NavbarSignIn({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) {
  const navigate = useNavigate();
  const _id = localStorage.getItem('_id') || "";
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('_id');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
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

  const clickMyCourses = () => {
    navigate(`/myCourses/${_id}`);
    handleClose();
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: '#272829' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between'}}>
          <Link to="/Course">
            <IconButton sx={{ mr: 2 }}>
              <SchoolIcon style={{ color: '#FF5733' }} />
            </IconButton>
          </Link>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Online Learning
          </Typography>
          <IconButton>
            <Link to='/createCourse'>
              <AddCircleIcon style={{ color: '#FF5733' }} />
            </Link>
          </IconButton>
          <IconButton>
            <Link to={`/myCourses/${_id}`}>
              <Typography className="navbar-signin-a" variant="body1" style={{ color: '#FF5733', textDecoration: 'none' }}>
                คอร์สเรียนของฉัน
              </Typography>
            </Link>
          </IconButton>
          <IconButton>
            <Link to={`/Course`}>
              <Typography className="navbar-signin-a" variant="body1" style={{ color: '#FF5733', textDecoration: 'none' }}>
                หน้าแรก
              </Typography>
            </Link>
          </IconButton>
          <IconButton onClick={handleProfileClick}>
            <PersonIcon style={{ color: '#FF5733' }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={clickEditProfile}>แก้ไขข้อมูล</MenuItem>
            <MenuItem onClick={clickMyCourses}>คอร์สเรียนของฉัน</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavbarSignIn;

