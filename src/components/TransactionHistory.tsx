import React, { useEffect, useState } from 'react';
import { TransactionHistory as TxHistory } from '../types';
import { fetchTransactionHistory } from '../service/ethereum';

const TransactionHistory: React.FC = () => {
    const [history, setHistory] = useState<TxHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'mint' | 'burn' | 'transfer'>('all');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await fetchTransactionHistory();
            setHistory(data);
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = filter === 'all' 
        ? history 
        : history.filter(tx => tx.type === filter);

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'mint': return { text: 'Cấp mới', color: 'bg-green-100 text-green-800' };
            case 'burn': return { text: 'Thu hồi', color: 'bg-red-100 text-red-800' };
            case 'transfer': return { text: 'Chuyển nhượng', color: 'bg-blue-100 text-blue-800' };
            default: return { text: type, color: 'bg-gray-100 text-gray-800' };
        }
    };

    const formatAddress = (addr: string) => {
        if (addr === '0x0000000000000000000000000000000000000000') return 'Hệ thống';
        return `${addr.substring(0, 6)}...${addr.substring(38)}`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString('vi-VN');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Lịch sử giao dịch</h2>
                <div className="flex gap-2">
                    {(['all', 'mint', 'burn', 'transfer'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                filter === f 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f === 'all' ? 'Tất cả' : getTypeLabel(f).text}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Đang tải lịch sử từ blockchain...
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Không có giao dịch nào.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredHistory.map((tx, index) => {
                            const typeInfo = getTypeLabel(tx.type);
                            return (
                                <div key={`${tx.txHash}-${index}`} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-full ${
                                                tx.type === 'mint' ? 'bg-green-100' : 
                                                tx.type === 'burn' ? 'bg-red-100' : 'bg-blue-100'
                                            }`}>
                                                {tx.type === 'mint' && (
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                )}
                                                {tx.type === 'burn' && (
                                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                                {tx.type === 'transfer' && (
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                                        {typeInfo.text}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">Token #{tx.tokenId}</span>
                                                </div>
                                                {tx.studentName && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {tx.studentName} - {tx.courseName}
                                                    </p>
                                                )}
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {tx.type === 'mint' && `Cấp cho: ${formatAddress(tx.to)}`}
                                                    {tx.type === 'burn' && `Thu hồi từ: ${formatAddress(tx.from)}`}
                                                    {tx.type === 'transfer' && `${formatAddress(tx.from)} → ${formatAddress(tx.to)}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                                            <a 
                                                href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Xem trên Etherscan
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
