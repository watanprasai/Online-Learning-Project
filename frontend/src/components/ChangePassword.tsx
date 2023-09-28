import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { User } from '../interfaces/ICourse';
import { useParams } from "react-router-dom";
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import './css/profile.css';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState<User>();
  const { userId } = useParams();
  
  const [showPassword, setShowPassword] = useState(false);

  const getUser = () => {
    const apiUrl = `http://localhost:8080/users/${userId}`;
    const option = {
        method : "GET",
        headers : {
            "Content-Type" : "application/json"
        }
    }
    fetch(apiUrl, option)
    .then((res) => res.json())
    .then((res) => {
        if (res) {
            setUser(res);
        }
        else {
            console.log("Can not get User");
        }
    });
};

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'กรุณากรอกข้อมูลให้ถูกต้อง',
      });
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8080/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          email: user?.email,
        }),
      });
  
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'เปลี่ยนรหัสผ่านสำเร็จ',
          text: 'รหัสผ่านของคุณถูกเปลี่ยนแล้ว',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: data.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
        });
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  useEffect(() => {
    getUser();
},[]);

  return (
    <div className="change-password-page">
        <div className="change-password-container">
            <h2 className="change-password-header">เปลี่ยนรหัสผ่าน</h2>
            <div className="change-password-line">
            <label>รหัสผ่านปัจจุบัน:</label>
            <TextField 
                        id="currentPassword" 
                        variant="outlined" 
                        value={currentPassword} 
                        onChange={(event) => setCurrentPassword(event.target.value)} 
                        sx={{ width: "320px" }} 
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
            </div>
            <div className="change-password-line">
            <label>รหัสผ่านใหม่:</label>
                    <TextField 
                        id="newPassword" 
                        variant="outlined" 
                        value={newPassword} 
                        onChange={(event) => setNewPassword(event.target.value)} 
                        sx={{ width: "320px" }} 
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
            </div>
            <div className="change-password-line">
            <label>ยืนยันรหัสผ่านใหม่:</label>
            <TextField 
                        id="confirmPassword" 
                        variant="outlined" 
                        value={confirmPassword} 
                        onChange={(event) => setConfirmPassword(event.target.value)} 
                        sx={{ width: "320px" }} 
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
            </div>
            <div className="change-password-send-button">
            <button type="button" onClick={handleChangePassword} className="send-button-change-password-page">
                เปลี่ยนรหัสผ่าน
            </button>
            </div>
        </div>
    </div>
  );
}

export default ChangePassword;
