import React from 'react';
import './css/GreetingCard.css'; // นำเข้าไฟล์ CSS

interface GreetingCardProps {
  recipientName: string;
  awardingOrganization: string;
  awardDate: string;
  message: string;
}

const GreetingCard: React.FC<GreetingCardProps> = ({
  recipientName,
  awardingOrganization,
  awardDate,
  message,
}) => {
  return (
    <div className="container">
      <h1>เกียรติบัตรของคุณ</h1>
      <img
        className="certificate-image"
        src="/path/to/certificate-image.jpg"
        alt="เกียรติบัตร"
      />
      <p>วันที่: {awardDate}</p>
      <p>ผู้รับเกียรติบัตร: {recipientName}</p>
      <p>มอบโดย: {awardingOrganization}</p>
      <p>ข้อความ: {message}</p>
      <p className="canvas-container">
        ลายเซ็น:
        <canvas id="signatureCanvas" width={400} height={200}></canvas>
      </p>
      <p>ติดต่อ: your@email.com</p>
      <p>
        โลโก้หรือตราสัญลักษณ์:
        <img className="logo-image" src="/path/to/logo.png" alt="โลโก้" />
      </p>
    </div>
  );
};

export default GreetingCard;
