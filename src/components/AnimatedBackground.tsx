import React, { useEffect, useRef } from 'react';
import { Plus, Triangle, Circle, Square } from 'lucide-react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create gradient background that adapts to theme
    const updateCanvas = () => {
      // Check if we're in dark mode by checking the HTML class
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Create different gradients based on theme
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      if (isDarkMode) {
        gradient.addColorStop(0, 'rgba(25, 26, 42, 0.2)');
        gradient.addColorStop(1, 'rgba(35, 37, 60, 0.1)');
      } else {
        gradient.addColorStop(0, 'rgba(240, 245, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(225, 235, 255, 0.1)');
      }
      
      // Particle settings
      const particles: Array<{
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        opacity: number;
        color: string;
      }> = [];
      
      const createParticles = () => {
        const particleCount = Math.floor(window.innerWidth / 10);
        
        // Colors based on theme
        const colors = isDarkMode 
          ? ['rgba(242, 155, 56, 0.15)', 'rgba(242, 155, 56, 0.08)', 'rgba(255, 255, 255, 0.05)']
          : ['rgba(242, 155, 56, 0.12)', 'rgba(0, 150, 255, 0.05)', 'rgba(0, 0, 0, 0.02)'];
        
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 5 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.2,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }
      };
      
      createParticles();
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw gradient background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.y > canvas.height) particle.y = 0;
          if (particle.y < 0) particle.y = canvas.height;
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
        });
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };
    
    updateCanvas();
    
    // Update canvas when theme changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          updateCanvas();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    };
  }, []);
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Glass elements with theme adaptation */}
      <div className="absolute left-[10%] top-[15%] w-32 h-32 rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/10 rotate-12 animate-float" style={{ animationDuration: '20s' }} />
      
      <div className="absolute right-[15%] top-[30%] w-48 h-48 rounded-full bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 animate-float" style={{ animationDuration: '25s', animationDelay: '-5s' }} />
      
      <div className="absolute left-[20%] bottom-[20%] w-36 h-36 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10 -rotate-12 animate-float" style={{ animationDuration: '18s', animationDelay: '-10s' }} />
      
      <div className="absolute right-[10%] bottom-[15%] w-24 h-24 rounded-lg bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/10 rotate-45 animate-float" style={{ animationDuration: '22s', animationDelay: '-8s' }} />
      
      {/* Modern shapes */}
      <Circle 
        className="absolute text-primary/20 animate-float" 
        style={{ top: '25%', right: '30%', width: '50px', height: '50px', animationDuration: '15s', animationDelay: '-3s' }}
        strokeWidth={1}
        fill="rgba(242, 155, 56, 0.03)"
      />
      
      <Square
        className="absolute text-primary/15 animate-float"
        style={{ bottom: '35%', right: '20%', width: '40px', height: '40px', animationDuration: '17s', animationDelay: '-12s', transform: 'rotate(15deg)' }}
        strokeWidth={1}
        fill="rgba(242, 155, 56, 0.02)"
      />
      
      <Plus 
        className="absolute text-foreground/20 animate-float" 
        style={{ bottom: '40%', left: '15%', width: '30px', height: '30px', animationDuration: '12s', animationDelay: '-6s' }}
        strokeWidth={1}
      />
      
      <Triangle 
        className="absolute text-primary/20 animate-float" 
        fill="rgba(242, 155, 56, 0.05)"
        style={{ top: '60%', left: '25%', width: '35px', height: '35px', animationDuration: '19s', animationDelay: '-9s', transform: 'rotate(20deg)' }}
        strokeWidth={0}
      />
      
      {/* Gradient overlay - theme adaptive */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70 transition-colors duration-300"></div>
    </div>
  );
};

export default AnimatedBackground;
