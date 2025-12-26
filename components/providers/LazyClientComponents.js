"use client";

import dynamic from 'next/dynamic';

// Lazy load heavy components
const ToastProvider = dynamic(() => import('./ToastProvider'), {
  ssr: false,
});



export default function LazyClientComponents() {
  return (
    <>
      <ToastProvider />
    </>
  );
}
