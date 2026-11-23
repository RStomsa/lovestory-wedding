'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStudioStore } from './studioStore';
import { CanvasElement } from './studioTypes';
import StudioFallingOverlay from './StudioFallingOverlay';
import StudioWidgetRenderer from './StudioWidgetRenderer';
import { resolveFontFamily, loadCustomFontFile } from '@/lib/studioFonts';
import {
  Copy,
  Trash2,
  MoreHorizontal,
  ZoomIn,
  ZoomOut,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Move,
  RotateCw,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Edit3,
  Check,
} from 'lucide-react';

// Dynamically import react-moveable to ensure SSR safe
const Moveable = dynamic(() => import('react-moveable'), { ssr: false });
const DynamicMoveable = Moveable as any;

export default function StudioCanvas() {
  const {
    canvas,
    elements,
    selectedId,
    selectElement,
    addElement,
    updateElement,
    removeElement,
    duplicateElement,
    bringToFront,
    sendToBack,
    setCanvasHeight,
    setZoom,
    zoom,
    previewAnimKey,
    isMobileView,
    setIsMobileView,
    desktopModeOnMobile,
    setTextEditModalElementId,
    setPhotoPickerModalElementId,
    hiddenElementIds,
    undo,
    redo,
  } = useStudioStore();

  const isTouchFriendly = isMobileView && !desktopModeOnMobile;

  const canvasRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<any>(null);
  const [moveableTarget, setMoveableTarget] = useState<HTMLElement | null>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const touchStartDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  // Auto-fit zoom on mobile screens (< 768px) so 500px canvas fits edge-to-edge
  useEffect(() => {
    const updateZoomForViewport = () => {
      if (typeof window !== 'undefined') {
        const isMob = window.innerWidth < 768;
        setIsMobileView(isMob);
        if (isMob) {
          const availableW = window.innerWidth - 16;
          const fit = Math.min(1.0, Math.max(0.45, availableW / canvas.width));
          setZoom(Number(fit.toFixed(2)));
        }
      }
    };
    updateZoomForViewport();
    window.addEventListener('resize', updateZoomForViewport);
    return () => window.removeEventListener('resize', updateZoomForViewport);
  }, [canvas.width, setZoom, setIsMobileView]);

  // Touch gesture handlers for 2-finger pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistRef.current;
      const nextZoom = Math.min(2.0, Math.max(0.4, initialZoomRef.current * ratio));
      setZoom(Number(nextZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Synchronize moveableTarget ONLY when selectedId or editingTextId changes (NEVER on every elements update!)
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      if (selectedId && editingTextId !== selectedId) {
        const el = document.getElementById(`canvas-node-${selectedId}`);
        setMoveableTarget(el);
      } else {
        setMoveableTarget(null);
        setShowLayerMenu(false);
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [selectedId, editingTextId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicked on canvas background, deselect
    if (e.target === canvasRef.current) {
      selectElement(null);
      setMoveableTarget(null);
      setShowLayerMenu(false);
      setEditingTextId(null);
    }
  };

  // =========================================================================
  // KEYBOARD SHORTCUTS: Delete / Backspace, Arrow Keys (1px/10px), Undo/Redo
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ignore if typing in input, textarea, select or contenteditable
      const target = e.target as HTMLElement | null;
      const isInputActive =
        editingTextId !== null ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (isInputActive) return;

      // Global Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Actions below require a selected element
      if (!selectedId) return;

      // 2. Delete / Backspace: Remove selected element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeElement(selectedId);
        selectElement(null);
        setMoveableTarget(null);
        return;
      }

      // 3. Escape: Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        selectElement(null);
        setMoveableTarget(null);
        setEditingTextId(null);
        return;
      }

      // 4. Duplicate (Ctrl + D / Cmd + D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateElement(selectedId);
        return;
      }

      // 5. Arrow Keys: Nudge position (1px normal, 10px with Shift)
      const step = e.shiftKey ? 10 : 1;
      let deltaX = 0;
      let deltaY = 0;

      if (e.key === 'ArrowLeft') deltaX = -step;
      else if (e.key === 'ArrowRight') deltaX = step;
      else if (e.key === 'ArrowUp') deltaY = -step;
      else if (e.key === 'ArrowDown') deltaY = step;

      if (deltaX !== 0 || deltaY !== 0) {
        e.preventDefault();
        const currentEl = elements.find((el) => el.id === selectedId);
        if (!currentEl) return;

        const nextX = currentEl.x + deltaX;
        const nextY = currentEl.y + deltaY;

        // Instant DOM update for 60fps responsiveness
        const domNode = document.getElementById(`canvas-node-${selectedId}`);
        if (domNode) {
          domNode.style.left = `${nextX}px`;
          domNode.style.top = `${nextY}px`;
        }

        updateElement(selectedId, { x: nextX, y: nextY }, true);

        // Update Moveable controller bounding box
        requestAnimationFrame(() => {
          moveableRef.current?.updateRect();
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingTextId, elements, removeElement, selectElement, updateElement, duplicateElement, undo, redo]);

  // =========================================================================
  // DRAG & DROP DIRECTLY FROM DESKTOP ONTO CANVAS (0ms OPTIMISTIC UI)
  // =========================================================================
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadingDropCount, setUploadingDropCount] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const canvasNode = canvasRef.current;
    if (!canvasNode) return;

    const rect = canvasNode.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    setUploadingDropCount((prev) => prev + files.length);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const isFont = /\.(ttf|otf|woff|woff2)$/i.test(file.name);
      const isImage = /\.(png|jpe?g|webp|svg|gif)$/i.test(file.name) || file.type.startsWith('image/');

      if (isFont) {
        // Font dropped onto canvas
        const objectUrl = URL.createObjectURL(file);
        await loadCustomFontFile(cleanName, objectUrl);

        const formData = new FormData();
        formData.append('file', file);
        fetch('/api/admin/assets/upload', { method: 'POST', body: formData })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.url) {
              fetch('/api/admin/assets/fonts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: cleanName,
                  fileUrl: data.url,
                  desc: 'Phông chữ thả trực tiếp vào thiệp',
                  category: 'script',
                }),
              }).catch(() => {});
            }
          })
          .catch(() => {})
          .finally(() => setUploadingDropCount((p) => Math.max(0, p - 1)));

        // If a text element was selected, apply this font immediately!
        if (selectedId) {
          const state = useStudioStore.getState();
          const targetEl = state.elements.find((el) => el.id === selectedId);
          if (targetEl && targetEl.type === 'text') {
            updateElement(selectedId, { fontFamily: cleanName }, true);
          }
        }
      } else if (isImage) {
        // Image or Graphic dropped
        const isGraphic = /\.svg$/i.test(file.name) || (file.type === 'image/png' && file.size < 600 * 1024);
        const previewUrl = URL.createObjectURL(file);
        const w = isGraphic ? 140 : 360;
        const h = isGraphic ? 140 : 450;
        const elemX = Math.round(Math.max(10, Math.min(canvas.width - w - 10, mouseX - w / 2 + i * 20)));
        const elemY = Math.round(Math.max(10, Math.min(canvas.height - h - 10, mouseY - h / 2 + i * 20)));

        // 1. Instant Optimistic UI (0ms latency)
        addElement({
          type: isGraphic ? 'graphic' : 'image',
          x: elemX,
          y: elemY,
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          src: previewUrl,
          objectFit: isGraphic ? 'contain' : 'cover',
          borderRadius: isGraphic ? 0 : 16,
          continuousAnimation: isGraphic ? { type: 'floating', duration: 2.0, delay: 0 } : undefined,
        });

        // 2. Background Upload to replace blob URL with permanent server URL
        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/admin/assets/upload', { method: 'POST', body: formData })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.url) {
              const state = useStudioStore.getState();
              const found = state.elements.find((el) => el.src === previewUrl);
              if (found) {
                state.updateElement(found.id, { src: data.url }, false);
              }

              if (isGraphic) {
                fetch('/api/admin/assets/graphics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: cleanName,
                    src: data.url,
                    category: 'Yếu tố đám cưới',
                    subCategory: 'Đồ họa của tôi',
                    defaultWidth: w,
                    defaultHeight: h,
                  }),
                }).catch(() => {});
              }
            }
          })
          .catch((err) => console.warn('Background upload failed, keeping blob:', err))
          .finally(() => setUploadingDropCount((p) => Math.max(0, p - 1)));
      } else {
        setUploadingDropCount((p) => Math.max(0, p - 1));
      }
    }
  };

  const selectedEl = elements.find((e) => e.id === selectedId);

  const renderElementContent = (el: CanvasElement) => {
    // Continuous animation class
    let animClass = '';
    if (el.continuousAnimation?.type === 'floating') {
      animClass = 'animate-float';
    } else if (el.continuousAnimation?.type === 'heartbeat') {
      animClass = 'animate-heartbeat';
    } else if (el.continuousAnimation?.type === 'wobble') {
      animClass = 'animate-wobble';
    }

    // Flip transform
    const flipStyle = `${el.flipX ? 'scaleX(-1)' : ''} ${el.flipY ? 'scaleY(-1)' : ''}`.trim();

    // Box shadow & text shadow
    const boxShadow = el.shadow?.enabled
      ? `${el.shadow.x ?? 0}px ${el.shadow.y ?? 4}px ${el.shadow.blur ?? 12}px ${el.shadow.color ?? 'rgba(0,0,0,0.25)'}`
      : 'none';
    const textShadow = el.shadow?.textShadowEnabled
      ? `${el.shadow.x ?? 0}px ${el.shadow.y ?? 2}px ${el.shadow.blur ?? 4}px ${el.shadow.color ?? 'rgba(0,0,0,0.35)'}`
      : 'none';

    // Image filter string
    const isSelected = selectedId === el.id;
    const filterStyle = el.filter
      ? `brightness(${el.filter.brightness ?? 100}%) contrast(${el.filter.contrast ?? 100}%) saturate(${el.filter.saturate ?? 100}%) sepia(${el.filter.sepia ?? 0}%)`
      : undefined;

    switch (el.type) {
      case 'text':
        if (el.isCurved) {
          const w = el.width;
          const h = el.height;
          const curv = el.curvature ?? 40;
          const pathD = `M 10 ${h / 2 + curv} Q ${w / 2} ${h / 2 - curv} ${w - 10} ${h / 2 + curv}`;
          return (
            <div
              className={`w-full h-full flex items-center justify-center ${animClass}`}
              style={{
                transform: flipStyle || undefined,
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
              }}
            >
              <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible w-full h-full">
                <defs>
                  <path id={`curve-path-${el.id}`} d={pathD} fill="none" />
                </defs>
                <text
                  fill={el.color || '#000'}
                  fontFamily={resolveFontFamily(el.fontFamily)}
                  fontSize={el.fontSize || 16}
                  fontWeight={el.fontWeight || 'normal'}
                  fontStyle={el.fontStyle || 'normal'}
                  letterSpacing={el.letterSpacing ? `${el.letterSpacing}px` : undefined}
                >
                  <textPath href={`#curve-path-${el.id}`} startOffset="50%" textAnchor="middle">
                    {el.text}
                  </textPath>
                </text>
              </svg>
            </div>
          );
        }

        if (editingTextId === el.id) {
          return (
            <textarea
              autoFocus
              defaultValue={el.text}
              onBlur={(e) => {
                updateElement(el.id, { text: e.target.value }, true);
                setEditingTextId(null);
                setMoveableTarget(document.getElementById(`canvas-node-${el.id}`));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditingTextId(null);
                  setMoveableTarget(document.getElementById(`canvas-node-${el.id}`));
                }
              }}
              onChange={(e) => {
                updateElement(el.id, { text: e.target.value });
              }}
              className="w-full h-full bg-white/90 dark:bg-stone-900/90 resize-none outline-none ring-2 ring-blue-500 rounded-lg p-1.5 shadow-md"
              style={{
                fontFamily: resolveFontFamily(el.fontFamily),
                fontSize: `${el.fontSize || 16}px`,
                fontWeight: el.fontWeight || 'normal',
                fontStyle: el.fontStyle || 'normal',
                color: el.color || '#000',
                textAlign: el.textAlign || 'center',
                letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                lineHeight: el.lineHeight || 1.2,
              }}
            />
          );
        }

        return (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingTextId(el.id);
              setMoveableTarget(null);
            }}
            className={`w-full h-full flex flex-col justify-center select-none ${animClass}`}
            style={{
              fontFamily: resolveFontFamily(el.fontFamily),
              fontSize: `${el.fontSize || 16}px`,
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              color: el.color || '#000',
              textAlign: el.textAlign || 'center',
              letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
              lineHeight: el.lineHeight || 1.2,
              padding: el.padding ? `${el.padding}px` : undefined,
              boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
              textShadow: textShadow !== 'none' ? textShadow : undefined,
              transform: flipStyle || undefined,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              userSelect: 'none',
              cursor: editingTextId === el.id ? 'text' : isSelected ? 'move' : 'pointer',
            }}
            title="Nháy đúp chuột để chỉnh sửa chữ trực tiếp trên thiệp"
          >
            {el.text}
          </div>
        );

      case 'image':
      case 'graphic':
        return (
          <div
            className={`w-full h-full ${animClass}`}
            style={{
              transform: flipStyle || undefined,
              boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
              borderRadius: el.borderRadius ? `${el.borderRadius}px` : '0px',
              overflow: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={el.src}
              alt={el.alt || 'Asset'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: el.objectFit || 'cover',
                filter: filterStyle,
                pointerEvents: 'none',
              }}
              draggable={false}
            />
          </div>
        );

      case 'shape':
        if (el.shapeType === 'circle') {
          return (
            <div
              className={`w-full h-full rounded-full ${animClass}`}
              style={{
                backgroundColor: el.fillColor || '#e8d29b',
                border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                transform: flipStyle || undefined,
              }}
            />
          );
        }
        if (el.shapeType === 'triangle') {
          return (
            <div
              className={`w-full h-full ${animClass}`}
              style={{
                backgroundColor: el.fillColor || '#e8d29b',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                transform: flipStyle || undefined,
              }}
            />
          );
        }
        if (el.shapeType === 'line') {
          return (
            <div
              className={`w-full ${animClass}`}
              style={{
                height: `${el.borderWidth || 2}px`,
                backgroundColor: el.fillColor || '#9c5a1a',
                transform: flipStyle || undefined,
              }}
            />
          );
        }
        return (
          <div
            className={`w-full h-full ${animClass}`}
            style={{
              backgroundColor: el.fillColor || '#FAF7F2',
              borderRadius: el.borderRadius ? `${el.borderRadius}px` : el.shapeType === 'square' ? '8px' : '0px',
              border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`,
              boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
              transform: flipStyle || undefined,
            }}
          />
        );

      case 'widget':
        return <StudioWidgetRenderer element={el} isSelected={selectedId === el.id} />;

      default:
        return null;
    }
  };

  return (
    <div
      id="studio-canvas-scroll-container"
      className="relative flex-1 overflow-auto bg-stone-100 dark:bg-stone-950 flex flex-col items-center p-2 sm:p-4 md:p-8 select-none touch-pan-y"
      style={{ minHeight: 'calc(100vh - 4rem)' }}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Scaled Canvas Container */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          ref={canvasRef}
          id="studio-main-canvas"
          className="relative shadow-2xl transition-all"
          style={{
            width: `${canvas.width}px`,
            height: `${canvas.height}px`,
            backgroundColor: canvas.background,
            overflow: 'hidden',
          }}
        >
          {/* Drag & Drop Visual Indicator Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-50 bg-blue-500/15 backdrop-blur-[2px] border-4 border-dashed border-blue-500 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
              <div className="p-4 bg-white/95 dark:bg-stone-900/95 rounded-2xl shadow-2xl border border-blue-300 dark:border-blue-700 flex flex-col items-center gap-2 max-w-xs text-center">
                <UploadCloud className="w-10 h-10 text-blue-600 animate-bounce" />
                <span className="font-bold text-sm text-stone-900 dark:text-white">
                  Thả tệp vào đây
                </span>
                <span className="text-[11px] text-stone-500">
                  Tự động chèn ảnh, đồ họa hoặc nạp phông chữ vào đúng vị trí chuột
                </span>
              </div>
            </div>
          )}

          {/* Background Upload Progress Toast */}
          {uploadingDropCount > 0 && (
            <div className="absolute top-3 right-3 z-50 px-3 py-1.5 bg-stone-900/90 text-white text-xs rounded-xl shadow-lg border border-stone-700 flex items-center gap-2 pointer-events-none animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Đang lưu tệp lên máy chủ... ({uploadingDropCount})</span>
            </div>
          )}

          {/* Falling Particles Effect Layer (Screenshot: Tuyết, Trái tim, Hoa, Sao...) */}
          {canvas.fallingEffect?.enabled && (
            <StudioFallingOverlay
              enabled={canvas.fallingEffect.enabled}
              type={canvas.fallingEffect.type || 'snow'}
              width={canvas.width}
              height={canvas.height}
            />
          )}

          {/* Elements on Canvas */}
          {elements.map((el) => {
            if (hiddenElementIds.includes(el.id)) return null;

            const isSelected = selectedId === el.id;

            // Entrance animation class & inline style
            let entranceClass = '';
            const entranceType = el.animation?.type;
            if (entranceType && entranceType !== 'none') {
              if (entranceType === 'slide-up') entranceClass = 'anim-slide-up';
              else if (entranceType === 'slide-down') entranceClass = 'anim-slide-down';
              else if (entranceType === 'slide-left') entranceClass = 'anim-slide-left';
              else if (entranceType === 'slide-right') entranceClass = 'anim-slide-right';
              else if (entranceType === 'zoom-in') entranceClass = 'anim-zoom-in';
              else if (entranceType === 'zoom-out') entranceClass = 'anim-zoom-out';
              else if (entranceType === 'fade-in') entranceClass = 'animate-fade-in';
              else if (entranceType === 'rotate-in') entranceClass = 'anim-rotate-in';
              else if (entranceType === 'bounce-in') entranceClass = 'anim-bounce-in';
            }

            const entranceStyle: React.CSSProperties = entranceClass
              ? {
                  animationDuration: `${el.animation?.duration ?? 1.0}s`,
                  animationDelay: `${el.animation?.delay ?? 0}s`,
                  animationFillMode: 'both',
                }
              : {};

            return (
              <div
                key={el.id}
                id={`canvas-node-${el.id}`}
                onPointerDown={(e) => {
                  // Do not intercept if currently inline-editing text
                  if (editingTextId === el.id) return;

                  if (isTouchFriendly) {
                    // 27BigGroup-style Touch Friendly Mode:
                    // DO NOT intercept scroll gestures or drag elements on mobile!
                    // Tapping selects element and opens quick tools
                    e.stopPropagation();
                    selectElement(el.id);

                    if (el.type === 'text') {
                      setTextEditModalElementId(el.id);
                    }
                    return;
                  }

                  e.stopPropagation();
                  selectElement(el.id);
                  const node = e.currentTarget;
                  setMoveableTarget(node);

                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    try {
                      navigator.vibrate(8);
                    } catch {}
                  }

                  const startX = e.clientX;
                  const startY = e.clientY;
                  const origX = el.x;
                  const origY = el.y;
                  let hasDragged = false;

                  const onPointerMove = (moveEvt: PointerEvent) => {
                    const dx = (moveEvt.clientX - startX) / zoom;
                    const dy = (moveEvt.clientY - startY) / zoom;
                    if (!hasDragged && Math.hypot(dx, dy) < 3) return;
                    hasDragged = true;

                    const nextX = Math.round(origX + dx);
                    const nextY = Math.round(origY + dy);
                    node.style.left = `${nextX}px`;
                    node.style.top = `${nextY}px`;
                  };

                  const onPointerUp = (upEvt: PointerEvent) => {
                    window.removeEventListener('pointermove', onPointerMove);
                    window.removeEventListener('pointerup', onPointerUp);

                    if (hasDragged) {
                      const dx = (upEvt.clientX - startX) / zoom;
                      const dy = (upEvt.clientY - startY) / zoom;
                      const nextX = Math.round(origX + dx);
                      const nextY = Math.round(origY + dy);
                      updateElement(el.id, { x: nextX, y: nextY }, true);
                    }
                  };

                  window.addEventListener('pointermove', onPointerMove);
                  window.addEventListener('pointerup', onPointerUp);
                }}
                className={`absolute transition-all ${
                  isTouchFriendly
                    ? isSelected
                      ? el.type === 'image'
                        ? 'ring-2 ring-red-500 shadow-2xl rounded-2xl'
                        : 'ring-2 ring-amber-500 shadow-lg'
                      : 'hover:ring-1 hover:ring-rose-200'
                    : isSelected
                    ? 'ring-2 ring-blue-500 shadow-lg cursor-move'
                    : 'hover:ring-1 hover:ring-blue-300/70 cursor-move'
                }`}
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  transform: `rotate(${el.rotation}deg)`,
                  zIndex: el.zIndex,
                  opacity: el.opacity,
                  boxSizing: 'border-box',
                }}
              >
                {/* 27BigGroup Helper Badges on Mobile (Matches Screenshot 5 & 6 & 11) */}
                {isTouchFriendly && !isSelected && el.type === 'image' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      selectElement(el.id);
                      setPhotoPickerModalElementId(el.id);
                    }}
                    className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto"
                  >
                    <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition-transform border border-white/20">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-300" />
                      <span>Ấn vào để đổi ảnh</span>
                    </span>
                  </div>
                )}

                {isTouchFriendly && !isSelected && el.type === 'text' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      selectElement(el.id);
                      setTextEditModalElementId(el.id);
                    }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-auto z-20"
                  >
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/80 backdrop-blur-xs text-white text-[9px] font-medium shadow-xs whitespace-nowrap active:scale-95 transition-transform">
                      Ấn vào để sửa chữ
                    </span>
                  </div>
                )}

                {/* 27BigGroup In-Place Floating Image Toolbar on Mobile (Matches Screenshot 6 & 11) */}
                {isTouchFriendly && isSelected && el.type === 'image' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 flex flex-wrap items-center justify-center gap-1.5 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl rounded-2xl min-w-[280px] max-w-[95%] animate-in fade-in"
                  >
                    <button
                      onClick={() => setPhotoPickerModalElementId(el.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold text-xs flex items-center gap-1 active:scale-95"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Đổi ảnh</span>
                    </button>

                    <button
                      onClick={() => {
                        updateElement(el.id, { isCutout: !el.isCutout }, true);
                        alert('✨ Đã bật/tắt tách nền AI cho ảnh!');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs flex items-center gap-1 active:scale-95"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Xóa phông AI</span>
                    </button>

                    <button
                      onClick={() => {
                        const cur = el.borderRadius ?? 0;
                        const next = cur === 0 ? 16 : cur === 16 ? 28 : cur === 28 ? 9999 : 0;
                        updateElement(el.id, { borderRadius: next }, true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs active:scale-95"
                    >
                      <span>Viền ảnh</span>
                    </button>

                    <button
                      onClick={() => bringToFront(el.id)}
                      className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 active:scale-95"
                      title="Lên lớp trên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => sendToBack(el.id)}
                      className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 active:scale-95"
                      title="Xuống lớp dưới"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => selectElement(null)}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium text-xs active:scale-95"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}

                {/* Prevent child inputs/buttons from swallowing drag events in editor mode */}
                <div
                  key={`${el.id}-${el.animation?.type || 'none'}-${previewAnimKey}`}
                  className={`w-full h-full select-none ${entranceClass} ${
                    isSelected && el.type === 'text' ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                  style={entranceStyle}
                >
                  {renderElementContent(el)}
                </div>
              </div>
            );
          })}

          {/* Moveable Bounding Box Controller with Smart Snapping Guidelines (Desktop only) */}
          {!isTouchFriendly && selectedId && moveableTarget && (
            <Moveable
              {...({ ref: moveableRef } as any)}
              target={moveableTarget}
              container={typeof document !== 'undefined' ? (document.getElementById('studio-main-canvas') as HTMLElement | null) : null}
              draggable={true}
              resizable={true}
              rotatable={true}
              pinchable={['rotatable', 'resizable']}
              checkInput={false}
              origin={false}
              keepRatio={false}
              snappable={true}
              snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
              elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
              elementGuidelines={elements
                .filter((e) => e.id !== selectedId)
                .map((e) => document.getElementById(`canvas-node-${e.id}`)!)
                .filter(Boolean)}
              verticalGuidelines={[0, canvas.width / 2, canvas.width]}
              horizontalGuidelines={[0, 400, 800, 1200, 1600, 2000, 2500, 3000, 3500, 4000, 4500, 5000]}
              isDisplaySnapDigit={true}
              snapThreshold={5}
              bounds={{ left: 0, top: 0, right: canvas.width, bottom: canvas.height }}
              renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
              edge={false}
              zoom={zoom}
              onDragStart={({ set, target }) => {
                const left = parseFloat(target.style.left) || 0;
                const top = parseFloat(target.style.top) || 0;
                set([left, top]);
              }}
              onDrag={({ target, left, top }) => {
                target.style.left = `${left}px`;
                target.style.top = `${top}px`;
              }}
              onDragEnd={({ target, isDrag }) => {
                if (!isDrag) return;
                const left = parseFloat(target.style.left);
                const top = parseFloat(target.style.top);
                if (!isNaN(left) && !isNaN(top)) {
                  updateElement(selectedId, { x: Math.round(left), y: Math.round(top) }, true);
                }
              }}
              onResizeStart={({ setOrigin, dragStart, target }) => {
                setOrigin(['%', '%']);
                const left = parseFloat(target.style.left) || 0;
                const top = parseFloat(target.style.top) || 0;
                dragStart && dragStart.set([left, top]);
              }}
              onResize={({ target, width, height, drag }) => {
                target.style.width = `${width}px`;
                target.style.height = `${height}px`;
                target.style.left = `${drag.left}px`;
                target.style.top = `${drag.top}px`;
              }}
              onResizeEnd={({ target }) => {
                const width = parseFloat(target.style.width);
                const height = parseFloat(target.style.height);
                const left = parseFloat(target.style.left);
                const top = parseFloat(target.style.top);
                updateElement(
                  selectedId,
                  {
                    width: Math.round(width),
                    height: Math.round(height),
                    x: Math.round(left),
                    y: Math.round(top),
                  },
                  true
                );
              }}
              onRotate={({ target, rotation }) => {
                target.style.transform = `rotate(${rotation}deg)`;
              }}
              onRotateEnd={({ target }) => {
                const match = target.style.transform.match(/rotate\(([-\d.]+)deg\)/);
                const rot = match ? Math.round(parseFloat(match[1])) : 0;
                updateElement(selectedId, { rotation: ((rot % 360) + 360) % 360 }, true);
              }}
            />
          )}

          {/* FLOATING MINI ACTION TOOLBAR DIRECTLY ABOVE THE SELECTED ELEMENT (Desktop only) */}
          {!isTouchFriendly && selectedEl && (
            <div
              className="absolute z-50 flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl rounded-full px-2 py-1 gap-1 text-stone-700 dark:text-stone-200 transition-all"
              style={{
                left: `${Math.max(10, selectedEl.x + selectedEl.width / 2 - 60)}px`,
                top: `${Math.max(10, selectedEl.y - 42)}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => duplicateElement(selectedEl.id)}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                title="Nhân bản (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => removeElement(selectedEl.id)}
                className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                title="Xóa phần tử (Delete)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowLayerMenu(!showLayerMenu)}
                  className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                  title="Thêm tùy chọn"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                {showLayerMenu && (
                  <div className="absolute top-8 left-0 w-36 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl p-1 text-xs space-y-0.5 z-50">
                    <button
                      onClick={() => {
                        bringToFront(selectedEl.id);
                        setShowLayerMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>Lên trên cùng</span>
                    </button>
                    <button
                      onClick={() => {
                        sendToBack(selectedEl.id);
                        setShowLayerMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Xuống dưới cùng</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CIRCULAR MOVE & ROTATE HANDLES BELOW THE BOUNDING BOX (Screenshot 2) */}
          {selectedEl && (
            <div
              className="absolute z-50 flex items-center gap-2 pointer-events-auto"
              style={{
                left: `${selectedEl.x + selectedEl.width / 2 - 32}px`,
                top: `${selectedEl.y + selectedEl.height + 12}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Native real-time dragging handle for Move icon */}
              <div
                className="w-7 h-7 rounded-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 shadow-md flex items-center justify-center cursor-move text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-transform active:scale-90"
                title="Kéo giữ để di chuyển phần tử"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const initialX = selectedEl.x;
                  const initialY = selectedEl.y;

                  const onPointerMove = (moveEvent: PointerEvent) => {
                    const dx = (moveEvent.clientX - startX) / zoom;
                    const dy = (moveEvent.clientY - startY) / zoom;
                    updateElement(selectedEl.id, {
                      x: Math.round(initialX + dx),
                      y: Math.round(initialY + dy),
                    });
                  };

                  const onPointerUp = () => {
                    window.removeEventListener('pointermove', onPointerMove);
                    window.removeEventListener('pointerup', onPointerUp);
                    const el = elements.find((item) => item.id === selectedEl.id);
                    if (el) updateElement(selectedEl.id, { x: el.x, y: el.y }, true);
                  };

                  window.addEventListener('pointermove', onPointerMove);
                  window.addEventListener('pointerup', onPointerUp);
                }}
              >
                <Move className="w-3.5 h-3.5" />
              </div>

              {/* Interactive Rotate handle */}
              <div
                className="w-7 h-7 rounded-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 shadow-md flex items-center justify-center cursor-pointer text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-transform active:scale-90"
                title="Kéo để xoay góc tự do; Nháy chuột để xoay 45°"
                onClick={() => updateElement(selectedEl.id, { rotation: (selectedEl.rotation + 45) % 360 }, true)}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const node = document.getElementById(`canvas-node-${selectedEl.id}`);
                  if (!node) return;
                  const rect = node.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;

                  const onPointerMove = (moveEvent: PointerEvent) => {
                    const radians = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
                    let degrees = Math.round((radians * 180) / Math.PI) - 90;
                    if (degrees < 0) degrees += 360;
                    updateElement(selectedEl.id, { rotation: degrees });
                  };

                  const onPointerUp = () => {
                    window.removeEventListener('pointermove', onPointerMove);
                    window.removeEventListener('pointerup', onPointerUp);
                    const el = elements.find((item) => item.id === selectedEl.id);
                    if (el) updateElement(selectedEl.id, { rotation: el.rotation }, true);
                  };

                  window.addEventListener('pointermove', onPointerMove);
                  window.addEventListener('pointerup', onPointerUp);
                }}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Moveable High-Fidelity Styles with Mobile Touch Optimization */}
          <style jsx global>{`
            .moveable-control-box {
              --moveable-color: #38bdf8 !important;
            }
            .moveable-control {
              width: 10px !important;
              height: 10px !important;
              margin-top: -5px !important;
              margin-left: -5px !important;
              border: 2px solid #ffffff !important;
              background: #38bdf8 !important;
              border-radius: 9999px !important;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25) !important;
            }
            @media (max-width: 768px) {
              .moveable-control {
                width: 22px !important;
                height: 22px !important;
                margin-top: -11px !important;
                margin-left: -11px !important;
                border: 2.5px solid #ffffff !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
              }
            }
            .moveable-line {
              background: #38bdf8 !important;
              height: 1.5px !important;
            }
            .moveable-guideline {
              background: #ef4444 !important;
            }
          `}</style>
        </div>
      </div>

      {/* CANVAS HEIGHT ADJUSTER PILL (Screenshot 1: "- 5498 px +") */}
      <div className="my-6 z-30 mb-24 md:mb-6">
        <div className="flex items-center gap-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300">
          <button
            onClick={() => setCanvasHeight(Math.max(1000, canvas.height - 200))}
            className="w-6 h-6 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center font-bold text-stone-500 hover:text-stone-900"
            title="Giảm chiều cao thiệp"
          >
            -
          </button>
          <span className="font-mono text-stone-800 dark:text-stone-100 px-1">
            {canvas.height} px
          </span>
          <button
            onClick={() => setCanvasHeight(canvas.height + 200)}
            className="w-6 h-6 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center font-bold text-stone-500 hover:text-stone-900"
            title="Tăng chiều cao thiệp"
          >
            +
          </button>
        </div>
      </div>

      {/* FLOATING ZOOM CONTROLLER (Screenshot 1, 2, 3) */}
      <div className="fixed right-3 md:right-84 bottom-20 md:bottom-28 z-30 flex flex-col items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full shadow-lg p-1.5 text-stone-600 dark:text-stone-300">
        <button
          onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono font-semibold py-1">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* FLOATING CHAT BUBBLE BUTTON (Screenshot 1, 2, 3 bottom right) */}
      <button
        className="hidden md:flex fixed right-84 bottom-8 z-30 w-11 h-11 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full shadow-xl items-center justify-center hover:scale-105 active:scale-95 transition-all"
        title="Trợ giúp / CSKH LoveStory"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
}
