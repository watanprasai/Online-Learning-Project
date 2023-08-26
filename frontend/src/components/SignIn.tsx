import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Swal from 'sweetalert2';
import './css/signinsignup.css';

function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        try {
            const apiUrl = 'http://localhost:8080/login';
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            };

            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: 'เข้าสู่ระบบสำเร็จ',
                    text: 'ระบบจะพาท่านไปที่หน้าหลัก',
                    icon: 'success',
                    confirmButtonText: 'รับทราบ'
                });
                const token = data.token;
                const _id = data.userID;
                localStorage.setItem('token', token);
                localStorage.setItem('_id', _id);
                navigate('/Course'); 
                window.location.reload();
            } else {
                await Swal.fire({
                    title: 'อีเมล หรือ รหัสผ่าน ไม่ถูกต้อง',
                    text: 'โปรดตรวจสอบอีเมล และ รหัสผ่าน',
                    icon: 'error',
                    confirmButtonText: 'รับทราบ'
                });
                console.error('Login failed', data.error);
            }
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className='page3'>
            <div className="signin-container">
                <label className='sign-in'>Sign in</label>
                <div>
                    <TextField id="email" label="Email" variant="outlined" value={email} onChange={(event) => setEmail(event.target.value)} sx={{ width: "350px" }} />
                </div>
                <div>
                    <TextField
                        id="password"
                        label="Password"
                        variant="outlined"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        sx={{ width: "350px" }}
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
                <div className="signin-button">
                    <a href="/register">Create account</a>
                    <button type="submit" onClick={handleSubmit} >Sign In</button>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
