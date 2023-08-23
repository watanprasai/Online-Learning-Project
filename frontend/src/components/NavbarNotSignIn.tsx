import React, { useEffect, useState } from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SchoolIcon from "@mui/icons-material/School";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Link } from 'react-router-dom';

function NavbarNotSignIn() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: '#272829' }}>
        <Toolbar>
          <IconButton sx={{ mr: 2 }}>
            <SchoolIcon style={{ color: '#FF5733' }} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Online Learning
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavbarNotSignIn;
