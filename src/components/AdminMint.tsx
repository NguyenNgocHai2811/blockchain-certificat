import React, { useState } from 'react';
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
    imageURL: 'https://picsum.photos/400/300', // Default placeholder
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tokenIdNum = parseInt(formData.tokenId);
      
      // 1. Upload to IPFS (Simulated here)
      // In production: const ipfsUrl = await pinataUpload(file);
      const finalImageURL = formData.imageURL; 

      // 2. Sign Data
      console.log("Signing data...");
      const signature = await signCertificateData(
        tokenIdNum, 
        formData.studentName, 
        formData.courseName
      );

      // 3. Prepare Struct
      const certData: CertificateStruct = {
        studentName: formData.studentName,
        courseName: formData.courseName,
        grade: formData.grade,
        imageURL: finalImageURL,
        issueDate: 0n, // Contract will set to block.timestamp
        signature: signature
      };

      // 4. Send Transaction
      console.log("Sending transaction...");
      await mintCertificate(formData.receiver, tokenIdNum, certData);
      
      alert("Cấp chứng chỉ thành công!");
      setFormData({...formData, tokenId: (tokenIdNum + 1).toString()});
    } catch (error: any) {
      console.error(error);
      alert("Cấp chứng chỉ thất bại: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Cấp chứng chỉ mới</h2>
      <form onSubmit={handleMint} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tên sinh viên</label>
                <input 
                    type="text" 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
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
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Xếp loại</label>
            <select 
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

        <div>
            <label className="block text-sm font-medium text-gray-700">URL hình ảnh chứng chỉ (IPFS)</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-500"
                    value={formData.imageURL}
                    readOnly
                />
                <button type="button" className="mt-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                    Tải lên (Mô phỏng)
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Sử dụng Picsum placeholder cho demo.</p>
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? 'Đang xử lý (Ký & Cấp)...' : 'Ký & Cấp chứng chỉ'}
        </button>
      </form>
    </div>
  );
};

export default AdminMint;