/**
 * Alert Modal Component - Thông báo chung
 * @file src/components/tailwindcss/ui/AlertModal.js
 */
'use client';

import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

export function AlertModal({ 
  open, 
  onClose, 
  title, 
  message, 
  type = 'info',
  showCloseButton = true
}) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
  };

  const iconColors = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  const Icon = icons[type] || Info;
  const iconColor = iconColors[type] || iconColors.info;

  const footer = (
    <div className="flex items-center justify-end">
      <Button 
        variant="primary" 
        onClick={onClose}
        className="!hover:bg-opacity-90"
      >
        OK
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      showCloseButton={showCloseButton}
      title={
        <div className={`flex items-center gap-2 ${iconColor}`}>
          <Icon size={22} />
          <span className="font-bold">{title || 'Thông báo'}</span>
        </div>
      }
      footer={footer}
    >
      <p className="text-gray-700">{message}</p>
    </Dialog>
  );
}

