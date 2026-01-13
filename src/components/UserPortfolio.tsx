import React, { useEffect, useState } from 'react';
import { CertificateData, CertificateStruct } from '../types';
import { fetchAllCertificates, getContract } from '../service/ethereum';

interface UserPortfolioProps {
    account: string;
}

const UserPortfolio: React.FC<UserPortfolioProps> = ({ account }) => {
    const [myCerts, setMyCerts] = useState<CertificateData[]>([]);
    const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(false);

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
            const ownedCerts = [];
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

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Portfolio</h2>
                <p className="text-gray-500">Wallet: {account}</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading your academic records...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCerts.length === 0 ? (
                        <div className="col-span-3 text-center py-12 bg-white rounded shadow text-gray-500">
                            No certificates found for this account.
                        </div>
                    ) : (
                        myCerts.map((cert) => (
                            <div 
                                key={cert.tokenId} 
                                onClick={() => setSelectedCert(cert)}
                                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
                            >
                                <div className="h-48 bg-gray-200 overflow-hidden relative">
                                    <img src={cert.imageURL} alt="Certificate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        #{cert.tokenId}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-800 truncate">{cert.courseName}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{cert.studentName}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Issued: {new Date(Number(cert.issueDate) * 1000).toLocaleDateString()}</span>
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
                                <h3 className="text-2xl font-bold text-gray-900">Certificate Details</h3>
                                <button onClick={() => setSelectedCert(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            
                            <img src={selectedCert.imageURL} alt="Certificate" className="w-full h-56 object-cover rounded-md mb-4 border border-gray-200" />
                            
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Student Name</span>
                                    <span className="font-semibold">{selectedCert.studentName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Course</span>
                                    <span className="font-semibold">{selectedCert.courseName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Grade</span>
                                    <span className="font-semibold text-blue-600">{selectedCert.grade}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Issue Date</span>
                                    <span className="font-semibold">{new Date(Number(selectedCert.issueDate) * 1000).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500">Signature</span>
                                    <span className="text-xs font-mono text-gray-400 truncate w-32" title={selectedCert.signature}>{selectedCert.signature}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition">
                                    Download
                                </button>
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPortfolio;