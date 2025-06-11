import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Smartphone } from 'lucide-react';

interface QRCodeGeneratorProps {
  roomUrl: string;
  roomId: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ roomUrl, roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [roomUrl]);

  const generateQRCode = async () => {
    if (!canvasRef.current || !roomUrl) return;

    try {
      // 生成 QR Code 到 canvas
      await QRCode.toCanvas(canvasRef.current, roomUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937', // 深灰色
          light: '#ffffff' // 白色背景
        },
        errorCorrectionLevel: 'M'
      });

      // 同時生成 Data URL 用於下載
      const dataUrl = await QRCode.toDataURL(roomUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('生成 QR Code 失敗:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `FastTransfer-Room-${roomId}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const shareQRCode = async () => {
    if (navigator.share && qrCodeDataUrl) {
      try {
        // 將 Data URL 轉換為 Blob
        const response = await fetch(qrCodeDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `FastTransfer-Room-${roomId}.png`, {
          type: 'image/png'
        });

        await navigator.share({
          title: `FastTransfer 房間 ${roomId}`,
          text: `掃描 QR Code 加入 FastTransfer 房間：${roomId}`,
          files: [file]
        });
      } catch (error) {
        console.error('分享失敗:', error);
        // 回退到複製連結
        navigator.clipboard.writeText(roomUrl);
      }
    } else {
      // 回退到複製連結
      await navigator.clipboard.writeText(roomUrl);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <Smartphone className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">掃描 QR Code</h3>
      </div>
      
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded"
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        使用手機掃描上方 QR Code 即可快速加入房間
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={downloadQRCode}
          className="btn-secondary text-sm flex items-center justify-center"
          disabled={!qrCodeDataUrl}
        >
          <Download className="w-4 h-4 mr-1" />
          下載 QR Code
        </button>
        <button
          onClick={shareQRCode}
          className="btn-primary text-sm flex items-center justify-center"
          disabled={!qrCodeDataUrl}
        >
          <Share2 className="w-4 h-4 mr-1" />
          分享 QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
