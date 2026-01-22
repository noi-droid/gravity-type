import { useState, useEffect, useRef } from 'react';

function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [gravity, setGravity] = useState({ x: 0, y: 1 });
  const lettersRef = useRef([]);
  const velocitiesRef = useRef([]);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  
  const text = "GRAVITY";
  const letterCount = text.length;
  
  useEffect(() => {
    const positions = [];
    const velocities = [];
    const startX = 150;
    const startY = 200;
    const spacing = 48;
    
    for (let i = 0; i < letterCount; i++) {
      positions.push({
        x: startX + i * spacing,
        y: startY + Math.random() * 20
      });
      velocities.push({ x: 0, y: 0 });
    }
    
    lettersRef.current = positions;
    velocitiesRef.current = velocities;
  }, []);
  
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      setNeedsPermission(true);
    } else if (window.DeviceOrientationEvent) {
      setHasPermission(true);
    }
  }, []);
  
  const requestPermission = async () => {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response === 'granted') {
        setHasPermission(true);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {
    if (!hasPermission) return;
    
    const handleOrientation = (event) => {
      const { beta, gamma } = event;
      
      if (beta !== null && gamma !== null) {
        const x = gamma / 45;
        const y = beta / 45;
        
        setGravity({
          x: Math.max(-2, Math.min(2, x)),
          y: Math.max(-2, Math.min(2, y))
        });
      }
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [hasPermission]);
  
  const [positions, setPositions] = useState([]);
  
  useEffect(() => {
    const friction = 0.96;
    const gravityStrength = 0.5;
    const bounce = 0.6;
    const containerWidth = 390;
    const containerHeight = 600;
    const letterSize = 40;
    
    const animate = () => {
      const newPositions = [];
      
      for (let i = 0; i < letterCount; i++) {
        if (!lettersRef.current[i]) continue;
        
        let { x, y } = lettersRef.current[i];
        let vel = velocitiesRef.current[i] || { x: 0, y: 0 };
        
        vel.x += gravity.x * gravityStrength;
        vel.y += gravity.y * gravityStrength;
        
        vel.x *= friction;
        vel.y *= friction;
        
        x += vel.x;
        y += vel.y;
        
        if (x < 0) {
          x = 0;
          vel.x *= -bounce;
        }
        if (x > containerWidth - letterSize) {
          x = containerWidth - letterSize;
          vel.x *= -bounce;
        }
        if (y < 0) {
          y = 0;
          vel.y *= -bounce;
        }
        if (y > containerHeight - letterSize) {
          y = containerHeight - letterSize;
          vel.y *= -bounce;
        }
        
        lettersRef.current[i] = { x, y };
        velocitiesRef.current[i] = vel;
        newPositions.push({ x, y, letter: text[i] });
      }
      
      setPositions([...newPositions]);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gravity]);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {needsPermission && !hasPermission && (
        <button
          onClick={requestPermission}
          style={{
            position: 'absolute',
            top: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            padding: '12px 24px',
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'monospace',
            fontSize: 14,
            letterSpacing: '0.05em',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          TAP TO ENABLE MOTION
        </button>
      )}
      
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative',
          backgroundColor: 'black',
          width: 390, 
          height: 600,
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {positions.map((pos, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              fontSize: 48,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              color: 'white',
              userSelect: 'none',
              textShadow: '0 0 20px rgba(255,255,255,0.3)'
            }}
          >
            {pos.letter}
          </span>
        ))}
        
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'monospace',
          fontSize: 12
        }}>
          <div>x: {gravity.x.toFixed(2)}</div>
          <div>y: {gravity.y.toFixed(2)}</div>
        </div>
      </div>
      
      {!needsPermission && (
        <p style={{
          marginTop: 24,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'monospace',
          fontSize: 12,
          textAlign: 'center',
          maxWidth: 320
        }}>
          Desktop detected. Open on iPhone and tilt to see the effect.
        </p>
      )}
    </div>
  );
}

export default App;