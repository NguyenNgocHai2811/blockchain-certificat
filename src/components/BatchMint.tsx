import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { BatchMintItem } from '../types';
import { batchMintCertificates } from '../service/ethereum';

const BatchMint: React.FC = () => {
    const [items, setItems] = useState<BatchMintItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const parsedItems: BatchMintItem[] = jsonData.map((row: any, index: number) => ({
                    receiver: row['Địa chỉ ví'] || row['receiver'] || row['wallet'] || '',
                    tokenId: parseInt(row['Token ID'] || row['tokenId'] || row['id'] || (index + 1)),
                    studentName: row['Tên sinh viên'] || row['studentName'] || row['name'] || '',
                    courseName: row['Khóa học'] || row['courseName'] || row['course'] || '',
                    grade: row['Xếp loại'] || row['grade'] || '',
                    imageURL: '', // Không cần hình ảnh nữa
                    status: 'pending' as const
                }));

                setItems(parsedItems);
            } catch (error) {
                alert('Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file.');
                console.error(error);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleStartBatch = async () => {
        if (items.length === 0) return;
        
        setIsProcessing(true);
        setProgress({ current: 0, total: items.length });

        await batchMintCertificates(
            items.map(item => ({
                receiver: item.receiver,
                tokenId: item.tokenId,
                studentName: item.studentName,
                courseName: item.courseName,
                grade: item.grade,
                imageURL: item.imageURL
            })),
            (index, status, error) => {
                setItems(prev => prev.map((item, i) => 
                    i === index ? { ...item, status, error } : item
                ));
                setProgress(prev => ({ ...prev, current: index + 1 }));
            }
        );

        setIsProcessing(false);
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleClear = () => {
        setItems([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Địa chỉ ví': '0x1234...abcd',
                'Token ID': 1,
                'Tên sinh viên': 'Nguyễn Văn A',
                'Khóa học': 'Công nghệ thông tin',
                'Xếp loại': 'Xuất sắc'
            },
            {
                'Địa chỉ ví': '0x5678...efgh',
                'Token ID': 2,
                'Tên sinh viên': 'Trần Thị B',
                'Khóa học': 'Kinh tế',
                'Xếp loại': 'Giỏi'
            }
        ];
        
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'template_batch_mint.xlsx');
    };

    const successCount = items.filter(i => i.status === 'success').length;
    const errorCount = items.filter(i => i.status === 'error').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Cấp chứng chỉ hàng loạt</h2>
                <button
                    onClick={downloadTemplate}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải file mẫu Excel
                </button>
            </div>

            {/* Upload area */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="excel-upload"
                    />
                    <label htmlFor="excel-upload" className="cursor-pointer">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 mb-2">Kéo thả file Excel hoặc click để chọn</p>
                        <p className="text-sm text-gray-400">Hỗ trợ .xlsx, .xls</p>
                    </label>
                </div>
            </div>

            {/* Preview table */}
            {items.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-gray-800">Danh sách cấp ({items.length} chứng chỉ)</h3>
                            {isProcessing && (
                                <p className="text-sm text-gray-500">
                                    Đang xử lý: {progress.current}/{progress.total}
                                </p>
                            )}
                            {!isProcessing && successCount > 0 && (
                                <p className="text-sm text-green-600">
                                    Thành công: {successCount} | Lỗi: {errorCount}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleClear}
                                disabled={isProcessing}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                            >
                                Xóa tất cả
                            </button>
                            <button
                                onClick={handleStartBatch}
                                disabled={isProcessing || items.every(i => i.status === 'success')}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Bắt đầu cấp'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinh viên</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xếp loại</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ví nhận</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={index} className={item.status === 'error' ? 'bg-red-50' : ''}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.status === 'pending' && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Chờ</span>
                                            )}
                                            {item.status === 'processing' && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                    Đang xử lý
                                                </span>
                                            )}
                                            {item.status === 'success' && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">✓ Thành công</span>
                                            )}
                                            {item.status === 'error' && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800" title={item.error}>✗ Lỗi</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">#{item.tokenId}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{item.studentName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{item.courseName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{item.grade}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {item.receiver.substring(0, 8)}...{item.receiver.substring(item.receiver.length - 6)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn sử dụng</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>1. Tải file mẫu Excel và điền thông tin sinh viên</li>
                    <li>2. Upload file Excel đã điền</li>
                    <li>3. Kiểm tra danh sách và nhấn "Bắt đầu cấp"</li>
                    <li>4. Mỗi chứng chỉ sẽ yêu cầu ký MetaMask riêng</li>
                </ul>
            </div>
        </div>
    );
};

export default BatchMint;
