import React, { useEffect, useState, useRef } from 'react';
import { CertificateData, CertificateStruct } from '../types';
import { fetchAllCertificates, getContract } from '../service/ethereum';

interface UserPortfolioProps {
    account: string;
}

const UserPortfolio: React.FC<UserPortfolioProps> = ({ account }) => {
    const [myCerts, setMyCerts] = useState<CertificateData[]>([]);
    const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const certRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMyCertificates();
    }, [account]);

    const loadMyCertificates = async () => {
        setLoading(true);
        try {
            // Because the basic contract 'getCertificatesByOwner' returns structs without IDs,
            // and we need IDs to be robust, we reuse the event fetching logic from 'fetchAll' 
            // and filter in memory for the demo. In a production app with Indexer (The Graph), this is easier.
            const allCerts = await fetchAllCertificates();
            const contract = await getContract();
            
            // Filter by owner
            const ownedCerts: CertificateData[] = [];
            for (const cert of allCerts) {
                const owner = await contract.ownerOf(cert.tokenId);
                if (owner.toLowerCase() === account.toLowerCase()) {
                    ownedCerts.push(cert);
                }
            }
            setMyCerts(ownedCerts);
        } catch (error) {
            console.error("Error loading portfolio", error);
        } finally {
            setLoading(false);
        }
    };

    // Tải xuống chứng chỉ dưới dạng hình ảnh
    const handleDownload = async () => {
        if (!selectedCert) return;
        
        // Tạo canvas để vẽ chứng chỉ
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 800;
        canvas.height = 600;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Inner border
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

        // Header
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CHỨNG CHỈ', canvas.width / 2, 100);

        ctx.fillStyle = '#1e40af';
        ctx.font = '20px Arial';
        ctx.fillText('QNU BLOCKCHAIN CERTIFICATE', canvas.width / 2, 135);

        // Certificate content
        ctx.fillStyle = '#374151';
        ctx.font = '18px Arial';
        ctx.fillText('Chứng nhận', canvas.width / 2, 200);

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(selectedCert.studentName, canvas.width / 2, 250);

        ctx.fillStyle = '#374151';
        ctx.font = '18px Arial';
        ctx.fillText('Đã hoàn thành khóa học', canvas.width / 2, 300);

        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(selectedCert.courseName, canvas.width / 2, 350);

        ctx.fillStyle = '#374151';
        ctx.font = '18px Arial';
        ctx.fillText(`Xếp loại: ${selectedCert.grade}`, canvas.width / 2, 400);

        // Date
        const date = new Date(Number(selectedCert.issueDate) * 1000).toLocaleDateString('vi-VN');
        ctx.fillText(`Ngày cấp: ${date}`, canvas.width / 2, 450);

        // Token ID & Signature
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px monospace';
        ctx.fillText(`Token ID: #${selectedCert.tokenId}`, canvas.width / 2, 520);
        ctx.fillText(`Chữ ký: ${selectedCert.signature.substring(0, 30)}...`, canvas.width / 2, 540);

        // Footer
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Arial';
        ctx.fillText('Xác thực tại: localhost:5173/verify', canvas.width / 2, 570);

        // Download
        const link = document.createElement('a');
        link.download = `certificate-${selectedCert.tokenId}-${selectedCert.studentName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // Chia sẻ chứng chỉ
    const handleShare = async (platform: 'copy' | 'facebook' | 'twitter' | 'linkedin') => {
        if (!selectedCert) return;

        const verifyUrl = `${window.location.origin}?verify=${selectedCert.tokenId}`;
        const shareText = `🎓 Tôi vừa nhận được chứng chỉ "${selectedCert.courseName}" từ QNU!\n\nXác thực tại: ${verifyUrl}`;

        switch (platform) {
            case 'copy':
                await navigator.clipboard.writeText(verifyUrl);
                alert('Đã sao chép link xác thực!');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`, '_blank');
                break;
        }
        setShowShareMenu(false);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chứng chỉ của tôi</h2>
                <p className="text-gray-500">Ví: {account}</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải hồ sơ học tập của bạn...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCerts.length === 0 ? (
                        <div className="col-span-3 text-center py-12 bg-white rounded shadow text-gray-500">
                            Không tìm thấy chứng chỉ nào cho tài khoản này.
                        </div>
                    ) : (
                        myCerts.map((cert) => (
                            <div 
                                key={cert.tokenId} 
                                onClick={() => setSelectedCert(cert)}
                                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
                            >
                                <div className="h-48 bg-gray-200 overflow-hidden relative">
                                    <img src={cert.imageURL} alt="Chứng chỉ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        #{cert.tokenId}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-800 truncate">{cert.courseName}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{cert.studentName}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Ngày cấp: {new Date(Number(cert.issueDate) * 1000).toLocaleDateString('vi-VN')}</span>
                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{cert.grade}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {selectedCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="h-2 bg-blue-600 w-full"></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">Chi tiết chứng chỉ</h3>
                                <button onClick={() => setSelectedCert(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            
                            <img src={selectedCert.imageURL} alt="Chứng chỉ" className="w-full h-56 object-cover rounded-md mb-4 border border-gray-200" />
                            
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Tên sinh viên</span>
                                    <span className="font-semibold">{selectedCert.studentName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Khóa học</span>
                                    <span className="font-semibold">{selectedCert.courseName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Xếp loại</span>
                                    <span className="font-semibold text-blue-600">{selectedCert.grade}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Ngày cấp</span>
                                    <span className="font-semibold">{new Date(Number(selectedCert.issueDate) * 1000).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500">Chữ ký</span>
                                    <span className="text-xs font-mono text-gray-400 truncate w-32" title={selectedCert.signature}>{selectedCert.signature}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <button 
                                    onClick={handleDownload}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Tải xuống
                                </button>
                                <div className="relative flex-1">
                                    <button 
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Chia sẻ
                                    </button>
                                    
                                    {/* Share dropdown menu */}
                                    {showShareMenu && (
                                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border overflow-hidden z-10">
                                            <button 
                                                onClick={() => handleShare('copy')}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                Sao chép link
                                            </button>
                                            <button 
                                                onClick={() => handleShare('facebook')}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                                Facebook
                                            </button>
                                            <button 
                                                onClick={() => handleShare('twitter')}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                </svg>
                                                Twitter / X
                                            </button>
                                            <button 
                                                onClick={() => handleShare('linkedin')}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                                            >
                                                <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                </svg>
                                                LinkedIn
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPortfolio;