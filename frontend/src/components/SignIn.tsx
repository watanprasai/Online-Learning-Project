import { useState , useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import './css/signinsignup.css';

function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [forgetemail , setForgetEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword , setNewPassword] = useState('');
    const [newPassword2 , setNewPassword2] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [ popupState , setPopupState ] = useState(false); // ForgetPassword
    const [ visible, setVisible ] = useState(false); // OTP
    const [ resetPasswordState , setResetPasswordState ] = useState(false); // Reset password

    const getBackForgetpassword = () => {
        setPopupState(false);
    }

    const getBackOTPpage = () => {
        setVisible(false);
        setPopupState(true);
    }

    const getBackResetPage = () => {
        setVisible(true);
        setResetPasswordState(false);
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
    
    const forgetPasswordCheckEmail = async() => {
        try {
            const apiUrl = 'http://localhost:8080/checkEmail';
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify({ forgetemail }),
            };
    
            const res = await fetch(apiUrl,requestOptions);
            const data = await res.json();
             if (res.ok){
                Swal.fire({
                    title: 'อีเมลถูกต้อง',
                    text: 'ระบบได้ส่ง OTP เรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonText: 'รับทราบ'
                });
                setPopupState(false);
                setVisible(true);
            }else {
                Swal.fire({
                    title: 'ไม่พบอีเมลของท่าน',
                    text: data.error,
                    icon: 'error',
                    confirmButtonText: 'รับทราบ'
                });
                
           }
        }catch (error) {
            console.error('Cannot check email', error);
        }
        
    };

    const checkOtp = async() => {
        try {
            const fullOtp = otp.join("");
            let otpInfo = {
                "email" : forgetemail,
                "otp" : fullOtp
            };
            const apiUrlcheckOTP = 'http://localhost:8080/checkOTP';
            const requestOptionsOTP = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(otpInfo),
            };
            const res = await fetch(apiUrlcheckOTP,requestOptionsOTP);
            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    title: 'รหัส OTP ถูกต้อง',
                    text: 'ระบบจะพาท่านไปที่หน้า Reset password',
                    icon: 'success',
                    confirmButtonText: 'รับทราบ'
                });
                setResetPasswordState(true);
                setVisible(false);
            }else {
                Swal.fire({
                    title: 'รหัส OTP ไม่ถูกต้อง',
                    text: data.error,
                    icon: 'error',
                    confirmButtonText: 'รับทราบ'
                });
            }

        }catch (error) {
            console.error('Reset Password failed', error);
        };
    };

    const submitResetPassword = async () => {
        try {
            if (newPassword !== newPassword2) {
                await Swal.fire({
                    title: 'รหัสผ่านไม่ตรงกัน',
                    text: 'กรุณากรอกรหัสผ่านให้ตรงกันทั้งสองช่อง',
                    icon: 'error',
                    confirmButtonText: 'รับทราบ'
                });
                return;
            }
            let newPasswordInfo = {
                "email" : forgetemail,
                "password" : newPassword
            }
            const apiUrl = 'http://localhost:8080/resetPassword';
            const option = {
                method : "POST",
                headers : { "Content-Type" : "application/json"},
                body : JSON.stringify(newPasswordInfo),
            };
            const res = await fetch(apiUrl,option);
            const data = await res.json();

            if (res.ok) {
                await Swal.fire({
                    title: 'ตั้งรหัสผ่านใหม่สำเร็จ',
                    text: 'ระบบจะพาท่านไปที่หน้า SignIn',
                    icon: 'success',
                    confirmButtonText: 'รับทราบ'
                });
                setPopupState(false);
                setVisible(false);
                setResetPasswordState(false);
            } else {
                await Swal.fire({
                    title: 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ',
                    text: data.error,
                    icon: 'error',
                    confirmButtonText: 'รับทราบ'
                });
            }
        }catch (error) {
            console.log("Reset Password Failed",error);
        }
    };

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

    const forgetPasswordPopup = () => {
        return (
            <div className='forgetpassword-popup-page'>
                <div className='forgetpassword-paper'>
                    <div className="forget-icon" onClick={getBackForgetpassword}><FontAwesomeIcon icon={faAngleLeft} size='xl'/></div>
                    <label className='forgetpassword-header'>Accout recovery</label>
                    <p className='forgetpassword-text'>โปรดกรอกอีเมลที่คุณใช้ในการสมัครเพื่อรับรหัส OTP</p>
                        <TextField id="forgetEmail" label="Email" variant="outlined" value={forgetemail} onChange={(event) => setForgetEmail(event.target.value)} sx={{ width: "350px" }} />
                    <button className='forgetpassword-button' onClick={forgetPasswordCheckEmail}>Send</button>
                </div>
            </div>
        );
    };

    const registerPopup = () => {
        return (
            <div className="otp-popup">
            <div className="otp-form">
                <div className="otp-icon" onClick={getBackOTPpage}><FontAwesomeIcon icon={faAngleLeft} size='xl'/></div>
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
                    <p>หากไม่ได้รับรหัส OTP</p><button className='send-again-button' onClick={forgetPasswordCheckEmail}>ส่งรหัสผ่านอีกครั้ง</button>
                </div>
                <div className='otp-button'>
                    <button className="otp-clear-button" onClick={clearOtp}>Clear</button>
                    <button className="otp-send-button" onClick={checkOtp}>Send</button>
                </div>
            </div>
        </div>
        );
    };

    const resetPasswordPopup = () => {
        return (
            <div className='forgetPasswordPopup-page'>
                <div className="forgetpassword-container">
                    <div className="resetpassword-icon" onClick={getBackResetPage}><FontAwesomeIcon icon={faAngleLeft} size='xl'/></div>
                    <div className="forgetpassword-header">
                        Reset your password
                    </div>
                    <div className="newpassword-line">
                        กรอกรหัสผ่านใหม่สำหรับ {forgetemail}
                    </div>
                    <div className="newpassword-line">
                        <TextField 
                        id="newPassword" 
                        label="รหัสผ่านใหม่" 
                        variant="outlined" 
                        value={newPassword} 
                        onChange={(event) => setNewPassword(event.target.value)} 
                        sx={{ width: "350px" }} 
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
                    <div className="newpassword-line">
                        <TextField 
                        id="newPassword2" 
                        label="รหัสผ่านใหม่" 
                        variant="outlined" 
                        value={newPassword2} 
                        onChange={(event) => setNewPassword2(event.target.value)} 
                        sx={{ width: "350px" }}
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
                    <div className="newpassword-line">
                        <button className='newpassword-button' onClick={submitResetPassword}>Send</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='page3'>
            {popupState && forgetPasswordPopup()}
            {visible && registerPopup()}
            {resetPasswordState && resetPasswordPopup()}
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
                <div className="forget-password">
                    <button className="forget-password--button" onClick={() => setPopupState(true)}>Forget password?</button>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
