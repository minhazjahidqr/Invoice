
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './settings-form';

export default function SettingsPage() {
  return (
    <AppLayout>
       <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application and document settings.</p>
        
        <div className="mt-4">
            <SettingsForm />
        </div>

      </div>
    </AppLayout>
  );
}
