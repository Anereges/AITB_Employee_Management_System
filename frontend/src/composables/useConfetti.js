import { onUnmounted } from 'vue';

export default function useConfetti() {
  // Store all confetti elements for cleanup
  const confettiElements = [];
  
  // Cleanup function
  const cleanupConfetti = () => {
    confettiElements.forEach(confetti => {
      if (confetti && confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    });
    confettiElements.length = 0;
  };

  // Main confetti function
  const fireConfetti = (options = {}) => {
    cleanupConfetti(); // Clean up any existing confetti
    
    const {
      particleCount = 100,
      colors = ['#10b981', '#059669', '#047857', '#065f46', '#f59e0b'],
      size = 10,
      duration = 3000
    } = options;

    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement('div');
      const angle = Math.random() * 360;
      const animationDuration = duration * 0.5 + Math.random() * duration;
      
      // Style the confetti particle
      Object.assign(confetti.style, {
        position: 'fixed',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: '50%',
        left: `${Math.random() * 100}vw`,
        top: '-10px',
        zIndex: '9999',
        transform: `rotate(${angle}deg)`,
        pointerEvents: 'none',
        willChange: 'transform, opacity'
      });

      // Random shape (circle or square)
      if (Math.random() > 0.5) {
        confetti.style.borderRadius = '0';
      }

      document.body.appendChild(confetti);
      confettiElements.push(confetti);

      // Animate the particle
      const animation = confetti.animate(
        [
          { 
            transform: `translate(0, 0) rotate(0deg)`,
            opacity: 1 
          },
          { 
            transform: `translate(${(Math.random() - 0.5) * 200}px, ${window.innerHeight}px) rotate(${angle + 360}deg)`,
            opacity: 0 
          }
        ],
        {
          duration: animationDuration,
          easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        }
      );

      // Remove after animation
      animation.onfinish = () => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
        confettiElements.splice(confettiElements.indexOf(confetti), 1);
      };
    }
  };

  // Clean up when component unmounts
  onUnmounted(cleanupConfetti);

  return {
    fireConfetti,
    cleanupConfetti
  };
}