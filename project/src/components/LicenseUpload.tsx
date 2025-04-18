import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const LicenseUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLicenseImage();
    
    const handleScroll = () => {
      if (!contentRef.current || image) return; // Don't handle scroll if there's an image
      
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowUpload(isNearBottom);
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      // Trigger initial scroll check
      handleScroll();
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [image]); // Add image to dependency array to update scroll behavior when image changes

  const fetchLicenseImage = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('licenses')
      .select('image_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching license:', error);
      setError('获取证照失败，请重试');
      return;
    }

    if (data?.image_url) {
      setImage(data.image_url);
      setShowUpload(false); // Hide upload button when image is loaded
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading(true);
    setError(null);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('请上传图片文件');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('图片大小不能超过5MB');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExtensions = ['jpg', 'jpeg', 'png'];
      
      if (!allowedExtensions.includes(fileExt)) {
        throw new Error('请上传JPG或PNG格式的图片');
      }

      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('license-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from('license-images')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      if (!data?.signedUrl) {
        throw new Error('获取图片链接失败');
      }

      const { error: dbError } = await supabase
        .from('licenses')
        .upsert({
          user_id: user?.id,
          image_url: data.signedUrl
        });

      if (dbError) throw dbError;

      setImage(data.signedUrl);
      setShowUpload(false); // Hide upload button after successful upload
      
      // Reset scroll position after successful upload
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed header */}
      <header className="bg-white p-4 flex items-center fixed top-0 left-0 right-0 z-50 shadow-sm">
        <button onClick={() => navigate('/dashboard')} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">导游证</h1>
      </header>

      {/* Scrollable content area */}
      <div 
        ref={contentRef}
        className="flex-1 mt-16 overflow-y-auto relative"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {error && (
          <div className="sticky top-0 left-0 right-0 px-4 z-10">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        <div className="min-h-full bg-white">
          {image ? (
            <div className="w-full min-h-full">
              <img 
                src={image} 
                alt="导游证" 
                className="w-full h-auto"
                onError={() => {
                  setError('图片加载失败，请重新上传');
                  setImage(null); // Reset image state to show upload option
                }}
              />
            </div>
          ) : (
            <div className="min-h-[150vh] flex flex-col">
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500">暂无证照，请上传</p>
                  <p className="text-gray-400 text-sm mt-2">向下滑动显示上传按钮</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload button that appears when scrolled to bottom and no image exists */}
      {!image && (
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 transition-transform duration-300 ${
            showUpload ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <label className="block w-full">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="w-full py-3 px-4 bg-green-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md">
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? '上传中...' : '上传证照'}
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default LicenseUpload;