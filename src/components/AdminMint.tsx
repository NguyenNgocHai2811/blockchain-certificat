import React, { useState, useRef, useEffect } from 'react';
import { CertificateStruct } from '../types';
import { signCertificateData, mintCertificate } from '../service/ethereum';

const AdminMint: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    receiver: '',
    tokenId: '',
    studentName: '',
    courseName: '',
    grade: '',
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Vẽ preview chứng chỉ mỗi khi form thay đổi
  useEffect(() => {
    drawCertificate();
  }, [formData]);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    // Background trắng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border ngoài
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Border trong
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, width - 70, height - 70);

    // Header - CHỨNG CHỈ
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CHỨNG CHỈ', width / 2, 100);

    // Sub header
    ctx.font = 'bold 18px Arial';
    ctx.fillText('QNU BLOCKCHAIN CERTIFICATE', width / 2, 135);

    // Chứng nhận
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('Chứng nhận', width / 2, 200);

    // Tên sinh viên
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(formData.studentName || '[ Tên sinh viên ]', width / 2, 260);

    // Đã hoàn thành
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('Đã hoàn thành khóa học', width / 2, 310);

    // Tên khóa học
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(formData.courseName || '[ Tên khóa học ]', width / 2, 360);

    // Xếp loại
    ctx.fillStyle = '#374151';
    ctx.font = '20px Arial';
    ctx.fillText(`Xếp loại: ${formData.grade || '[ Chưa chọn ]'}`, width / 2, 420);

    // Ngày cấp
    const today = new Date().toLocaleDateString('vi-VN');
    ctx.fillText(`Ngày cấp: ${today}`, width / 2, 460);

    // Token ID
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px monospace';
    ctx.fillText(`Token ID: #${formData.tokenId || '?'}`, width / 2, 520);

    // Chữ ký placeholder
    ctx.fillText('Chữ ký: [ Sẽ được tạo khi cấp ]', width / 2, 545);

    // Footer
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Arial';
    ctx.fillText('Xác thực tại: qnu-certificate.vercel.app/verify', width / 2, 575);
  };

  // Tải xuống hình chứng chỉ
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `certificate-${formData.tokenId}-${formData.studentName || 'preview'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tokenIdNum = parseInt(formData.tokenId);

      // 1. Sign Data
      console.log("Signing data...");
      const signature = await signCertificateData(
        tokenIdNum, 
        formData.studentName, 
        formData.courseName
      );

      // 2. Prepare Struct - không lưu hình, chỉ lưu thông tin
      const certData: CertificateStruct = {
        studentName: formData.studentName,
        courseName: formData.courseName,
        grade: formData.grade,
        imageURL: '', // Không lưu hình lên blockchain
        issueDate: 0n,
        signature: signature
      };

      // 3. Send Transaction
      console.log("Sending transaction...");
      await mintCertificate(formData.receiver, tokenIdNum, certData);
      
      alert("Cấp chứng chỉ thành công!");
      setFormData({
        ...formData, 
        tokenId: (tokenIdNum + 1).toString(),
        studentName: '',
        courseName: '',
        grade: '',
        receiver: ''
      });
    } catch (error: any) {
      console.error(error);
      alert("Cấp chứng chỉ thất bại: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form bên trái */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Cấp chứng chỉ mới</h2>
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ ví sinh viên</label>
            <input 
              type="text" 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
              value={formData.receiver}
              onChange={(e) => setFormData({...formData, receiver: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Token ID</label>
            <input 
              type="number" 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
              value={formData.tokenId}
              onChange={(e) => setFormData({...formData, tokenId: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tên sinh viên</label>
            <input 
              type="text" 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              placeholder="Nguyễn Văn A"
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tên khóa học</label>
            <input 
              type="text" 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              placeholder="Công nghệ Blockchain"
              value={formData.courseName}
              onChange={(e) => setFormData({...formData, courseName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Xếp loại</label>
            <select 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
            >
              <option value="">Chọn xếp loại</option>
              <option value="Xuất sắc">Xuất sắc</option>
              <option value="Giỏi">Giỏi</option>
              <option value="Khá">Khá</option>
              <option value="Trung bình">Trung bình</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.studentName || !formData.courseName || !formData.grade}
            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang xử lý (Ký & Cấp)...' : 'Ký & Cấp chứng chỉ'}
          </button>
        </form>
      </div>

      {/* Preview bên phải */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Xem trước chứng chỉ</h3>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!formData.studentName || !formData.courseName}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải xuống
          </button>
        </div>
        <div className="border rounded-lg overflow-hidden bg-gray-100 p-2">
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto rounded shadow-sm"
            style={{ maxWidth: '100%' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Hình ảnh chỉ để xem trước, không lưu lên blockchain
        </p>
      </div>
    </div>
  );
};

export default AdminMint;
