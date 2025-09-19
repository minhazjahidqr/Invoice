import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeForm } from './theme-form';

export default function SettingsPage() {
  return (
    <AppLayout>
       <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
            <CardDescription>
              Customize the look and feel of your application. Changes are saved locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
