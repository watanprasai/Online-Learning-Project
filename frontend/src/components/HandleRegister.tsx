import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function HandleRegister() {
    const navigate = useNavigate();

    const handleCreateAccount = () => {
        Swal.fire({
            title: 'เลือกบทบาท',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Student',
            cancelButtonText: 'Teacher'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/register');
            } else {
                navigate('/register-as-admin');
            }
        });
    }

    useEffect(() => {
        handleCreateAccount();
    },[]);

    return (
        <div>
        </div>
    );
};
export default HandleRegister;