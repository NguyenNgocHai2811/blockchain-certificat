import React from 'react';
import { CertificateData } from '../types';

interface CertificateCardProps {
    cert: CertificateData;
    size?: 'small' | 'medium' | 'large';
}

const CertificateCard: React.FC<CertificateCardProps> = ({ cert, size = 'medium' }) => {
    const sizeClasses = {
        small: 'p-3',
        medium: 'p-4',
        large: 'p-6'
    };

    const fontSizes = {
        small: { title: 'text-xs', name: 'text-sm', course: 'text-xs', info: 'text-[10px]' },
        medium: { title: 'text-sm', name: 'text-lg', course: 'text-sm', info: 'text-xs' },
        large: { title: 'text-lg', name: 'text-2xl', course: 'text-lg', info: 'text-sm' }
    };

    const fonts = fontSizes[size];

    return (
        <div className={`bg-white border-4 border-blue-800 rounded-lg ${sizeClasses[size]} relative overflow-hidden`}>
            {/* Inner border */}
            <div className="absolute inset-2 border-2 border-blue-400 rounded pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative text-center space-y-2">
                {/* Header */}
                <div className="text-blue-800">
                    <h3 className={`font-bold ${fonts.title}`}>CHỨNG CHỈ</h3>
                    <p className={`${fonts.info} text-blue-600`}>QNU BLOCKCHAIN CERTIFICATE</p>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center gap-2">
                    <div className="h-px bg-blue-300 w-12"></div>
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                    </svg>
                    <div className="h-px bg-blue-300 w-12"></div>
                </div>

                {/* Student name */}
                <div>
                    <p className={`text-gray-500 ${fonts.info}`}>Chứng nhận</p>
                    <h2 className={`font-bold text-gray-900 ${fonts.name}`}>{cert.studentName}</h2>
                </div>

                {/* Course */}
                <div>
                    <p className={`text-gray-500 ${fonts.info}`}>Đã hoàn thành khóa học</p>
                    <h3 className={`font-semibold text-blue-700 ${fonts.course}`}>{cert.courseName}</h3>
                </div>

                {/* Grade & Date */}
                <div className="flex justify-center gap-4 text-gray-600">
                    <span className={fonts.info}>Xếp loại: <strong className="text-blue-600">{cert.grade}</strong></span>
                    <span className={fonts.info}>Ngày: {new Date(Number(cert.issueDate) * 1000).toLocaleDateString('vi-VN')}</span>
                </div>

                {/* Token ID badge */}
                <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    #{cert.tokenId}
                </div>

                {/* Verified badge */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span className={fonts.info}>Đã xác thực</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateCard;
