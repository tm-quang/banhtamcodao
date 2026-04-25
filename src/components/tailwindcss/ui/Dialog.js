/**
 * Dialog component với Tailwind CSS và Headless UI
 * Cần cài đặt: npm install @headlessui/react
 */
'use client';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

export function Dialog({ 
  open, 
  onClose, 
  title, 
  children,
  size = 'md',
  showCloseButton = true,
  footer
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Dialog Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={`
                  w-full ${sizes[size]}
                  transform overflow-hidden rounded-3xl
                  bg-white shadow-2xl transition-all
                  flex flex-col max-h-[90vh]
                `}
              >
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 md:py-5 flex-shrink-0 bg-white">
                    {typeof title === 'string' ? (
                      <HeadlessDialog.Title className="text-xl font-bold text-gray-900 tracking-tight">
                        {title}
                      </HeadlessDialog.Title>
                    ) : (
                      <HeadlessDialog.Title as="div" className="text-xl font-bold text-gray-900 tracking-tight">
                        {title}
                      </HeadlessDialog.Title>
                    )}
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-90"
                      >
                        <X size={22} />
                      </button>
                    )}
                  </div>
                )}
 
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                  {children}
                </div>
 
                {/* Footer */}
                {footer && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 md:py-5 flex-shrink-0">
                    {footer}
                  </div>
                )}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

