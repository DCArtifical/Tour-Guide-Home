import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, FileText, Award, MessageSquare, Car as IdCard, Book, Shield, LogOut, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, deleteAccount } = useAuth();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('确定要删除账号吗？此操作不可撤销。')) {
      const { error } = await deleteAccount();
      if (error) {
        setDeleteError('删除账号失败，请稍后重试');
        console.error('Error deleting account:', error);
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-4 px-4 text-center">
        <h1 className="text-xl font-bold">个人中心</h1>
      </header>

      <div className="bg-green-500 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-700 rounded-full"></div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{user?.displayName || '用户'}</h2>
            <p className="text-sm">导游等级：初级</p>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {deleteError}
        </div>
      )}

      <div className="bg-black rounded-lg mx-4 my-4 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <User className="h-6 w-6 mr-2" />
            <span>- (当前等级)</span>
          </div>
          <button className="text-yellow-500">查看导游信息 &gt;</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-500" />
          </div>
          <span className="text-sm mt-2">基本资料</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-500" />
          </div>
          <span className="text-sm mt-2">执业记录</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Award className="h-6 w-6 text-green-500" />
          </div>
          <span className="text-sm mt-2">奖惩记录</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-green-500" />
          </div>
          <span className="text-sm mt-2">游客评价</span>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <button
          onClick={() => navigate('/license-upload')}
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg"
        >
          <div className="flex items-center">
            <IdCard className="h-6 w-6 text-green-500 mr-3" />
            <span>电子证照</span>
          </div>
          <span>&gt;</span>
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg">
          <div className="flex items-center">
            <Book className="h-6 w-6 text-green-500 mr-3" />
            <span>知识库</span>
          </div>
          <span>&gt;</span>
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-green-500 mr-3" />
            <span>隐私政策</span>
          </div>
          <span>&gt;</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg"
        >
          <div className="flex items-center">
            <LogOut className="h-6 w-6 text-green-500 mr-3" />
            <span>退出登录</span>
          </div>
          <span>&gt;</span>
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center">
            <Trash2 className="h-6 w-6 mr-3" />
            <span>删除账号</span>
          </div>
          <span>&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;