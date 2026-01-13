import React, { useState, useEffect } from 'react';
import { connectWallet, getContractOwner } from './service/ethereum';
import { ViewState } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserPortfolio from './components/UserPortfolio';
import PublicVerify from './components/PublicVerify';

const App: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'mint' | 'manage'>('dashboard');

  const handleLogin = async () => {
    try {
      const account = await connectWallet();
      setCurrentAccount(account);
      
      const owner = await getContractOwner();
      const isUserAdmin = account.toLowerCase() === owner.toLowerCase();
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        setView(ViewState.ADMIN_DASHBOARD);
      } else {
        setView(ViewState.USER_PORTFOLIO);
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Failed to connect wallet. Please ensure MetaMask is installed.");
    }
  };

  const handleLogout = () => {
    setCurrentAccount('');
    setIsAdmin(false);
    setView(ViewState.LANDING);
  };

  const renderNav = () => (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setView(currentAccount ? (isAdmin ? ViewState.ADMIN_DASHBOARD : ViewState.USER_PORTFOLIO) : ViewState.LANDING)}>
            <div className="bg-white p-1 rounded-full mr-2">
                <svg className="w-6 h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
            </div>
            <span className="font-bold text-xl tracking-tight">VNU Certify</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => setView(ViewState.PUBLIC_VERIFY)} className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${view === ViewState.PUBLIC_VERIFY ? 'bg-blue-800' : ''}`}>
               Verify
            </button>
            
            {currentAccount ? (
              <div className="flex items-center gap-4">
                 {isAdmin ? (
                   <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">Admin</span>
                 ) : (
                    <span className="text-sm font-light opacity-80" onClick={() => setView(ViewState.USER_PORTFOLIO)}>My Portfolio</span>
                 )}
                 <div className="flex flex-col items-end">
                     <span className="text-sm font-medium">{currentAccount.substring(0, 6)}...{currentAccount.substring(38)}</span>
                 </div>
                 <button onClick={handleLogout} className="text-red-300 hover:text-white text-sm">Logout</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Admin Subnav */}
      {isAdmin && currentAccount && view.toString().startsWith('ADMIN') && (
          <div className="bg-blue-800 shadow-inner">
              <div className="max-w-7xl mx-auto px-4 flex gap-6 text-sm">
                  <button onClick={() => { setView(ViewState.ADMIN_DASHBOARD); setAdminTab('dashboard'); }} className={`py-3 border-b-2 ${adminTab === 'dashboard' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Dashboard</button>
                  <button onClick={() => { setView(ViewState.ADMIN_MINT); setAdminTab('mint'); }} className={`py-3 border-b-2 ${adminTab === 'mint' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Issue Certificate</button>
                  <button onClick={() => { setView(ViewState.ADMIN_MANAGE); setAdminTab('manage'); }} className={`py-3 border-b-2 ${adminTab === 'manage' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Manage All</button>
              </div>
          </div>
      )}
    </nav>
  );

  const renderContent = () => {
    if (view === ViewState.PUBLIC_VERIFY) {
        return <PublicVerify />;
    }

    if (!currentAccount) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="mb-8 p-6 bg-blue-50 rounded-full">
                    <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">VNU Blockchain Certificates</h1>
                <p className="text-xl text-gray-600 max-w-2xl mb-8">
                    Secure, transparent, and verifiable academic credentials powered by Ethereum.
                    Students can claim their degrees, and employers can instantly verify them.
                </p>
                <div className="flex gap-4">
                    <button onClick={handleLogin} className="bg-blue-600 text-white text-lg font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
                        Connect Wallet
                    </button>
                    <button onClick={() => setView(ViewState.PUBLIC_VERIFY)} className="bg-white text-blue-600 border border-blue-600 text-lg font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
                        Verify ID
                    </button>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return <AdminDashboard activeTab={adminTab} onChangeTab={(tab) => { setAdminTab(tab); setView(tab === 'mint' ? ViewState.ADMIN_MINT : (tab === 'manage' ? ViewState.ADMIN_MANAGE : ViewState.ADMIN_DASHBOARD));}} />;
    }

    return <UserPortfolio account={currentAccount} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {renderNav()}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <footer className="bg-white border-t mt-auto py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} VNU Certificate DApp. Deployed on Ethereum.
          </div>
      </footer>
    </div>
  );
};

export default App;