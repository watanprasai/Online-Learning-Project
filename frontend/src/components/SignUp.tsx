import { useState , useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import './css/signinsignup.css';
import './css/otp.css'

function SignUp() {
    const navigate = useNavigate(); 
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [visible, setVisible] = useState(false);

    const handleVisibility = (state: boolean) => {
        setVisible(state);
    };

    const isEmailValid = (email:any) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    };

    const isNameValid = (name:any) => {
        return name.length >= 3 && name.includes(' ');
    }
    

    const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const handleInputChange = (index: number, value: string) => {
        const newOtp = [...otp];
        newOtp[index] = value;

        if (value.length === 1 && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        setOtp(newOtp);
    };

    const handleBackspace = (index: number, value: string) => {
        const newOtp = [...otp];
        newOtp[index] = value;

        if (value.length === 0 && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        setOtp(newOtp);
    };

    const clearOtp = () => {
        setOtp(["", "", "", "", ""]);
        inputRefs.current[0]?.focus();
    };
    
    const registerPopup = () => {
        return (
            <div className="otp-popup">
            <div className="otp-form">
                <div className="otp-icon" onClick={() => handleVisibility(false)}><FontAwesomeIcon icon={faAngleLeft} size='xl'/></div>
                <label className='otp-header'>Enter verification code</label>
                <p>โปรดกรอกรหัส OTP ที่ส่งไปในอีเมลที่คุณใช้ในการสมัคร</p>
                <div className="otp-input-container">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            value={digit}
                            maxLength={1}
                            ref={ref => (inputRefs.current[index] = ref)}
                            onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                            }}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace') {
                                    handleBackspace(index, '');
                                }
                            }}
                            className="otp-input"
                        />
                    ))}
                </div>
                <div className="otp-text">
                    <p>หากไม่ได้รับรหัส OTP</p><button className='send-again-button' onClick={generateOTP}>ส่งรหัสผ่านอีกครั้ง</button>
                </div>
                <div className='otp-button'>
                    <button className="otp-clear-button" onClick={clearOtp}>Clear</button>
                    <button className="otp-send-button" onClick={handleSubmit}>Send</button>
                </div>
            </div>
        </div>
        );
    };

    const generateOTP = async() => {
        if (!username || !email || !password) {
            Swal.fire({
                title: 'ข้อมูลไม่ครบ',
                text: 'โปรดกรอกข้อมูลให้ครบถ้วน',
                icon: 'warning',
                confirmButtonText: 'รับทราบ'
            });
            return;
        }
        if (!isNameValid(username)) {
            Swal.fire({
                title: 'ชื่อไม่ถูกต้อง',
                text: 'โปรดป้อนชื่อที่ถูกต้อง',
                icon: 'warning',
                confirmButtonText: 'รับทราบ'
            });
            return;
        }
        if (!isEmailValid(email)) {
            Swal.fire({
                title: 'อีเมลไม่ถูกต้อง',
                text: 'โปรดป้อนอีเมลที่ถูกต้อง',
                icon: 'warning',
                confirmButtonText: 'รับทราบ'
            });
            return;
        }
        if (password !== confirmPassword) {
            Swal.fire({
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'โปรดตรวจสอบรหัสผ่านและรหัสผ่านยืนยันอีกครั้ง',
                icon: 'warning',
                confirmButtonText: 'รับทราบ'
            });
            return;
        };
        try {
            let info = {
                "email" : email
            }
            const apiUrl = 'http://localhost:8080/getOTP';
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(info),
            };
            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();

            if (response.ok) {
                handleVisibility(true);
                Swal.fire({
                    title: 'ส่งรหัส OTP เรียบร้อยแล้ว',
                    text: 'โปรดเช็ครหัส OTP ที่อีเมลที่ใช้ในการสมัคร',
                    icon: 'success',
                    confirmButtonText: 'รับทราบ'
                });
            } else {
                Swal.fire({
                    title: 'ลงทะเบียนไม่สำเร็จ',
                    text: data.error,
                    icon: 'error',
                    confirmButtonText: 'รับทราบ'
                });
                console.error('Registration failed', data.error);
            }
        }catch (error){
            console.error('Registration failed', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const fullOtp = otp.join("");
            let otpInfo = {
                "email" : email,
                "otp" : fullOtp
            }
            const apiUrlcheckOTP = 'http://localhost:8080/checkOTP';
            const requestOptionsOTP = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(otpInfo),
            };
            let regInfo = {
                "username" : username,
                "email" : email,
                "password" : password
            }
            const apiUrlregister= 'http://localhost:8080/register';
            const requestOptionsRegister = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regInfo),
            };

            const response = await fetch(apiUrlcheckOTP, requestOptionsOTP);

            if (response.ok) {
                const responseRegister = await fetch(apiUrlregister, requestOptionsRegister);
                const dataRegister = await responseRegister.json();
                await Swal.fire({
                        title: 'ลงทะเบียนสำเร็จ',
                        text: 'ระบบจะพาท่านไปที่หน้า SignIn',
                        icon: 'success',
                        confirmButtonText: 'รับทราบ'
                });
                if (responseRegister.ok) {
                    handleVisibility(false);
                    navigate('/login');
                    window.location.reload();
                }
                else {
                    Swal.fire({
                        title: 'Cannot register',
                        text: dataRegister.error,
                        icon: 'error',
                        confirmButtonText: 'รับทราบ'
                    });
                }
            } else {
                Swal.fire({
                    title: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ',
                    text: 'โปรดตรวจสอบรหัส OTP ของท่าน',
                    icon: 'error',
                    confirmButtonText: 'รับทราบ'
                });
            }
        } catch (error) {
            console.error('Registration failed', error);
        }
    };

    return (
        <div className='page3'>
            {visible && registerPopup()}
            <div className="signup-container">
                <label className='signup'>Sign Up</label>
                <div>
                    <TextField id="username" label="Enter your name" variant="outlined" value={username} onChange={(event) => setUsername(event.target.value)} sx={{width: "350px"}}/>
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
                <div>
                    <TextField
                        id="confirmPassword"
                        label="Confirm Password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
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
                <button type="submit" onClick={generateOTP} className='signup-button'>Sign Up</button>
            </div> 
        </div>
    );
}

export default SignUp;
