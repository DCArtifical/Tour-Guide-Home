import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    
    try {
      const result = await signIn(email, password);
      
      if (result?.error) {
        // Handle specific Supabase error codes
        switch (result.error?.message) {
          case 'Invalid login credentials':
            setError('邮箱或密码不正确。请检查后重试。');
            break;
          case 'Email not confirmed':
            setError('请先验证您的邮箱地址。');
            break;
          default:
            setError('登录失败，请稍后重试。如果问题持续存在，请联系客服。');
        }
        return;
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError('登录时发生错误，请稍后重试。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="relative">
          <button 
            className="absolute left-0 top-0 hover:text-green-600 transition-colors"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-center text-2xl font-bold">登录</h2>
        </div>
        
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold mb-2">导游之家</h1>
          <p className="text-gray-600">欢迎你</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
              <span className="flex-1">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;