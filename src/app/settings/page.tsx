import { AppLayout } from '@/components/app-layout';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="font-headline text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Customize your experience, manage your company profile, and set up integrations. This feature is currently under construction.
        </p>
      </div>
    </AppLayout>
  );
}
