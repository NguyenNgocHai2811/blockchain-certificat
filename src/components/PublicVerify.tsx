import React, { useState } from 'react';
import { verifyCertificateOnChain } from '../service/ethereum';
import { CertificateStruct } from '../types';

const PublicVerify: React.FC = () => {
    const [searchId, setSearchId] = useState('');
    const [result, setResult] = useState<{ status: 'idle' | 'loading' | 'valid' | 'invalid', data?: CertificateStruct }>({ status: 'idle' });

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId) return;
        
        setResult({ status: 'loading' });
        
        try {
            const { valid, data } = await verifyCertificateOnChain(Number(searchId));
            if (valid && data) {
                setResult({ status: 'valid', data });
            } else {
                setResult({ status: 'invalid' });
            }
        } catch (error) {
            setResult({ status: 'invalid' });
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Credential Verification</h1>
                <p className="text-gray-600">
                    Verify the authenticity of VNU certificates issued on the Ethereum blockchain.
                </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                <form onSubmit={handleVerify} className="flex gap-4">
                    <input 
                        type="number" 
                        placeholder="Enter Certificate ID" 
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={result.status === 'loading'}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {result.status === 'loading' ? 'Checking...' : 'Verify'}
                    </button>
                </form>
            </div>

            {result.status === 'valid' && result.data && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-2 rounded-full">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-800">Valid Certificate</h3>
                            <p className="text-green-600 text-sm">Issued by VNU Administration</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded border border-green-100 p-6 flex flex-col md:flex-row gap-6">
                        <img src={result.data.imageURL} alt="Cert" className="w-32 h-32 object-cover rounded shadow-sm" />
                        <div className="space-y-2 flex-1">
                            <p><span className="font-semibold text-gray-500 w-24 inline-block">Student:</span> <span className="text-gray-900">{result.data.studentName}</span></p>
                            <p><span className="font-semibold text-gray-500 w-24 inline-block">Course:</span> <span className="text-gray-900">{result.data.courseName}</span></p>
                            <p><span className="font-semibold text-gray-500 w-24 inline-block">Grade:</span> <span className="text-gray-900">{result.data.grade}</span></p>
                            <p><span className="font-semibold text-gray-500 w-24 inline-block">Date:</span> <span className="text-gray-900">{new Date(Number(result.data.issueDate) * 1000).toLocaleDateString()}</span></p>
                        </div>
                    </div>
                </div>
            )}

            {result.status === 'invalid' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 animate-fade-in text-center">
                    <div className="inline-block bg-red-100 p-3 rounded-full mb-3">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-800">Invalid or Revoked Certificate</h3>
                    <p className="text-red-600 mt-2">
                        The certificate ID #{searchId} could not be verified. It may not exist, has been burned, or is not signed by the official authority.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PublicVerify;