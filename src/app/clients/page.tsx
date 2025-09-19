import { AppLayout } from '@/components/app-layout';

export default function ClientsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="font-headline text-3xl font-semibold">Clients</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
            A dedicated space to manage all your client information, contact details, and history is coming soon.
        </p>
      </div>
    </AppLayout>
  );
}
