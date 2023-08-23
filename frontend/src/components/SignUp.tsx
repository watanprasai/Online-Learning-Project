import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/signinsignup.css';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function SignUp() {
    const navigate = useNavigate(); 
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const apiUrl = 'http://localhost:8080/register';
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            };

            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();

            if (response.ok) {
                navigate('/'); 
                window.location.reload();
            } else {
                console.error('Registration failed', data.error);
            }
        } catch (error) {
            console.error('Registration failed', error);
        }
    };

    return (
        <div className='page3'>
            <div className="signup-container">
                <label className='signup'>Sign Up</label>
                <div>
                    <TextField id="username" label="Enter your username" variant="outlined" value={username} onChange={(event) => setUsername(event.target.value)} sx={{width: "350px"}}/>
                </div>
                <div>
                    <TextField id="email" label="Enter your email" variant="outlined" value={email} onChange={(event) => setEmail(event.target.value)} sx={{width: "350px"}}/>
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
                <button type="submit" onClick={handleSubmit} className='signup-button'>Sign Up</button>
            </div> 
        </div>
    );
}

export default SignUp;
