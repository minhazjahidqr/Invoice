import { AppLayout } from '@/components/app-layout';
import { QuotationForm } from './quotation-form';
import { mockClients, mockProjects } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewQuotationPage() {
  return (
    <AppLayout>
      <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            Create Quotation
          </h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
                <CardDescription>Fill out the details below to create a new quotation.</CardDescription>
            </CardHeader>
            <CardContent>
                 <QuotationForm clients={mockClients} projects={mockProjects} />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
