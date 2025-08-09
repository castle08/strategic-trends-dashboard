import React, { useEffect, useRef } from 'react';
import QR from 'qrcode';

interface QRCodeProps {
  url: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ url, size = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QR.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: 'transparent',
        },
      }).catch(console.error);
    }
  }, [url, size]);

  return (
    <div className="p-4 bg-white rounded-xl">
      <canvas ref={canvasRef} className="block" />
      <div className="text-center mt-2 text-black text-xs font-medium">
        Scan to read more
      </div>
    </div>
  );
};

export default QRCode;