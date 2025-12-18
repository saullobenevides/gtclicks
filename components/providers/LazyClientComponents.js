
"use client";

import dynamic from 'next/dynamic';

const SlideCart = dynamic(() => import("@/components/SlideCart"), { ssr: false });
const Toaster = dynamic(() => import("@/components/ui/sonner").then(mod => mod.Toaster), { ssr: false });

export default function LazyClientComponents() {
  return (
    <>
      <SlideCart />
      <Toaster />
    </>
  );
}
