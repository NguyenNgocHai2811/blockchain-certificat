import React, { useState, useEffect } from 'react';
import { connectWallet, getContractOwner } from './service/ethereum';
import { ViewState } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserPortfolio from './components/UserPortfolio';
import PublicVerify from './components/PublicVerify';
import Notifications from './components/Notifications';

const App: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'mint' | 'manage' | 'batch' | 'history'>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

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
      console.error("Đăng nhập thất bại", error);
      alert("Không thể kết nối ví. Vui lòng đảm bảo MetaMask đã được cài đặt.");
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
            <span className="font-bold text-xl tracking-tight">Chứng Chỉ QNU</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => setView(ViewState.PUBLIC_VERIFY)} className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${view === ViewState.PUBLIC_VERIFY ? 'bg-blue-800' : ''}`}>
               Xác Thực
            </button>
            
            {currentAccount ? (
              <div className="flex items-center gap-4">
                 {isAdmin ? (
                   <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">Quản trị</span>
                 ) : (
                    <>
                      <button 
                        onClick={() => setShowNotifications(true)}
                        className="relative p-2 hover:bg-blue-800 rounded-full transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </button>
                      <span className="text-sm font-light opacity-80 cursor-pointer" onClick={() => setView(ViewState.USER_PORTFOLIO)}>Chứng chỉ của tôi</span>
                    </>
                 )}
                 <div className="flex flex-col items-end">
                     <span className="text-sm font-medium">{currentAccount.substring(0, 6)}...{currentAccount.substring(38)}</span>
                 </div>
                 <button onClick={handleLogout} className="text-red-300 hover:text-white text-sm">Đăng xuất</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition">
                Kết nối ví
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Admin Subnav */}
      {isAdmin && currentAccount && view.toString().startsWith('ADMIN') && (
          <div className="bg-blue-800 shadow-inner">
              <div className="max-w-7xl mx-auto px-4 flex gap-6 text-sm">
                  <button onClick={() => { setView(ViewState.ADMIN_DASHBOARD); setAdminTab('dashboard'); }} className={`py-3 border-b-2 ${adminTab === 'dashboard' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Tổng quan</button>
                  <button onClick={() => { setView(ViewState.ADMIN_MINT); setAdminTab('mint'); }} className={`py-3 border-b-2 ${adminTab === 'mint' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Cấp chứng chỉ</button>
                  <button onClick={() => { setView(ViewState.ADMIN_BATCH); setAdminTab('batch'); }} className={`py-3 border-b-2 ${adminTab === 'batch' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Cấp hàng loạt</button>
                  <button onClick={() => { setView(ViewState.ADMIN_MANAGE); setAdminTab('manage'); }} className={`py-3 border-b-2 ${adminTab === 'manage' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Quản lý</button>
                  <button onClick={() => { setView(ViewState.ADMIN_HISTORY); setAdminTab('history'); }} className={`py-3 border-b-2 ${adminTab === 'history' ? 'border-white font-bold' : 'border-transparent text-blue-200 hover:text-white'}`}>Lịch sử</button>
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
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Chứng Chỉ Blockchain QNU</h1>
                <p className="text-xl text-gray-600 max-w-2xl mb-8">
                    Bằng cấp học thuật an toàn, minh bạch và có thể xác thực trên nền tảng Ethereum.
                    Sinh viên có thể nhận bằng và nhà tuyển dụng có thể xác minh ngay lập tức.
                </p>
                <div className="flex gap-4">
                    <button onClick={handleLogin} className="bg-blue-600 text-white text-lg font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
                        Kết nối ví
                    </button>
                    <button onClick={() => setView(ViewState.PUBLIC_VERIFY)} className="bg-white text-blue-600 border border-blue-600 text-lg font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
                        Xác thực chứng chỉ
                    </button>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return <AdminDashboard activeTab={adminTab} onChangeTab={(tab) => { 
            setAdminTab(tab); 
            if (tab === 'mint') setView(ViewState.ADMIN_MINT);
            else if (tab === 'manage') setView(ViewState.ADMIN_MANAGE);
            else if (tab === 'batch') setView(ViewState.ADMIN_BATCH);
            else if (tab === 'history') setView(ViewState.ADMIN_HISTORY);
            else setView(ViewState.ADMIN_DASHBOARD);
        }} />;
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
              &copy; {new Date().getFullYear()} Ứng dụng Chứng chỉ QNU. Triển khai trên Ethereum.
          </div>
      </footer>
      
      {/* Notifications Modal */}
      {showNotifications && currentAccount && !isAdmin && (
        <Notifications account={currentAccount} onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
};

export default App;