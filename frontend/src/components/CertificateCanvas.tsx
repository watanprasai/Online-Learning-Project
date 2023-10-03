import React, { useEffect, useRef } from 'react';

function CertificateCanvas({ courseTitle, studentName }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleDownloadClick = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL(); // รับรูปภาพในรูปแบบ Data URL
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'certificate.png'; // ตั้งชื่อไฟล์ที่จะถูกดาวน์โหลด
      a.click();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = 'lightblue';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = 'navy'; 
        context.lineWidth = 4;

        context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        context.font = 'bold 30px Arial';
        context.fillStyle = 'navy';
        context.fillText('ใบประกาศนี้สำหรับการสำเร็จการเรียน', 100, 80);
        
        context.font = '24px Arial';
        context.fillText('เราขอยินดีที่ประกาศว่า', 100, 150);
        context.fillText(studentName, 100, 190);
        context.font = 'italic 18px Arial';
        context.fillText('ได้เรียนคอร์สนี้เสร็จเรียบร้อยแล้ว', 100, 250);
        context.fillText(`ในคอร์ส ${courseTitle}`, 100, 280);
      }
    }
  }, [courseTitle, studentName]);

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={400} style={{ border: '2px solid navy' }}></canvas>
      <p className='certificate-text'>ขอแสดงความยินดีที่คุณได้สำเร็จการเรียนคอร์สนี้!</p>
      <button onClick={handleDownloadClick} className="download-button">ดาวน์โหลดใบประกาศ</button>
    </div>
  );
}

export default CertificateCanvas;
