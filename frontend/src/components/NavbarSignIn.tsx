import React, { useEffect, useState } from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SchoolIcon from "@mui/icons-material/School";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Link } from 'react-router-dom';

function Navbar() {
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
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;