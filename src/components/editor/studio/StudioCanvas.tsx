'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStudioStore } from './studioStore';
import { CanvasElement } from './studioTypes';
import StudioFallingOverlay from './StudioFallingOverlay';
import StudioWidgetRenderer from './StudioWidgetRenderer';
import { resolveFontFamily, loadCustomFontFile } from '@/lib/studioFonts';
import { resolveStudioAssetUrl } from '@/lib/studioUtils';
import {
  Copy,
  Trash2,
  MoreHorizontal,
  ZoomIn,
  ZoomOut,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  ArrowDownToLine,
  ArrowUpToLine,
  Move,
  RotateCw,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Edit3,
  Check,
  Smartphone,
  Lock,
  Unlock,
  Layers,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Type,
  Square,
  LayoutGrid,
  Sparkles,
  CheckSquare,
  X,
} from 'lucide-react';

// Dynamically import react-moveable to ensure SSR safe
const Moveable = dynamic(() => import('react-moveable'), { ssr: false });
const DynamicMoveable = Moveable as any;

export default function StudioCanvas() {
  const {
    canvas,
    elements,
    selectedId,
    selectedIds,
    isMultiSelectMode,
    toggleMultiSelectMode,
    selectElement,
    toggleSelectElement,
    selectMultipleElements,
    removeSelectedElements,
    duplicateSelectedElements,
    updateElementsBatch,
    alignSelectedElements,
    pushSelectedElements,
    addElement,
    pushElementsBelow,
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
  const isMarqueeDraggingRef = useRef<boolean>(false);
  const [moveableTarget, setMoveableTarget] = useState<HTMLElement | null>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showScreenGuides, setShowScreenGuides] = useState(true);
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elements: CanvasElement[] } | null>(null);

  const moveableTargets = selectedIds
    .map((id) => (typeof document !== 'undefined' ? document.getElementById(`canvas-node-${id}`) : null))
    .filter((node): node is HTMLElement => Boolean(node));

  const groupBounds = React.useMemo(() => {
    if (selectedIds.length <= 1) return null;
    const selEls = elements.filter((e) => selectedIds.includes(e.id));
    if (selEls.length === 0) return null;
    const minX = Math.min(...selEls.map((e) => e.x));
    const maxX = Math.max(...selEls.map((e) => e.x + e.width));
    const minY = Math.min(...selEls.map((e) => e.y));
    const maxY = Math.max(...selEls.map((e) => e.y + e.height));
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }, [selectedIds, elements]);

  // Auto-close layer options menu and context menu when clicking outside
  useEffect(() => {
    if (!showLayerMenu && !contextMenu) return;
    const handleOutside = () => {
      setShowLayerMenu(false);
      setContextMenu(null);
    };
    window.addEventListener('pointerdown', handleOutside);
    return () => window.removeEventListener('pointerdown', handleOutside);
  }, [showLayerMenu, contextMenu]);

  // Dynamic Fold Label inspector based on real elements positioned in each fold
  const getFoldLabel = (foldIndex: number, foldTop: number, foldBottom: number) => {
    if (foldIndex === 0) return 'Trang bìa & Mở đầu';

    const foldEls = elements.filter(
      (e) => (e.y >= foldTop - 80 && e.y < foldBottom - 80) ||
             (e.y <= foldTop && e.y + e.height >= foldTop + 250)
    );

    const hasTimeline = foldEls.some(
      (e) => (e.text && (e.text.includes('LỊCH TRÌNH') || e.text.includes('Đón khách') || e.text.includes('Lễ Vu Quy') || e.text.includes('Lễ Thành Hôn'))) ||
             e.widgetType === 'story_timeline'
    );
    const hasCountdown = foldEls.some((e) => e.widgetType === 'countdown');
    const hasCalendar = foldEls.some((e) => e.widgetType === 'calendar');
    const hasAlbum = foldEls.some((e) => e.widgetType === 'album' || e.widgetType === 'slideshow');
    const hasWishes = foldEls.some((e) => e.widgetType === 'wishes');
    const hasRsvp = foldEls.some((e) => e.widgetType === 'rsvp');
    const hasMap = foldEls.some((e) => e.widgetType === 'map' || e.widgetType === 'giftbox');
    const hasFamily = foldEls.some(
      (e) => (e.text && (e.text.includes('Nhà Trai') || e.text.includes('Nhà Gái') || e.text.includes('Cô Dâu') || e.text.includes('Chú Rể') || e.text.includes('Trân trọng'))) ||
             e.widgetType === 'family_info'
    );

    if (hasTimeline && hasCountdown) return 'Lịch trình & Đếm ngược ngày cưới';
    if (hasTimeline) return 'Lịch trình ngày cưới';
    if (hasCountdown && hasCalendar) return 'Lịch cưới & Đếm ngược';
    if (hasCountdown) return 'Đếm ngược ngày cưới';
    if (hasCalendar) return 'Lịch cưới Save The Date';
    if (hasAlbum) return 'Album ảnh cưới';
    if (hasWishes) return 'Sổ lưu bút & Lời chúc';
    if (hasRsvp) return 'Xác nhận tham dự (RSVP)';
    if (hasMap) return 'Bản đồ & Hộp mừng cưới';
    if (hasFamily) return 'Thông tin hai bên gia đình';

    return `Khu vực nội dung thiệp`;
  };

  // Helper to center selected element inside a specific screen fold
  const centerInScreenFold = (foldIndex: number) => {
    if (!selectedId) {
      alert('Vui lòng click chọn 1 đối tượng (ảnh, chữ hoặc họa tiết) trên thiệp trước khi canh giữa.');
      return;
    }
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const FOLD_H = 850;
    const targetX = Math.round((canvas.width - el.width) / 2);
    // If element is a header/short text, place it at top of the fold with 50px padding
    // If element is large, center it vertically with safe margin
    let targetY: number;
    if (el.height < 60) {
      targetY = foldIndex * FOLD_H + 50;
    } else {
      targetY = Math.round(foldIndex * FOLD_H + Math.max(30, (FOLD_H - el.height) / 2));
    }
    updateElement(selectedId, { x: targetX, y: targetY }, true);
  };

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

  // Direct native resize handle gesture handler for bulletproof resizing
  const handleNativeResize = (
    e: React.PointerEvent,
    el: CanvasElement,
    dir: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;
    const origW = el.width;
    const origH = el.height;
    const ratio = origW / Math.max(1, origH);

    const node = document.getElementById(`canvas-node-${el.id}`);
    if (!node) return;

    let currentW = origW;
    let currentH = origH;
    let currentX = origX;
    let currentY = origY;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dx = (moveEvt.clientX - startX) / zoom;
      const dy = (moveEvt.clientY - startY) / zoom;

      let newW = origW;
      let newH = origH;
      let newX = origX;
      let newY = origY;

      if (dir.includes('e')) newW = Math.max(20, origW + dx);
      if (dir.includes('s')) newH = Math.max(20, origH + dy);
      if (dir.includes('w')) {
        newW = Math.max(20, origW - dx);
        newX = origX + (origW - newW);
      }
      if (dir.includes('n')) {
        newH = Math.max(20, origH - dy);
        newY = origY + (origH - newH);
      }

      // If shift key pressed, keep aspect ratio
      if (moveEvt.shiftKey && (dir === 'nw' || dir === 'ne' || dir === 'se' || dir === 'sw')) {
        newH = Math.max(20, Math.round(newW / ratio));
        if (dir.includes('n')) newY = origY + (origH - newH);
      }

      currentW = Math.round(newW);
      currentH = Math.round(newH);
      currentX = Math.round(newX);
      currentY = Math.round(newY);

      node.style.width = `${currentW}px`;
      node.style.height = `${currentH}px`;
      node.style.left = `${currentX}px`;
      node.style.top = `${currentY}px`;
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      updateElement(
        el.id,
        {
          width: currentW,
          height: currentH,
          x: currentX,
          y: currentY,
        },
        true
      );
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
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
  }, [selectedId, selectedIds, editingTextId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If user just dragged a marquee selection, ignore the subsequent click event
    if (isMarqueeDraggingRef.current) {
      isMarqueeDraggingRef.current = false;
      e.stopPropagation();
      return;
    }
    // If clicked on canvas background or outer scroll container, deselect
    const target = e.target as HTMLElement;
    if (target === canvasRef.current || target.id === 'studio-canvas-scroll-container') {
      if (!e.shiftKey && !isMultiSelectMode) {
        selectElement(null);
        setMoveableTarget(null);
        setShowLayerMenu(false);
        setContextMenu(null);
        setEditingTextId(null);
      }
    }
  };

  // Canvas context menu (Right click) to pick any overlapping layer directly
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    const canvasNode = canvasRef.current;
    if (!canvasNode) return;
    const rect = canvasNode.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    const overlappingAtPoint = elements
      .filter(
        (other) =>
          !hiddenElementIds.includes(other.id) &&
          clickX >= other.x &&
          clickX <= other.x + other.width &&
          clickY >= other.y &&
          clickY <= other.y + other.height
      )
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    if (overlappingAtPoint.length > 0) {
      e.preventDefault();
      setContextMenu({ x: clickX, y: clickY, elements: overlappingAtPoint });
    }
  };

  // Canvas pointer down for rubberband / marquee drag-selection
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary mouse button

    const target = e.target as HTMLElement;
    // Don't start marquee if interacting with UI buttons, inputs or handles
    if (
      target.closest('.moveable-control-box') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[data-export-ignore="true"]')
    ) {
      return;
    }

    const canvasNode = canvasRef.current;
    if (!canvasNode) return;
    const rect = canvasNode.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;
    let hasDragged = false;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const curX = (moveEvt.clientX - rect.left) / zoom;
      const curY = (moveEvt.clientY - rect.top) / zoom;
      if (!hasDragged && Math.hypot(curX - startX, curY - startY) > 5) {
        hasDragged = true;
      }
      if (hasDragged) {
        setMarquee({ startX, startY, currentX: curX, currentY: curY });
      }
    };

    const onPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (hasDragged) {
        isMarqueeDraggingRef.current = true;
        setTimeout(() => {
          isMarqueeDraggingRef.current = false;
        }, 300);

        const endX = (upEvt.clientX - rect.left) / zoom;
        const endY = (upEvt.clientY - rect.top) / zoom;

        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        // Multi-selection box check
        const matched = elements.filter(
          (el) =>
            !el.isLocked &&
            !hiddenElementIds.includes(el.id) &&
            el.x < maxX &&
            el.x + el.width > minX &&
            el.y < maxY &&
            el.y + el.height > minY
        );

        if (matched.length > 0) {
          const matchedIds = matched.map((m) => m.id);
          if (upEvt.shiftKey || isMultiSelectMode) {
            const combined = Array.from(new Set([...selectedIds, ...matchedIds]));
            selectMultipleElements(combined);
          } else {
            selectMultipleElements(matchedIds);
          }
        } else {
          if (!upEvt.shiftKey && !isMultiSelectMode) {
            selectElement(null);
          }
        }
      } else {
        // Simple click on canvas background without dragging
        if (!upEvt.shiftKey && !isMultiSelectMode) {
          selectElement(null);
          setEditingTextId(null);
          setShowLayerMenu(false);
          setContextMenu(null);
        }
      }
      setMarquee(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
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

      // Actions below require a selected element or group
      if (!selectedId && selectedIds.length === 0) return;

      // 2. Delete / Backspace: Remove selected element(s)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedIds.length > 1) {
          removeSelectedElements();
          setMoveableTarget(null);
          return;
        }
        if (selectedId) {
          removeElement(selectedId);
          selectElement(null);
          setMoveableTarget(null);
          return;
        }
        return;
      }

      // 3. Escape: Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        selectElement(null);
        setMoveableTarget(null);
        setEditingTextId(null);
        setContextMenu(null);
        return;
      }

      // 4. Duplicate (Ctrl + D / Cmd + D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedIds.length > 1) {
          duplicateSelectedElements();
          return;
        }
        if (selectedId) {
          duplicateElement(selectedId);
          return;
        }
        return;
      }

      // 5. Alt + Arrow Keys: Push down / Pull up elements below
      if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const currentEl = elements.find((el) => el.id === selectedId);
        if (!currentEl) return;
        const pushStep = e.shiftKey ? 100 : 50;
        const amount = e.key === 'ArrowDown' ? pushStep : -pushStep;
        pushElementsBelow(currentEl.y + currentEl.height - 10, amount, true);
        return;
      }

      // 6. Arrow Keys: Nudge position (1px normal, 10px with Shift)
      const step = e.shiftKey ? 10 : 1;
      let deltaX = 0;
      let deltaY = 0;

      if (e.key === 'ArrowLeft') deltaX = -step;
      else if (e.key === 'ArrowRight') deltaX = step;
      else if (e.key === 'ArrowUp') deltaY = -step;
      else if (e.key === 'ArrowDown') deltaY = step;

      if (deltaX !== 0 || deltaY !== 0) {
        e.preventDefault();
        if (selectedIds.length > 1) {
          const targets = elements.filter((el) => selectedIds.includes(el.id));
          const batchUpdates = targets.map((el) => {
            const nextX = el.x + deltaX;
            const nextY = el.y + deltaY;
            const domNode = document.getElementById(`canvas-node-${el.id}`);
            if (domNode) {
              domNode.style.left = `${nextX}px`;
              domNode.style.top = `${nextY}px`;
            }
            return { id: el.id, updates: { x: nextX, y: nextY } };
          });
          updateElementsBatch(batchUpdates, true);
          requestAnimationFrame(() => {
            moveableRef.current?.updateRect();
          });
          return;
        }

        if (selectedId) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedIds, editingTextId, elements, removeElement, removeSelectedElements, duplicateSelectedElements, updateElementsBatch, selectElement, updateElement, duplicateElement, undo, redo]);

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
              src={
                resolveStudioAssetUrl(el.src) ||
                (el.type === 'graphic'
                  ? '/assets/m-invite/stock/6964ecd375dc09b0bdcfa023.svg'
                  : '/assets/wedding/samples/sample_01.jpg')
              }
              alt={el.alt || (el.type === 'graphic' ? 'Họa tiết trang trí' : 'Ảnh thiệp cưới')}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.dataset.hasFallback === 'true') return;
                target.dataset.hasFallback = 'true';
                if (target.src.includes('/stock/')) {
                  const fn = target.src.split('/stock/').pop()?.split('?')[0];
                  if (fn) {
                    target.src = `/assets/m-invite/stock/${fn}`;
                    return;
                  }
                }
                if (el.type === 'graphic') {
                  target.src = '/assets/m-invite/stock/6964ecd375dc09b0bdcfa023.svg';
                } else {
                  target.src = '/assets/wedding/samples/sample_01.jpg';
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: el.objectFit || (el.type === 'graphic' ? 'contain' : 'cover'),
                filter: filterStyle,
                pointerEvents: 'none',
              }}
              draggable={false}
            />
          </div>
        );

      case 'shape':
        if (el.shapeType === 'custom_svg' || (el as any).svgPath) {
          return (
            <div
              className={`w-full h-full flex items-center justify-center ${animClass}`}
              style={{
                boxShadow: boxShadow !== 'none' ? boxShadow : undefined,
                transform: flipStyle || undefined,
              }}
            >
              <svg
                viewBox={(el as any).viewBox || '0 0 100 100'}
                className="w-full h-full"
                fill={el.fillColor || 'none'}
                stroke={(el as any).strokeColor || el.borderColor || '#8B1E2D'}
                strokeWidth={el.borderWidth || 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={(el as any).svgPath} />
              </svg>
            </div>
          );
        }
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
      onPointerDown={handleCanvasPointerDown}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sticky Banner when Multi-Select Mode is Active */}
      {isMultiSelectMode && (
        <div
          data-export-ignore="true"
          className="sticky top-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <CheckSquare className="w-4 h-4" />
          <span>
            Chế độ chọn nhiều đang BẬT: Nhấp vào từng khối để thêm/bớt khỏi nhóm ({selectedIds.length} khối đã chọn)
          </span>
          <button
            onClick={() => toggleMultiSelectMode(false)}
            className="ml-2 px-2.5 py-0.5 bg-white text-blue-700 hover:bg-blue-50 rounded-full text-[11px] font-bold shadow-xs cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>
      )}
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
          onPointerDown={handleCanvasPointerDown}
          onContextMenu={handleCanvasContextMenu}
        >
          {/* Marquee Selection Drag Box */}
          {marquee && (
            <div
              data-export-ignore="true"
              className="absolute border-2 border-blue-500 bg-blue-500/20 rounded-xs pointer-events-none z-40 transition-none"
              style={{
                left: `${Math.min(marquee.startX, marquee.currentX)}px`,
                top: `${Math.min(marquee.startY, marquee.currentY)}px`,
                width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
                height: `${Math.abs(marquee.currentY - marquee.startY)}px`,
              }}
            />
          )}

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

          {/* Mobile Screen Fold Guides (850px per viewport fold) */}
          {showScreenGuides && (
            <div data-export-ignore="true" className="absolute inset-0 pointer-events-none z-20">
              {Array.from({ length: Math.ceil(canvas.height / 850) }).map((_, i) => {
                const foldTop = i * 850;
                const foldBottom = Math.min(canvas.height, (i + 1) * 850);
                const label = `Màn ${i + 1}: ${getFoldLabel(i, foldTop, foldBottom)}`;

                return (
                  <div key={`screen-fold-${i}`}>
                    {/* Top Divider Line (from screen 2 onwards) */}
                    {i > 0 && (
                      <div
                        className="absolute left-0 right-0 border-b-2 border-dashed border-rose-400/70 flex items-center justify-between px-3"
                        style={{ top: `${foldTop}px` }}
                      >
                        {/* Left Badge */}
                        <div className="bg-stone-900/90 text-white text-[10px] font-mono font-medium px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5 -translate-y-1/2">
                          <span>📱 {label}</span>
                          <span className="text-stone-400">({foldTop}px - {foldBottom}px)</span>
                        </div>

                        {/* Right Align to Fold Center Button */}
                        <button
                          type="button"
                          onClick={() => centerInScreenFold(i)}
                          className="pointer-events-auto bg-white/95 hover:bg-rose-50 text-stone-700 hover:text-rose-600 border border-stone-200 text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 -translate-y-1/2 active:scale-95 transition-all"
                          title={`Canh giữa phần tử đang chọn vào ${label}`}
                        >
                          <span>🎯 Canh giữa Màn {i + 1}</span>
                        </button>
                      </div>
                    )}

                    {/* Screen 1 top label & center button */}
                    {i === 0 && (
                      <div
                        className="absolute left-0 right-0 flex items-center justify-between px-3"
                        style={{ top: '8px' }}
                      >
                        <div className="bg-stone-900/90 text-white text-[10px] font-mono font-medium px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5">
                          <span>📱 {label}</span>
                          <span className="text-stone-400">(0px - {foldBottom}px)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => centerInScreenFold(0)}
                          className="pointer-events-auto bg-white/95 hover:bg-rose-50 text-stone-700 hover:text-rose-600 border border-stone-200 text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 active:scale-95 transition-all"
                          title="Canh giữa phần tử đang chọn vào Màn 1"
                        >
                          <span>🎯 Canh giữa Màn 1</span>
                        </button>
                      </div>
                    )}

                    {/* Screen 1 Phone Notch / Safe Area Indicator */}
                    {i === 0 && (
                      <div
                        className="absolute left-0 right-0 border-b border-dotted border-amber-400/50 flex items-center justify-center pointer-events-none"
                        style={{ top: '44px' }}
                      >
                        <span className="bg-amber-100/90 text-amber-800 text-[9px] font-medium px-2 py-0.5 rounded-full shadow-xs -translate-y-1/2">
                          ⚡ Vùng tai thỏ / Dynamic Island điện thoại (44px)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Elements on Canvas */}
          {elements.map((el) => {
            if (hiddenElementIds.includes(el.id)) return null;

            const isSelected = selectedIds.includes(el.id);

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
                  // Do not intercept if currently inline-editing text or locked
                  if (editingTextId === el.id || el.isLocked) return;

                  if (isTouchFriendly) {
                    // Mobile Touch Friendly Mode:
                    // DO NOT intercept scroll gestures or drag elements on mobile!
                    // Tapping selects element and opens quick tools
                    e.stopPropagation();
                    selectElement(el.id);

                    if (el.type === 'text') {
                      setTextEditModalElementId(el.id);
                    }
                    return;
                  }

                  // 1. Shift or Ctrl/Cmd multi-selection or isMultiSelectMode
                  if (e.shiftKey || e.ctrlKey || e.metaKey || isMultiSelectMode) {
                    e.stopPropagation();
                    toggleSelectElement(el.id);
                    return;
                  }

                  e.stopPropagation();

                  // Check if multiple elements overlap at this click coordinate
                  const canvasNode = canvasRef.current;
                  const rect = canvasNode?.getBoundingClientRect();
                  const clickX = rect ? (e.clientX - rect.left) / zoom : el.x;
                  const clickY = rect ? (e.clientY - rect.top) / zoom : el.y;

                  const overlappingAtPoint = elements
                    .filter(
                      (other) =>
                        !other.isLocked &&
                        !hiddenElementIds.includes(other.id) &&
                        clickX >= other.x &&
                        clickX <= other.x + other.width &&
                        clickY >= other.y &&
                        clickY <= other.y + other.height
                    )
                    .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

                  const wasAlreadySelected = selectedId === el.id;
                  const isPartOfMulti = selectedIds.length > 1 && selectedIds.includes(el.id);

                  if (!isPartOfMulti) {
                    selectElement(el.id);
                    const node = e.currentTarget;
                    setMoveableTarget(node);
                  }

                  const node = e.currentTarget;

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

                    if (isPartOfMulti) {
                      selectedIds.forEach((id) => {
                        const targetNode = document.getElementById(`canvas-node-${id}`);
                        const targetEl = elements.find((item) => item.id === id);
                        if (targetNode && targetEl) {
                          targetNode.style.left = `${Math.round(targetEl.x + dx)}px`;
                          targetNode.style.top = `${Math.round(targetEl.y + dy)}px`;
                        }
                      });
                    } else {
                      const nextX = Math.round(origX + dx);
                      const nextY = Math.round(origY + dy);
                      node.style.left = `${nextX}px`;
                      node.style.top = `${nextY}px`;
                    }
                  };

                  const onPointerUp = (upEvt: PointerEvent) => {
                    window.removeEventListener('pointermove', onPointerMove);
                    window.removeEventListener('pointerup', onPointerUp);

                    if (hasDragged) {
                      const dx = (upEvt.clientX - startX) / zoom;
                      const dy = (upEvt.clientY - startY) / zoom;
                      if (isPartOfMulti) {
                        const batchUpdates = selectedIds.map((id) => {
                          const targetEl = elements.find((item) => item.id === id);
                          return {
                            id,
                            updates: {
                              x: Math.round((targetEl?.x || 0) + dx),
                              y: Math.round((targetEl?.y || 0) + dy),
                            },
                          };
                        });
                        updateElementsBatch(batchUpdates, true);
                      } else {
                        const nextX = Math.round(origX + dx);
                        const nextY = Math.round(origY + dy);
                        updateElement(el.id, { x: nextX, y: nextY }, true);
                      }
                    } else {
                      // Tap without drag
                      // If user clicked again on an already selected element where 2+ layers overlap:
                      // Cycle to select the layer underneath!
                      if (wasAlreadySelected && overlappingAtPoint.length > 1) {
                        const curIdx = overlappingAtPoint.findIndex((item) => item.id === el.id);
                        const nextEl = overlappingAtPoint[(curIdx + 1) % overlappingAtPoint.length];
                        selectElement(nextEl.id);
                        setMoveableTarget(document.getElementById(`canvas-node-${nextEl.id}`));
                      }
                    }
                  };

                  window.addEventListener('pointermove', onPointerMove);
                  window.addEventListener('pointerup', onPointerUp);
                }}
                className={`absolute transition-all ${
                  el.isLocked
                    ? 'pointer-events-none opacity-80'
                    : isTouchFriendly
                    ? isSelected
                      ? el.type === 'image'
                        ? 'ring-2 ring-red-500 shadow-2xl rounded-2xl'
                        : 'ring-2 ring-amber-500 shadow-lg'
                      : 'hover:ring-1 hover:ring-rose-200'
                    : isSelected
                    ? selectedIds.length > 1
                      ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-stone-900 shadow-xl cursor-move'
                      : 'ring-2 ring-blue-500 shadow-lg cursor-move'
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
                  pointerEvents: el.isLocked ? 'none' : undefined,
                }}
              >
                {/* Multi-Selection Checkmark Badge */}
                {selectedIds.length > 1 && isSelected && (
                  <div
                    data-export-ignore="true"
                    className="absolute -top-3 -left-3 bg-blue-600 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-stone-900 z-40 pointer-events-none animate-in zoom-in-75 duration-150"
                  >
                    ✓
                  </div>
                )}
                {/* In-Place Floating Image Toolbar on Mobile when Selected */}
                {isTouchFriendly && isSelected && el.type === 'image' && (
                  <div
                    data-export-ignore="true"
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
                      onClick={() => duplicateElement(el.id)}
                      className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 active:scale-95"
                      title="Nhân bản ảnh"
                    >
                      <Copy className="w-3.5 h-3.5" />
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
                      onClick={() => removeElement(el.id)}
                      className="p-1.5 rounded-xl bg-red-50 text-red-500 active:scale-95"
                      title="Xoá ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => selectElement(null)}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium text-xs active:scale-95"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}

                {/* In-Place Floating Toolbar on Mobile for Other Elements (Text, Graphic, Shape) */}
                {isTouchFriendly && isSelected && el.type !== 'image' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 flex items-center justify-center gap-1.5 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl rounded-2xl animate-in fade-in whitespace-nowrap"
                  >
                    {el.type === 'text' && (
                      <button
                        onClick={() => setTextEditModalElementId(el.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 font-bold text-xs flex items-center gap-1 active:scale-95"
                      >
                        <span>Sửa chữ</span>
                      </button>
                    )}

                    <button
                      onClick={() => duplicateElement(el.id)}
                      className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 active:scale-95"
                      title="Nhân bản"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => bringToFront(el.id)}
                      className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 active:scale-95"
                      title="Lên trên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => sendToBack(el.id)}
                      className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 active:scale-95"
                      title="Xuống dưới"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removeElement(el.id)}
                      className="p-1.5 rounded-xl bg-red-50 text-red-500 active:scale-95"
                      title="Xoá phần tử"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => selectElement(null)}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium text-xs active:scale-95"
                    >
                      Xong
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

                {/* Direct Native Resize Handles for Selected Element (Touch Mobile only) */}
                {isTouchFriendly && isSelected && !el.isLocked && (
                  <div data-export-ignore="true">
                    {/* 4 Corners */}
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 'nw')}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md z-30 cursor-nwse-resize hover:scale-125 transition-transform"
                      title="Kéo để đổi kích thước"
                    />
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 'ne')}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md z-30 cursor-nesw-resize hover:scale-125 transition-transform"
                      title="Kéo để đổi kích thước"
                    />
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 'se')}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md z-30 cursor-nwse-resize hover:scale-125 transition-transform"
                      title="Kéo để đổi kích thước"
                    />
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 'sw')}
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md z-30 cursor-nesw-resize hover:scale-125 transition-transform"
                      title="Kéo để đổi kích thước"
                    />

                    {/* 4 Edges */}
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 'n')}
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-blue-500 rounded-full shadow-xs z-30 cursor-ns-resize hover:scale-125 transition-transform"
                      title="Kéo chỉnh chiều cao"
                    />
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 's')}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-blue-500 rounded-full shadow-xs z-30 cursor-ns-resize hover:scale-125 transition-transform"
                      title="Kéo chỉnh chiều cao"
                    />
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 'w')}
                      className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2 h-6 bg-white border border-blue-500 rounded-full shadow-xs z-30 cursor-ew-resize hover:scale-125 transition-transform"
                      title="Kéo chỉnh chiều rộng"
                    />
                    <div
                      onPointerDown={(e) => handleNativeResize(e, el, 'e')}
                      className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2 h-6 bg-white border border-blue-500 rounded-full shadow-xs z-30 cursor-ew-resize hover:scale-125 transition-transform"
                      title="Kéo chỉnh chiều rộng"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Moveable Bounding Box Controller with Smart Snapping Guidelines (Desktop only) */}
          {!isTouchFriendly && selectedIds.length === 1 && selectedId && moveableTarget && !selectedEl?.isLocked && (
            <DynamicMoveable
              ref={moveableRef}
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
              onDragStart={({ set, target }: any) => {
                const left = parseFloat(target.style.left) || 0;
                const top = parseFloat(target.style.top) || 0;
                set([left, top]);
              }}
              onDrag={({ target, left, top }: any) => {
                target.style.left = `${left}px`;
                target.style.top = `${top}px`;
              }}
              onDragEnd={({ target, isDrag }: any) => {
                if (!isDrag) return;
                const left = parseFloat(target.style.left);
                const top = parseFloat(target.style.top);
                if (!isNaN(left) && !isNaN(top)) {
                  updateElement(selectedId, { x: Math.round(left), y: Math.round(top) }, true);
                }
              }}
              onResizeStart={({ dragStart, target }: any) => {
                const left = parseFloat(target.style.left) || 0;
                const top = parseFloat(target.style.top) || 0;
                dragStart && dragStart.set([left, top]);
              }}
              onResize={({ target, width, height, drag }: any) => {
                target.style.width = `${width}px`;
                target.style.height = `${height}px`;
                target.style.left = `${drag.left}px`;
                target.style.top = `${drag.top}px`;
              }}
              onResizeEnd={({ target }: any) => {
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
              onRotate={({ target, rotation }: any) => {
                target.style.transform = `rotate(${rotation}deg)`;
              }}
              onRotateEnd={({ target }: any) => {
                const match = target.style.transform.match(/rotate\(([-\d.]+)deg\)/);
                const rot = match ? Math.round(parseFloat(match[1])) : 0;
                updateElement(selectedId, { rotation: ((rot % 360) + 360) % 360 }, true);
              }}
            />
          )}

          {/* Moveable Controller for Multiple Elements Selection Group */}
          {!isTouchFriendly && selectedIds.length > 1 && moveableTargets.length > 0 && (
            <DynamicMoveable
              ref={moveableRef}
              target={moveableTargets}
              container={typeof document !== 'undefined' ? (document.getElementById('studio-main-canvas') as HTMLElement | null) : null}
              draggable={true}
              resizable={false}
              rotatable={false}
              origin={false}
              zoom={zoom}
              onDragGroupStart={({ events }: any) => {
                events.forEach((ev: any) => {
                  const left = parseFloat(ev.target.style.left) || 0;
                  const top = parseFloat(ev.target.style.top) || 0;
                  ev.set([left, top]);
                });
              }}
              onDragGroup={({ events }: any) => {
                events.forEach((ev: any) => {
                  ev.target.style.left = `${ev.left}px`;
                  ev.target.style.top = `${ev.top}px`;
                });
              }}
              onDragGroupEnd={({ targets, isDrag }: any) => {
                if (!isDrag) return;
                const batchUpdates = targets.map((t: HTMLElement) => {
                  const id = t.id.replace('canvas-node-', '');
                  const left = parseFloat(t.style.left);
                  const top = parseFloat(t.style.top);
                  return { id, updates: { x: Math.round(left), y: Math.round(top) } };
                });
                updateElementsBatch(batchUpdates, true);
              }}
            />
          )}

          {/* FLOATING GROUP ACTION TOOLBAR FOR MULTI-SELECTION */}
          {!isTouchFriendly && selectedIds.length > 1 && groupBounds && (
            <div
              data-export-ignore="true"
              className="absolute z-50 flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl rounded-2xl px-3 py-1.5 gap-1.5 text-stone-700 dark:text-stone-200 animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${Math.max(10, Math.min(canvas.width - 340, groupBounds.minX + groupBounds.width / 2 - 170))}px`,
                top: `${groupBounds.minY > 60 ? groupBounds.minY - 56 : groupBounds.maxY + 16}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 mr-1 shrink-0">
                ✓ {selectedIds.length} khối
              </span>

              {/* Align Left */}
              <button
                type="button"
                onClick={() => alignSelectedElements('left')}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-600 dark:text-stone-300"
                title="Căn lề trái toàn bộ nhóm"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>

              {/* Align Center */}
              <button
                type="button"
                onClick={() => alignSelectedElements('center')}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-600 dark:text-stone-300"
                title="Căn giữa ngang toàn bộ nhóm"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              {/* Align Right */}
              <button
                type="button"
                onClick={() => alignSelectedElements('right')}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-600 dark:text-stone-300"
                title="Căn lề phải toàn bộ nhóm"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-stone-200 dark:bg-stone-700 mx-0.5" />

              {/* Shift Down +50px */}
              <button
                type="button"
                onClick={() => pushSelectedElements(50)}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-600 dark:text-stone-300"
                title="Đẩy cả nhóm xuống +50px"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
              </button>

              {/* Shift Up -50px */}
              <button
                type="button"
                onClick={() => pushSelectedElements(-50)}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-600 dark:text-stone-300"
                title="Kéo cả nhóm lên -50px"
              >
                <ArrowUpToLine className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-stone-200 dark:bg-stone-700 mx-0.5" />

              {/* Duplicate Group */}
              <button
                type="button"
                onClick={() => duplicateSelectedElements()}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-600 dark:text-stone-300"
                title="Nhân bản cả nhóm"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* Delete Group */}
              <button
                type="button"
                onClick={() => removeSelectedElements()}
                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                title="Xóa cả nhóm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Deselect */}
              <button
                type="button"
                onClick={() => selectElement(null)}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
                title="Bỏ chọn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* FLOATING MINI ACTION TOOLBAR DIRECTLY ABOVE THE SELECTED ELEMENT (Desktop only) */}
          {!isTouchFriendly && selectedEl && selectedIds.length <= 1 && (() => {
            const overlappingBelow = elements.filter(
              (other) =>
                other.id !== selectedEl.id &&
                !other.isLocked &&
                !hiddenElementIds.includes(other.id) &&
                !(
                  other.x >= selectedEl.x + selectedEl.width ||
                  other.x + other.width <= selectedEl.x ||
                  other.y >= selectedEl.y + selectedEl.height ||
                  other.y + other.height <= selectedEl.y
                )
            ).sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

            return (
              <div
                data-export-ignore="true"
                className="absolute z-50 flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl rounded-full px-2 py-1 gap-1 text-stone-700 dark:text-stone-200 transition-all"
                style={{
                  left: `${Math.max(10, selectedEl.x + selectedEl.width / 2 - 100)}px`,
                  top: `${selectedEl.y > 60 ? selectedEl.y - 52 : selectedEl.y + selectedEl.height + 14}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Lock / Unlock Toggle */}
                <button
                  onClick={() => {
                    updateElement(selectedEl.id, { isLocked: !selectedEl.isLocked }, true);
                    if (!selectedEl.isLocked) {
                      selectElement(null);
                    }
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    selectedEl.isLocked
                      ? 'bg-amber-100 text-amber-700'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                  title={selectedEl.isLocked ? 'Mở khóa phần tử' : 'Khóa đối tượng (chống click nhầm)'}
                >
                  {selectedEl.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                {/* Overlapping Layer Selector Button: Selects layer beneath */}
                {overlappingBelow.length > 0 && (
                  <button
                    onClick={() => {
                      const nextEl = overlappingBelow[0];
                      if (nextEl) {
                        selectElement(nextEl.id);
                        setMoveableTarget(document.getElementById(`canvas-node-${nextEl.id}`));
                      }
                    }}
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-full transition-colors flex items-center gap-1 font-semibold text-[11px] shadow-2xs"
                    title={`Có ${overlappingBelow.length} lớp đè bên dưới. Bấm để chọn lớp dưới!`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Lớp dưới</span>
                  </button>
                )}

                <button
                  onClick={() => duplicateElement(selectedEl.id)}
                  className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                  title="Nhân bản (Ctrl+D)"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const pushAmount = selectedEl.height + 24;
                    pushElementsBelow(selectedEl.y + selectedEl.height - 10, pushAmount, true);
                  }}
                  className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 rounded-full transition-colors"
                  title="Đẩy các mục bên dưới xuống (Dãn cách để chèn mục - Alt+Down)"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const pullAmount = -(selectedEl.height + 24);
                    pushElementsBelow(selectedEl.y + selectedEl.height - 10, pullAmount, true);
                  }}
                  className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 rounded-full transition-colors"
                  title="Kéo các mục bên dưới lên (Thu gọn - Alt+Up)"
                >
                  <ArrowUpToLine className="w-3.5 h-3.5" />
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
                    <div className="absolute top-8 left-0 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl p-1 text-xs space-y-0.5 z-50">
                      <button
                        onClick={() => {
                          pushElementsBelow(selectedEl.y + selectedEl.height - 10, 50, true);
                          setShowLayerMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500" />
                        <span>Đẩy xuống +50px</span>
                      </button>
                      <button
                        onClick={() => {
                          pushElementsBelow(selectedEl.y + selectedEl.height - 10, 150, true);
                          setShowLayerMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500" />
                        <span>Đẩy xuống +150px</span>
                      </button>
                      <button
                        onClick={() => {
                          pushElementsBelow(selectedEl.y + selectedEl.height - 10, -50, true);
                          setShowLayerMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                      >
                        <ArrowUpToLine className="w-3.5 h-3.5 text-stone-500" />
                        <span>Kéo lên -50px</span>
                      </button>
                      <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />
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
            );
          })()}

          {/* FLOATING ACTION TOOLBAR FOR MULTI-SELECTION GROUP */}
          {!isTouchFriendly && selectedIds.length > 1 && (() => {
            const selectedEls = elements.filter((e) => selectedIds.includes(e.id));
            if (selectedEls.length <= 1) return null;
            const groupMinX = Math.min(...selectedEls.map((e) => e.x));
            const groupMaxX = Math.max(...selectedEls.map((e) => e.x + e.width));
            const groupMinY = Math.min(...selectedEls.map((e) => e.y));
            const groupMaxY = Math.max(...selectedEls.map((e) => e.y + e.height));
            const groupW = groupMaxX - groupMinX;

            return (
              <div
                data-export-ignore="true"
                className="absolute z-50 flex items-center bg-stone-900 text-white border border-stone-700 shadow-2xl rounded-full px-3 py-1.5 gap-2 text-xs font-medium animate-in fade-in"
                style={{
                  left: `${Math.max(10, groupMinX + groupW / 2 - 140)}px`,
                  top: `${groupMinY > 60 ? groupMinY - 52 : groupMaxY + 14}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="font-bold text-blue-400 whitespace-nowrap">
                  ✨ Đã chọn {selectedIds.length} khối
                </span>
                <div className="w-px h-4 bg-stone-700" />
                <button
                  onClick={() => alignSelectedElements('center')}
                  className="hover:text-blue-300 flex items-center gap-1 p-1 hover:bg-stone-800 rounded-md transition-colors"
                  title="Canh giữa các khối đang chọn"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>Canh giữa</span>
                </button>
                <button
                  onClick={() => duplicateSelectedElements()}
                  className="hover:text-blue-300 flex items-center gap-1 p-1 hover:bg-stone-800 rounded-md transition-colors"
                  title="Nhân bản các khối đang chọn (Ctrl+D)"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nhân bản</span>
                </button>
                <button
                  onClick={() => removeSelectedElements()}
                  className="hover:text-red-400 flex items-center gap-1 text-red-300 p-1 hover:bg-stone-800 rounded-md transition-colors"
                  title="Xóa các khối đang chọn (Delete)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
                <div className="w-px h-4 bg-stone-700" />
                <button
                  onClick={() => selectElement(null)}
                  className="px-2 py-0.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
                >
                  Bỏ chọn
                </button>
              </div>
            );
          })()}

          {/* RIGHT-CLICK CONTEXT MENU: PICK ANY OVERLAPPING LAYER DIRECTLY */}
          {contextMenu && (
            <div
              data-export-ignore="true"
              className="absolute z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl rounded-2xl p-2 min-w-[240px] max-w-xs animate-in fade-in"
              style={{
                left: `${Math.min(canvas.width - 250, Math.max(10, contextMenu.x))}px`,
                top: `${Math.min(canvas.height - 240, Math.max(10, contextMenu.y))}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between border-b border-stone-100 dark:border-stone-800 mb-1">
                <span>Chọn lớp ({contextMenu.elements.length})</span>
                <span className="text-[10px] text-stone-400">z-Index</span>
              </div>
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {contextMenu.elements.map((item) => {
                  const isCurrent = selectedIds.includes(item.id);
                  const name =
                    item.type === 'text'
                      ? `"${item.text?.slice(0, 22) || 'Văn bản'}"`
                      : item.type === 'image'
                      ? 'Ảnh cưới'
                      : item.type === 'graphic'
                      ? 'Họa tiết'
                      : item.type === 'shape'
                      ? 'Hình khối'
                      : 'Tiện ích';

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        selectElement(item.id);
                        setContextMenu(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-600 font-bold dark:bg-blue-950/60 dark:text-blue-400'
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {item.type === 'text' && <Type className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                        {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {item.type === 'graphic' && <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                        {item.type === 'widget' && <LayoutGrid className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        {item.type === 'shape' && <Square className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        <span className="truncate">{name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 ml-2 shrink-0">z:{item.zIndex}</span>
                    </button>
                  );
                })}
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

      {/* FLOATING ZOOM & SCREEN GUIDES CONTROLLER */}
      <div className="fixed right-3 md:right-84 bottom-20 md:bottom-28 z-30 flex flex-col items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full shadow-lg p-1.5 text-stone-600 dark:text-stone-300 gap-1">
        {/* Toggle Multi-Select Mode Button */}
        <button
          onClick={() => toggleMultiSelectMode()}
          className={`p-1.5 rounded-full transition-all ${
            isMultiSelectMode
              ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 animate-pulse'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'
          }`}
          title={
            isMultiSelectMode
              ? 'Đang bật chế độ chọn nhiều khối (Bấm để tắt)'
              : 'Bật chế độ chọn nhiều khối (Click từng khối để chọn nhiều)'
          }
        >
          <CheckSquare className="w-4 h-4" />
        </button>
        <div className="w-3.5 h-[1px] bg-stone-200 dark:bg-stone-700 my-0.5" />
        <button
          onClick={() => setShowScreenGuides(!showScreenGuides)}
          className={`p-1.5 rounded-full transition-all ${
            showScreenGuides
              ? 'bg-rose-500 text-white shadow-xs'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'
          }`}
          title={showScreenGuides ? 'Ẩn khung phân trang màn hình (850px)' : 'Hiện khung phân trang màn hình (850px)'}
        >
          <Smartphone className="w-4 h-4" />
        </button>
        <div className="w-3.5 h-[1px] bg-stone-200 dark:bg-stone-700 my-0.5" />
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
