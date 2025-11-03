import React from 'react';

const Background = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src="/bg/background.png" 
          alt="Game background" 
          className="min-w-full min-h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Background;