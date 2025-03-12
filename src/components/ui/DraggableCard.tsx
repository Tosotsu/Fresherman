import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Edit, Save, X } from 'lucide-react';

export interface DraggableCardProps {
  title: string;
  className?: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  id: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  title,
  className,
  children,
  initialPosition,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLPreElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(1);
  
  // New state for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  
  // Use a ref for float offset instead of state to prevent re-renders
  // This helps make the animation smoother
  const floatOffsetRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());
  
  // Precompute the speed factors for better performance
  const speedFactors = {
    personal: 0.6,
    education: 0.8,
    medical: 0.7,
    employment: 0.9,
    vehicle: 0.65
  };
  
  // Extract content from children
  useEffect(() => {
    if (contentRef.current) {
      const content = contentRef.current.textContent || '';
      setEditedContent(content);
    }
  }, [children]);

  // Add optimized floating animation effect
  useEffect(() => {
    const speedFactor = speedFactors[id as keyof typeof speedFactors] || 0.7;
    
    const animate = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      
      // Create gentle floating motion with sine waves
      // Using smaller values and less frequent updates for smoother motion
      const xOffset = Math.sin(elapsedTime * 0.0005 * speedFactor) * 3;
      const yOffset = Math.cos(elapsedTime * 0.0008 * speedFactor) * 3;
      
      if (!isDragging && !isEditing && cardRef.current) {
        floatOffsetRef.current = { x: xOffset, y: yOffset };
        
        // Apply the transform directly to the DOM element for smoother animation
        // This avoids state updates and re-renders
        cardRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [id, isDragging, isEditing]);
  
  // Setup global mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;
      
      // Calculate new position - removed boundary constraints
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // No boundary checks - allow cards to be dragged anywhere
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    // Add event listeners to window
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!cardRef.current) return;
    
    // Remove transform when dragging starts to avoid interference
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }
    
    // Calculate the offset from the mouse position to the card's top-left corner
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // Bring the card to the front
    setZIndex(100);
    setIsDragging(true);
  };

  // Handle cursor animation
  useEffect(() => {
    if (!isEditing) return;
    
    const handleCursorMovement = () => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (!textarea) return;
      
      const selection = textarea.selectionStart;
      const value = textarea.value.substring(0, selection);
      const lines = value.split('\n');
      const currentLine = lines.length - 1;
      const currentCol = lines[currentLine].length;
      
      // Rough approximation of cursor position
      const lineHeight = 20;
      const charWidth = 8;
      
      setCursorPosition({
        x: currentCol * charWidth,
        y: currentLine * lineHeight
      });
    };
    
    const blinkCursor = () => {
      setShowCursor(prev => !prev);
    };
    
    // Blink cursor
    const blinkInterval = setInterval(blinkCursor, 500);
    
    // Add event listener for cursor movement
    document.addEventListener('selectionchange', handleCursorMovement);
    
    return () => {
      clearInterval(blinkInterval);
      document.removeEventListener('selectionchange', handleCursorMovement);
    };
  }, [isEditing]);

  // Create a glow effect based on card ID
  const getGlowColor = () => {
    switch(id) {
      case 'personal': return 'before:bg-blue-500/10';
      case 'education': return 'before:bg-green-500/10';
      case 'medical': return 'before:bg-red-500/10';
      case 'employment': return 'before:bg-purple-500/10';
      case 'vehicle': return 'before:bg-amber-500/10';
      default: return 'before:bg-primary/10';
    }
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    // Stop floating animation by clearing transform
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }
  };

  const saveEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(false);
    // Save to localStorage to persist changes
    localStorage.setItem(`card-content-${id}`, editedContent);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Revert to original content
    if (contentRef.current) {
      setEditedContent(contentRef.current.textContent || '');
    }
    setIsEditing(false);
  };

  // Load content from localStorage if available
  useEffect(() => {
    const savedContent = localStorage.getItem(`card-content-${id}`);
    if (savedContent) {
      setEditedContent(savedContent);
    }
  }, [id]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        'absolute shadow-lg transition-shadow cursor-grab hover:shadow-xl',
        'before:absolute before:inset-0 before:rounded-lg before:z-[-1] before:blur-xl before:opacity-50',
        getGlowColor(),
        isDragging ? 'shadow-xl opacity-95 cursor-grabbing' : '',
        isEditing ? '!cursor-text ring-2 ring-primary' : '',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex,
        transition: isDragging ? 'none' : 'box-shadow 0.3s ease',
        touchAction: 'none', // Prevents default touch actions
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
      onTouchStart={(e) => {
        if (isEditing) return;
        // Handle touch events for mobile
        const touch = e.touches[0];
        if (touch && cardRef.current) {
          e.preventDefault();
          const rect = cardRef.current.getBoundingClientRect();
          setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
          });
          setZIndex(100);
          cardRef.current.style.transform = '';
          setIsDragging(true);
        }
      }}
    >
      <CardContent className={cn("p-4 select-none", isEditing && "select-text")}>
        <div className="flex justify-between items-center mb-2">
          <div className="text-primary font-medium text-sm">{title}</div>
          <div className="flex space-x-1">
            {isEditing ? (
              <>
                <button 
                  onClick={saveEditing} 
                  className="p-1 hover:bg-primary/10 rounded-full text-primary"
                  title="Save changes"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button 
                  onClick={cancelEditing} 
                  className="p-1 hover:bg-primary/10 rounded-full text-primary"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={startEditing} 
                className="p-1 hover:bg-primary/10 rounded-full text-primary"
                title="Edit content"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="text-foreground/80 font-medium relative">
          {isEditing ? (
            <div className="relative">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[100px] bg-transparent border-none focus:outline-none resize-none text-sm font-mono p-0"
                autoFocus
              />
              {showCursor && (
                <div 
                  className="absolute w-[2px] h-[16px] bg-primary animate-pulse"
                  style={{ 
                    left: `${cursorPosition.x}px`, 
                    top: `${cursorPosition.y}px` 
                  }}
                />
              )}
            </div>
          ) : (
            <pre ref={contentRef} className="text-sm whitespace-pre-wrap font-sans">
              {editedContent || children}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DraggableCard;
