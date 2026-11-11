import { useEffect, useId, useRef, useState } from "react";
import { siteContent, type Memory } from "../content";
import { Icon } from "./Icons";

export function Lightbox({ photo, onClose }: { photo: Memory; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);
  const titleId = useId();
  const text = siteContent.momentsScreen;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="lightbox-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="lightbox" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="lightbox-header">
          <h2 id={titleId}>{photo.title}</h2>
          <button ref={closeRef} type="button" className="icon-button lightbox-close" onClick={onClose} aria-label={text.closeLabel}><Icon name="close" size={22} /></button>
        </div>
        <div className="lightbox-image-wrap">
          {failed ? <div className="lightbox-error"><Icon name="image" size={40} /><p>{text.imageLoadError}</p></div> : <img src={photo.src} alt={photo.alt} onError={() => setFailed(true)} />}
        </div>
        {photo.caption && <p className="lightbox-caption">{photo.caption}</p>}
      </div>
    </div>
  );
}
