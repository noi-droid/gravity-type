import { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';


function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [positions, setPositions] = useState([]);
  const [gravity, setGravity] = useState({ x: 0, y: 1 });
  
  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const animationRef = useRef(null);
  
  const text = "Prinky-Polinky";
  const containerWidth = 390;
  const containerHeight = 700;
  const fontSize = 72;
  const letterSize = 68;

  // Initialize Matter.js
  useEffect(() => {
    const { Engine, Bodies, Composite, Body } = Matter;
    
    // Create engine
    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 1;
    engineRef.current = engine;
    
    // Create walls
    const wallThickness = 50;
    const walls = [
      // Bottom
      Bodies.rectangle(containerWidth / 2, containerHeight + wallThickness / 2, containerWidth, wallThickness, { isStatic: true }),
      // Top
      Bodies.rectangle(containerWidth / 2, -wallThickness / 2, containerWidth, wallThickness, { isStatic: true }),
      // Left
      Bodies.rectangle(-wallThickness / 2, containerHeight / 2, wallThickness, containerHeight, { isStatic: true }),
      // Right
      Bodies.rectangle(containerWidth + wallThickness / 2, containerHeight / 2, wallThickness, containerHeight, { isStatic: true }),
    ];
    
    Composite.add(engine.world, walls);
    
    // Create letter bodies
    const letters = text.split('');
const startX = 60;
const startY = 150;
const spacing = 4;
const charsPerRow = 6;

const bodies = letters.map((letter, i) => {
  const row = Math.floor(i / charsPerRow);
  const col = i % charsPerRow;
  
  const body = Bodies.circle(
    startX + col * spacing,
    startY + row * 80 + Math.random() * 20,
        letterSize / 2,
        {
          restitution: 0.6,
          friction: 0.1,
          frictionAir: 0.02,
          label: letter,
        }
      );
      return body;
    });
    
    bodiesRef.current = bodies;
    Composite.add(engine.world, bodies);
    
    // Animation loop
    const update = () => {
      Engine.update(engine, 1000 / 60);
      
      const newPositions = bodiesRef.current.map((body) => ({
        x: body.position.x,
        y: body.position.y,
        angle: body.angle,
        letter: body.label,
      }));
      
      setPositions(newPositions);
      animationRef.current = requestAnimationFrame(update);
    };
    
    animationRef.current = requestAnimationFrame(update);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      Composite.clear(engine.world);
      Engine.clear(engine);
    };
  }, []);

  // Update gravity based on device orientation
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.x = gravity.x;
      engineRef.current.gravity.y = gravity.y;
    }
  }, [gravity]);

  // Check permission
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

  // Listen to device orientation
  useEffect(() => {
    if (!hasPermission) return;
    
    const handleOrientation = (event) => {
      const { beta, gamma } = event;
      
      if (beta !== null && gamma !== null) {
        const x = (gamma / 90) * 2;
        const y = (beta / 90) * 2;
        
        setGravity({
          x: Math.max(-2, Math.min(2, x)),
          y: Math.max(-1, Math.min(3, y)),
        });
      }
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [hasPermission]);

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
            fontFamily: '"OTR Grotesk", system-ui, sans-serif',
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
        style={{ 
          position: 'relative',
          backgroundColor: 'black',
          width: containerWidth, 
          height: containerHeight,
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden'
        }}
      >
        {positions.map((pos, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              fontSize: fontSize,
              fontFamily: '"OTR Grotesk", system-ui, sans-serif',
              fontWeight: 900,
              color: 'white',
              userSelect: 'none',
              textShadow: '0 0 20px rgba(255,255,255,0.3)',
              transform: `translate(-50%, -50%) rotate(${pos.angle}rad)`,
              willChange: 'transform'
            }}
          >
            {pos.letter}
          </span>
        ))}
        {/* Debug: show collision circles */}
{positions.map((pos, i) => (
  <div
    key={`debug-${i}`}
    style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width: letterSize,
      height: letterSize,
      borderRadius: '50%',
      border: '1px solid rgba(255, 0, 0, 0.5)',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none'
    }}
  />
))}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: '"OTR Grotesk", system-ui, sans-serif',
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
          fontFamily: '"OTR Grotesk", system-ui, sans-serif',
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