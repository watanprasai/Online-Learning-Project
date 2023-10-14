import { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import IconButton from "@mui/material/IconButton";
import VerifiedIcon from '@mui/icons-material/CheckCircle';
import RejectIcon from '@mui/icons-material/Cancel';
import { RequestAdmin } from '../interfaces/ICourse';
import './css/adminrequest.css'

function AdminReqeust() {
    const [requests, setRequests] = useState<RequestAdmin[]>([]);
    const token = localStorage.getItem('token') || "";
    const [loading, setLoading] = useState(true);

    const columns: GridColDef[] = [
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'role', headerName: 'Role', width: 150 },
        { field: 'createdAt', headerName: 'Created At', width: 200 },
        {
            field: 'actions',
            headerName: '',
            width: 120,
            renderCell: (params) => (
                <div>
                    <IconButton style={{ color: 'green' }} onClick={() => handleVerifiedClick(params.row.id)}>
                        <VerifiedIcon />
                    </IconButton>
                    <IconButton style={{ color: 'red' }} onClick={() => handleRejectClick(params.row.id)}>
                        <RejectIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    const rows = requests.map((request) => ({
        id: request._id,
        username: request.username,
        email: request.email,
        phone: request.phone,
        role: request.role,
        createdAt: request.createdAt,
    }));
      

    const handleVerifiedClick = async (id: any) => {
        Swal.fire({
            title: 'ยืนยัน',
            text: 'คุณแน่ใจหรือไม่ที่ต้องการยืนยันคำขอนี้?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const apiUrl = `http://localhost:8080/register-as-admin`;
                    const option = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `${token}`,
                        },
                        body: JSON.stringify({ id }),
                    };
    
                    const response = await fetch(apiUrl, option);
                    if (response.status === 201) {
                        setLoading(true);
                        const sendEmailApiUrl = 'http://localhost:8080/confirmEmail';
                        const optionSendEmail = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `${token}`,
                            },
                            body: JSON.stringify({ id , isAccepted:true }),
                        };
                        const res = await fetch(sendEmailApiUrl,optionSendEmail);
                        if (res) {
                            console.log(res);
                        };
                        setLoading(false);
                        const apiUrl = `http://localhost:8080/request-admin/${id}`;
                        const option = {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `${token}`,
                            },
                        };
                        const response = await fetch(apiUrl, option);
                        if (response.status === 200) {
                            await Swal.fire({
                                title: 'อนุมัติสำเร็จ',
                                text: 'การสมัครสมาชิกสำเร็จ',
                                icon: 'success',
                            });
                            window.location.reload();
                        } else {
                            console.error('Failed to delete request');
                            await Swal.fire({
                                title: 'อนุมัติไม่สำเร็จ',
                                text: 'การสมัครสมาชิกไม่สำเร็จ',
                                icon: 'error',
                            });
                            window.location.reload();
                        }
                    } else {
                        console.error('Failed to register as admin');
                        await Swal.fire({
                            title: 'เกิดข้อผิดพลาด',
                            text: 'สมัครสมาชิกไม่สำเร็จ',
                            icon: 'error',
                        });
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Error registering as admin', error);
                    await Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: 'มีข้อผิดพลาดในการสมัครสมาชิก',
                        icon: 'error',
                    });
                    window.location.reload();
                }
            }
        });
    };
    
    const handleRejectClick = (id:any) => {
        Swal.fire({
            title: 'ยืนยัน',
            text: 'คุณแน่ใจหรือไม่ที่ต้องการปฏิเสธคำขอนี้?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                deleteRequest(id); 
            }
        });
    };
    
    const getRequest = async () => {
        try {
        const apiUrl = `http://localhost:8080/request-admin`;
        const option = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,
            },
        }
          const response = await fetch(apiUrl,option);
          if (response.status === 200) {
            const data = await response.json();
            setRequests(data);
            setLoading(false);
          } else {
            console.error('Failed to retrieve types');
          }
        } catch (error) {
          console.error('Error retrieving types', error);
        }
    };

    const deleteRequest = async (id:any) => {
        try {
            setLoading(true);
                const sendEmailApiUrl = 'http://localhost:8080/confirmEmail';
                const optionSendEmail = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                    body: JSON.stringify({ id , isAccepted:false }),
                };
                const res = await fetch(sendEmailApiUrl, optionSendEmail);
                if (res.status === 200) {
                    console.log('อีเมลถูกส่งเมื่อคำขอถูกปฎิเสธ');
                } else {
                    console.error('Failed to send rejection email');
                }
            setLoading(false);
            const apiUrl = `http://localhost:8080/request-admin/${id}`;
            const option = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`,
                },
            }
            const response = await fetch(apiUrl, option);
            if (response.status === 200) {
                await Swal.fire({
                    title: 'สำเร็จ',
                    text: 'ลบคำขอสำเร็จ',
                    icon: 'success',
                });
                window.location.reload();
            } else {
                console.error('Failed to delete request');
                await Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ลบคำขอไม่สำเร็จ',
                    icon: 'error',
                });
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting request', error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'มีข้อผิดพลาดในการลบคำขอ',
                icon: 'error',
            });
            window.location.reload();
        }
    };

    useEffect(() => {
        getRequest();
    }, []);

    return (
        <div>
            {loading ? (
                <div className="loading-spinner"></div>
            ) : (
                <div className='request-admin-page'>
                    <div className='request-admin-header'>
                        รายการคำขอเป็นแอดมิน
                    </div>
                    <div className="request-admin-container">
                        <div style={{ height: 400, width: '100%', margin: 'auto' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
};

export default AdminReqeust;
