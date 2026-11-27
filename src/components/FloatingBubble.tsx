import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Crosshair } from 'lucide-react';

interface FloatingBubbleProps {
  isOpen: boolean;
  onToggleMenu: () => void;
  injectionActive: boolean;
}

export function FloatingBubble({
  isOpen,
  onToggleMenu,
  injectionActive,
}: FloatingBubbleProps) {
  const [position, setPosition] = useState({ x: 18, y: 84 });
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 18,
    originY: 84,
    moved: false,
  });

  // Clamp position inside viewport on resize/orientation change
  useEffect(() => {
    const clamp = () => {
      const size = 56;
      const pad = 10;
      setPosition((prev) => ({
        x: Math.min(Math.max(pad, prev.x), Math.max(pad, window.innerWidth - size - pad)),
        y: Math.min(Math.max(pad, prev.y), Math.max(pad, window.innerHeight - size - pad)),
      }));
    };
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragRef.current.moved = true;
    }

    const size = 56;
    const pad = 10;
    const nextX = Math.min(
      Math.max(pad, dragRef.current.originX + dx),
      Math.max(pad, window.innerWidth - size - pad)
    );
    const nextY = Math.min(
      Math.max(pad, dragRef.current.originY + dy),
      Math.max(pad, window.innerHeight - size - pad)
    );

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;

    const wasClick = !dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (wasClick) {
      onToggleMenu();
    }
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label={isOpen ? 'Collapse Mod Menu' : 'Expand Mod Menu'}
      title="Drag to move · Tap to toggle Mod Menu"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-50 w-14 h-14 rounded-2xl cyber-glass flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragging ? 'scale-105' : 'hover:scale-105'
      } ${
        isOpen
          ? 'border border-cyan-400/70 shadow-[0_0_24px_rgba(0,240,255,0.45)]'
          : 'border border-[#ff1e42]/75 shadow-[0_0_24px_rgba(255,30,66,0.45)]'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center pointer-events-none">
        <Crosshair
          className={`w-6 h-6 transition-colors ${
            isOpen ? 'text-cyan-300' : 'text-[#ff1e42]'
          }`}
        />
        <span className="text-[9px] font-display font-bold tracking-wider text-white/90 mt-0.5">
          {isOpen ? 'HIDE' : 'MENU'}
        </span>
      </div>

      {/* Subtle corner indicator when bypass is injected */}
      {injectionActive && (
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080a0f] shadow-[0_0_10px_#00e676]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
