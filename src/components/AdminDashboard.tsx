import React, { useEffect, useState } from 'react';
import { CertificateData } from '../types';
import { fetchAllCertificates, burnCertificate } from '../service/ethereum';
import AdminMint from './AdminMint';

interface AdminDashboardProps {
    activeTab: 'dashboard' | 'mint' | 'manage';
    onChangeTab: (tab: 'dashboard' | 'mint' | 'manage') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onChangeTab }) => {
    const [certificates, setCertificates] = useState<CertificateData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'manage' || activeTab === 'dashboard') {
            loadData();
        }
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchAllCertificates();
            setCertificates(data);
        } catch (error) {
            console.error("Failed to load certificates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: number) => {
        if(!confirm(`Are you sure you want to revoke Token ID ${id}? This action cannot be undone.`)) return;
        try {
            await burnCertificate(id);
            alert("Revoked successfully");
            loadData();
        } catch (error) {
            console.error(error);
            alert("Revocation failed");
        }
    };

    const renderStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-medium">Total Issued</h3>
                <p className="text-3xl font-bold text-gray-800">{certificates.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-medium">Issued Today</h3>
                <p className="text-3xl font-bold text-gray-800">
                    {certificates.filter(c => {
                        const date = new Date(Number(c.issueDate) * 1000);
                        const today = new Date();
                        return date.toDateString() === today.toDateString();
                    }).length}
                </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500 cursor-pointer hover:bg-gray-50 transition" onClick={() => onChangeTab('mint')}>
                <h3 className="text-gray-500 text-sm font-medium">Quick Action</h3>
                <p className="text-xl font-bold text-blue-600 mt-1">+ Issue New</p>
            </div>
        </div>
    );

    const renderManageTable = () => (
        <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Issued Certificates Registry</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {certificates.map((cert) => (
                            <tr key={cert.tokenId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{cert.tokenId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.studentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.courseName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(Number(cert.issueDate) * 1000).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleRevoke(cert.tokenId)}
                                        className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded-full"
                                    >
                                        Revoke
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {certificates.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No certificates found.</td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading blockchain data...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {activeTab === 'dashboard' && (
                <>
                    {renderStats()}
                    {renderManageTable()}
                </>
            )}
            {activeTab === 'manage' && renderManageTable()}
            {activeTab === 'mint' && <AdminMint />}
        </div>
    );
};

export default AdminDashboard;