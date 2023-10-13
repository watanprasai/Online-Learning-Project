import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { Type } from '../interfaces/ICourse';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconButton from "@mui/material/IconButton";
import Swal from 'sweetalert2';
import './css/typedetail.css'

function TypeDetail() {
  const [typeName, setTypeName] = useState('');
  const [types, setTypes] = useState<Type[]>([]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'ชื่อประเภท', flex: 1 },
    { field: '_id', headerName: '', width: 70, sortable: false, filterable: false,
    renderCell: (params) => (
        <IconButton>
            <DeleteIcon style={{ color: '#FF1E1E' }} onClick={() => handleDelete(params.row.id)}/>
        </IconButton>
    ),
  },
  ];

  const addType = async () => {
    if (!typeName) {
        Swal.fire({
          icon: 'warning',
          title: 'กรุณากรอกชื่อประเภท',
        });
        return;
    }

    try {
      const response = await fetch('http://localhost:8080/types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: typeName }),
      });
  
      if (response.status === 201) {
        setTypeName('');
        getTypes();
        await Swal.fire({
          icon: 'success',
          title: 'เพิ่มประเภทสำเร็จ',
        });
        window.location.reload();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดขณะเพิ่มประเภท',
          text: 'กรุณาลองอีกครั้งในภายหลัง',
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding type', error);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดขณะเพิ่มประเภท',
        text: 'กรุณาลองอีกครั้งในภายหลัง',
      });
      window.location.reload();
    }
  };

  const getTypes = async () => {
    try {
      const response = await fetch('http://localhost:8080/types');
      if (response.status === 200) {
        const data = await response.json();
        setTypes(data);
      } else {
        console.error('Failed to retrieve types');
      }
    } catch (error) {
      console.error('Error retrieving types', error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmResult = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'คุณแน่ใจหรือไม่ที่ต้องการลบประเภทนี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    });
  
    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8080/types/${id}`, {
          method: 'DELETE',
        });
  
        if (response.status === 200) {
          getTypes();
          await Swal.fire({
            icon: 'success',
            title: 'ลบประเภทสำเร็จ',
          });
          window.location.reload();
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดขณะลบประเภท',
            text: 'กรุณาลองอีกครั้งในภายหลัง',
          });
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting type', error);
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดขณะลบประเภท',
          text: 'กรุณาลองอีกครั้งในภายหลัง',
        });
        window.location.reload();
      }
    }
  };
  

  const rows = types.map((type) => ({
    id: type._id,
    name: type.name,
  }));  

  useEffect(() => {
    getTypes();
  }, []);

  return (
    <div className='type-detail-page'>
      <div className='type-detail-header'>
            ประเภท
      </div>
      <div className="type-detail-container">
        <div className='type-detail-left'>
          <Typography variant="h6">เพิ่มประเภท</Typography>
          <TextField
            label="ชื่อประเภท"
            variant="outlined"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={addType}
            className='type-detail-add-button'
          >
            เพิ่มประเภท
          </Button>
        </div>
        <div className='type-detail-right'>
          <Typography variant="h6">ประเภททั้งหมด</Typography>
          <div style={{ height: 380, width: '100%' }}>
            <DataGrid 
              rows={rows} 
              columns={columns} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypeDetail;
