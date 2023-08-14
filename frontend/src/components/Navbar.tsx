import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SchoolIcon from "@mui/icons-material/School";

function Navbar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: '#272829' }}>
        <Toolbar>
          <IconButton sx={{ mr: 2 }}>
            <SchoolIcon style={{ color: '#FF5733' }}/>
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Online Learning
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
