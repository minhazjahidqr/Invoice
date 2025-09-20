
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { subscribeToCollection, updateData, deleteData, addData, type Quotation, type Invoice, type Client } from '@/lib/data';
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
    const unsubQuotations = subscribeToCollection<Quotation>('quotations', setQuotations);
    const unsubClients = subscribeToCollection<Client>('clients', setClients);
    return () => {
      unsubQuotations();
      unsubClients();
    };
  }, []);

  const handleStatusChange = async (quotationId: string, newStatus: Quotation['status']) => {
    try {
      await updateData('quotations', quotationId, { status: newStatus });
      toast({
        title: 'Quotation Status Updated',
        description: `Quotation ${quotationId} has been marked as ${newStatus}.`
      });
    } catch(error) {
      toast({
        title: 'Error',
        description: 'Failed to update quotation status.',
        variant: 'destructive',
      });
    }
  };

  const handleConvertToInvoice = async (quotation: Quotation) => {
    try {
      const newInvoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

      const newInvoice: Omit<Invoice, 'id'> = {
          quotationId: quotation.id,
          clientId: quotation.clientId,
          projectName: quotation.projectName,
          date: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          total: quotation.total,
          status: 'Draft',
          items: quotation.items || [],
      };

      const addedInvoice = await addData('invoices', newInvoice);

      toast({
          title: 'Invoice Created',
          description: `Invoice ${addedInvoice.id} has been created from Quotation ${quotation.id}.`,
      });

      router.push(`/invoices/${addedInvoice.id}`);
    } catch(error) {
       toast({
          title: 'Error',
          description: 'Failed to convert to invoice.',
          variant: 'destructive',
      });
    }
  };
  
  const handleDownloadPdf = (quotationId: string) => {
    router.push(`/quotations/${quotationId}`);
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    const quotationToDelete = quotations.find(q => q.id === quotationId);
    if (!quotationToDelete) return;

    try {
      await deleteData('quotations', quotationId);
      toast({
          title: 'Quotation Deleted',
          description: `Quotation "${quotationToDelete.id}" has been permanently deleted.`,
          variant: 'destructive',
      });
    } catch(error) {
      toast({
        title: 'Error',
        description: 'Failed to delete quotation.',
        variant: 'destructive',
      });
    }
  };
  
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }


  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-headline">Quotations</CardTitle>
              <CardDescription>
                Manage your quotations and track their status.
              </CardDescription>
            </div>
            <Button asChild className="w-full md:w-auto">
              <Link href="/quotations/new">Create New Quotation</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    ID
                  </TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Project</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">
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
                    <TableCell>
                      <div className="font-medium">{getClientName(quotation.clientId)}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{quotation.projectName}</div>
                      <div className="text-sm text-muted-foreground lg:hidden mt-1">
                          <Badge variant={statusVariant[quotation.status]}>
                              {quotation.status}
                          </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{quotation.projectName}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={statusVariant[quotation.status]}>
                        {quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(quotation.total)}</TableCell>
                    <TableCell className="text-right">
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
          </div>
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
