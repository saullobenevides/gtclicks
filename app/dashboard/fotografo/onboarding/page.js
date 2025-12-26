import clsx from 'clsx';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import OnboardingWizard from '@/features/photographer/components/FotografoOnboarding';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) redirect('/dashboard/fotografo'); // Should be a photographer to be here

  // If already has key info, maybe redirect to dashboard? 
  // For now let's allow editing by visiting this page manually or via initial flow.

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
       <OnboardingWizard initialData={fotografo} />
    </div>
  );
}
