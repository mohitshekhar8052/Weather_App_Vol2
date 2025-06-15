
import React from 'react';
import { Plus, Triangle } from 'lucide-react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      <div 
        className="absolute w-24 h-24 bg-primary/10 rounded-full animate-float" 
        style={{ top: '15%', left: '10%', animationDuration: '10s' }} 
      />
      <div 
        className="absolute w-32 h-32 bg-foreground/5 rounded-full animate-float" 
        style={{ top: '25%', right: '5%', animationDuration: '12s', animationDelay: '-5s' }} 
      />
      <div 
        className="absolute w-16 h-16 bg-primary/10 rounded-2xl animate-float" 
        style={{ bottom: '20%', left: '20%', animationDuration: '8s', animationDelay: '-2s' }} 
      />
      <div 
        className="absolute w-40 h-40 bg-foreground/5 rounded-full animate-float" 
        style={{ bottom: '5%', right: '15%', animationDuration: '15s', animationDelay: '-8s' }} 
      />
      <Triangle 
        className="absolute text-primary/20 animate-float" 
        fill="currentColor"
        style={{ top: '60%', left: '15%', width: '40px', height: '40px', animationDuration: '9s', animationDelay: '-3s', transform: 'rotate(20deg)' }}
        strokeWidth={0}
      />
      <Plus 
        className="absolute text-primary/30 animate-float" 
        style={{ top: '40%', right: '25%', width: '30px', height: '30px', animationDuration: '7s', animationDelay: '-1s' }}
        strokeWidth={2}
      />
       <Plus 
        className="absolute text-foreground/20 animate-float" 
        style={{ bottom: '40%', left: '40%', width: '20px', height: '20px', animationDuration: '6s', animationDelay: '-4s' }}
        strokeWidth={2}
      />
    </div>
  );
};

export default AnimatedBackground;
