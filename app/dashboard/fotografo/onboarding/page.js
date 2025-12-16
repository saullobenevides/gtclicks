'use client';

import { useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import FotografoOnboarding from '@/components/FotografoOnboarding';


export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <FotografoOnboarding 
        onSuccess={() => {
          router.push('/dashboard/fotografo');
          router.refresh();
        }} 
      />
    </div>
  );
}
