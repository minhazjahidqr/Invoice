
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { getFromStorage, saveToStorage, type Quotation, type Invoice, type Client } from '@/lib/data';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatCurrency } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

const statusVariant: { [key in Quotation['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Approved: 'default',
  Sent: 'secondary',
  Draft: 'outline',
  Rejected: 'destructive',
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadData = () => {
      setQuotations(getFromStorage('quotations', []));
      setClients(getFromStorage('clients', []));
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const updateQuotations = (newQuotations: Quotation[]) => {
    setQuotations(newQuotations);
    saveToStorage('quotations', newQuotations);
    window.dispatchEvent(new Event('storage'));
  };

  const handleStatusChange = (quotationId: string, newStatus: Quotation['status']) => {
    const newQuotations = quotations.map(quo =>
      quo.id === quotationId ? { ...quo, status: newStatus } : quo
    );
    updateQuotations(newQuotations);
    toast({
      title: 'Quotation Status Updated',
      description: `Quotation ${quotationId} has been marked as ${newStatus}.`
    });
  };

  const handleConvertToInvoice = (quotation: Quotation) => {
    const existingInvoices = getFromStorage<Invoice[]>('invoices', []);
    const newInvoiceId = `INV-${new Date().getFullYear()}-${String(existingInvoices.length + 1).padStart(3, '0')}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

    const newInvoice: Invoice = {
        id: newInvoiceId,
        quotationId: quotation.id,
        clientId: quotation.clientId,
        projectName: quotation.projectName,
        date: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        total: quotation.total,
        status: 'Draft',
        items: quotation.items || [],
    };

    const updatedInvoices = [newInvoice, ...existingInvoices];
    saveToStorage('invoices', updatedInvoices);
    window.dispatchEvent(new Event('storage'));

    toast({
        title: 'Invoice Created',
        description: `Invoice ${newInvoiceId} has been created from Quotation ${quotation.id}.`,
    });

    router.push(`/invoices/${newInvoiceId}`);
  };
  
  const handleDownloadPdf = (quotationId: string) => {
    router.push(`/quotations/${quotationId}`);
  };

  const handleDeleteQuotation = (quotationId: string) => {
    const quotationToDelete = quotations.find(q => q.id === quotationId);
    if (!quotationToDelete) return;

    const newQuotations = quotations.filter(q => q.id !== quotationId);
    updateQuotations(newQuotations);

    toast({
        title: 'Quotation Deleted',
        description: `Quotation "${quotationToDelete.id}" has been permanently deleted.`,
        variant: 'destructive',
    });
  };
  
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }


  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Quotations</CardTitle>
          <CardDescription>
            Manage your quotations and track their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  ID
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Project</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="hidden font-medium sm:table-cell">
                    <Link href={`/quotations/${quotation.id}`} className="hover:underline">
                        {quotation.id}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{getClientName(quotation.clientId)}</TableCell>
                  <TableCell className="hidden md:table-cell">{quotation.projectName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={statusVariant[quotation.status]}>
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(quotation.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(quotation.total)}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                              <Link href={`/quotations/${quotation.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleConvertToInvoice(quotation)}>Convert to Invoice</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(quotation.id)}>Download PDF</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(quotation.id, 'Sent')}>Mark as Sent</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(quotation.id, 'Approved')}>Mark as Approved</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(quotation.id, 'Rejected')}>Mark as Rejected</DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                           </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the quotation
                              &quot;{quotation.id}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuotation(quotation.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{quotations.length}</strong> of <strong>{quotations.length}</strong> quotations
          </div>
        </CardFooter>
      </Card>
    </AppLayout>
  );
}
