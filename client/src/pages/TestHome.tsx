import React from 'react';

const TestHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          FastTransfer 測試頁面
        </h1>
        <p className="text-gray-600 mb-6">
          如果您能看到這個頁面，說明React和Tailwind正常工作。
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
          測試按鈕
        </button>
      </div>
    </div>
  );
};

export default TestHome;
