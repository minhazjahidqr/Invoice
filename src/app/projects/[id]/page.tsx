
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { getData, subscribeToCollection, type Project, type Client, type Quotation, type Invoice } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const quotationStatusVariant: { [key in Quotation['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Approved: 'default',
  Sent: 'secondary',
  Draft: 'outline',
  Rejected: 'destructive',
};

const invoiceStatusVariant: { [key in Invoice['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Paid: 'default',
  Sent: 'secondary',
  Draft: 'outline',
  Overdue: 'destructive',
  Pending: 'secondary',
};


export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjectData() {
      const projectData = await getData<Project>('projects', params.id);
      setProject(projectData);
      
      if (projectData) {
        const clientData = await getData<Client>('clients', projectData.clientId);
        setClient(clientData);
      }
      setLoading(false);
    }
    loadProjectData();
    
    const unsubQuotations = subscribeToCollection<Quotation>('quotations', (data) => {
        setQuotations(data.filter(q => q.projectName === project?.name));
    });

    const unsubInvoices = subscribeToCollection<Invoice>('invoices', (data) => {
        setInvoices(data.filter(i => i.projectName === project?.name));
    });

    return () => {
        unsubQuotations();
        unsubInvoices();
    }
  }, [params.id, project?.name]);

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h1 className="font-headline text-2xl mt-4">Loading Project...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the project details.</p>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center p-8">
          <h1 className="font-headline text-2xl mt-4">Project Not Found</h1>
          <p className="text-muted-foreground">The project you are looking for does not exist.</p>
          <Button asChild className="mt-4">
            <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Projects</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Projects</Link>
            </Button>
            <h1 className="font-headline text-3xl font-bold">{project.name}</h1>
            <p className="text-lg text-muted-foreground">Client: <Link href={`/clients/${client?.id}`} className="text-primary hover:underline">{client?.name}</Link></p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Quotations</CardTitle>
                    <CardDescription>All quotations associated with this project.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotations.map(q => (
                                    <TableRow key={q.id}>
                                        <TableCell>
                                            <Link href={`/quotations/${q.id}`} className="font-medium hover:underline">{q.id}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={quotationStatusVariant[q.status]}>{q.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(q.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     {quotations.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No quotations for this project yet.
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>All invoices associated with this project.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map(i => (
                                    <TableRow key={i.id}>
                                        <TableCell>
                                            <Link href={`/invoices/${i.id}`} className="font-medium hover:underline">{i.id}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={invoiceStatusVariant[i.status]}>{i.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(i.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                      {invoices.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No invoices for this project yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
