/**
 * useModalA11y  -  モーダル共通のアクセシビリティフック.
 *
 * 提供する機能:
 *   1. ESC キーで onClose を呼ぶ
 *   2. body のスクロールロック
 *   3. open 時に initialFocusRef にフォーカス
 *   4. Tab キーでモーダル内をフォーカス循環（フォーカストラップ）
 *
 * 使い方:
 *   const dialogRef = useRef<HTMLDivElement>(null);
 *   const initialRef = useRef<HTMLButtonElement>(null);
 *   useModalA11y({ open: true, onClose, dialogRef, initialFocusRef: initialRef });
 *
 *   <div ref={dialogRef} role="dialog" aria-modal="true">
 *     <button ref={initialRef}>OK</button>
 *   </div>
 */

import { useEffect, type RefObject } from 'react';

interface UseModalA11yArgs {
  open: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalA11y({
  open,
  onClose,
  dialogRef,
  initialFocusRef,
}: UseModalA11yArgs): void {
  // body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // initial focus
  useEffect(() => {
    if (!open) return;
    const target = initialFocusRef?.current ?? dialogRef.current;
    if (!target) return;
    const t = setTimeout(() => target.focus({ preventScroll: true }), 0);
    return () => clearTimeout(t);
  }, [open, dialogRef, initialFocusRef]);

  // keyboard: ESC + Tab loop
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, dialogRef]);
}
