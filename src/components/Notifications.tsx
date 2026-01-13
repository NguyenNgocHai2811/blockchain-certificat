import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { fetchUserNotifications } from '../service/ethereum';

interface NotificationsProps {
    account: string;
    onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ account, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [account]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await fetchUserNotifications(account);
            setNotifications(data);
        } catch (error) {
            console.error('Lỗi tải thông báo:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return new Date(timestamp * 1000).toLocaleDateString('vi-VN');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_certificate':
                return (
                    <div className="p-2 bg-green-100 rounded-full">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'transfer':
                return (
                    <div className="p-2 bg-blue-100 rounded-full">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                );
            case 'revoked':
                return (
                    <div className="p-2 bg-red-100 rounded-full">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose}></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[70vh] overflow-hidden">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Đang tải thông báo...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-gray-500">Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-4 hover:bg-gray-50 transition flex gap-3">
                                    {getIcon(notif.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatTime(notif.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
