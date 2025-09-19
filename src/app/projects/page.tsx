import { AppLayout } from '@/components/app-layout';

export default function ProjectsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="font-headline text-3xl font-semibold">Projects</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Track all your projects from start to finish. This section will link quotations and invoices to specific projects. Coming soon!
        </p>
      </div>
    </AppLayout>
  );
}
