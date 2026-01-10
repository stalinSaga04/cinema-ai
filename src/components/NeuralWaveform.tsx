"use client";
import React, { useEffect, useRef } from 'react';

interface NeuralWaveformProps {
  data: { time: number; intensity: number }[];
  color?: string;
  height?: number;
}

const NeuralWaveform: React.FC<NeuralWaveformProps> = ({ data, color = "#00FF94", height = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      const step = canvas.width / (data.length || 1);
      
      data.forEach((point, i) => {
        const x = i * step;
        const amplitude = point.intensity * (height / 2);
        const y = (height / 2) + Math.sin(i * 0.2 + offset) * amplitude;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      
      // Add glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      
      offset += 0.05;
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [data, color, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={height} 
      className="w-full h-full opacity-80"
    />
  );
};

export default NeuralWaveform;
