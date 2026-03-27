'use client';

import { QRCodeSVG } from 'qrcode.react';

interface Props {
  text: string;
  label: string;
  onClose: () => void;
}

export default function QRModal({ text, label, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3">
          <QRCodeSVG value={text} size={240} bgColor="#161b22" fgColor="#e6edf3" level="M" className="mx-auto" />
        </div>
        <p className="text-[11px] text-[--text-secondary] mb-1">{label}</p>
        <p className="mono text-[10px] text-[--text-primary] break-all max-h-16 overflow-auto">{text}</p>
        <button onClick={onClose} className="btn btn-secondary mt-3">Close</button>
      </div>
    </div>
  );
}
