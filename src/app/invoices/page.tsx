
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { subscribeToCollection, updateData, deleteData, type Invoice, type Client } from '@/lib/data';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { InvoiceForm } from './invoice-form';
import { useRouter } from 'next/navigation';

const statusVariant: { [key in Invoice['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Paid: 'default',
  Sent: 'secondary',
  Draft: 'outline',
  Overdue: 'destructive',
  Pending: 'secondary',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);

  useEffect(() => {
    const unsubInvoices = subscribeToCollection<Invoice>('invoices', setInvoices);
    const unsubClients = subscribeToCollection<Client>('clients', setClients);
    return () => {
      unsubInvoices();
      unsubClients();
    };
  }, []);
  
  const handleInvoiceSave = async (invoiceToSave: Invoice) => {
    try {
      await updateData('invoices', invoiceToSave.id, invoiceToSave);
      toast({
        title: 'Invoice Saved',
        description: `Invoice ${invoiceToSave.id} has been updated.`,
      });
      setFormDialogOpen(false);
      setEditingInvoice(undefined);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save invoice.',
        variant: 'destructive'
      });
    }
  };

  const handleEditClick = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormDialogOpen(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);
    if (!invoiceToDelete) return;
    try {
      await deleteData('invoices', invoiceId);
      toast({
        title: 'Invoice Deleted',
        description: `Invoice ${invoiceToDelete.id} has been deleted.`,
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete invoice.',
        variant: 'destructive'
      });
    }
  }
  
  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      await updateData('invoices', invoiceId, { status: newStatus });
      toast({
        title: 'Invoice Status Updated',
        description: `Invoice ${invoiceId} has been marked as ${newStatus}.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive'
      });
    }
  };
  
  const handleDownloadPdf = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }

  return (
    <AppLayout>
      <Dialog open={formDialogOpen} onOpenChange={(isOpen) => {
        setFormDialogOpen(isOpen);
        if (!isOpen) setEditingInvoice(undefined);
      }}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Invoices</CardTitle>
            <CardDescription>
              Manage your invoices and track payments.
            </CardDescription>
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
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="hidden font-medium sm:table-cell">
                         <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                            {invoice.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getClientName(invoice.clientId)}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={statusVariant[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
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
                              <DropdownMenuItem asChild><Link href={`/invoices/${invoice.id}`}>View Details</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(invoice)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>Download PDF</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Paid')}>Mark as Paid</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Sent')}>Mark as Sent</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Pending')}>Mark as Pending</DropdownMenuItem>
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
                                  This action cannot be undone. This will permanently delete the invoice
                                  &quot;{invoice.id}&quot;.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)}>
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
              Showing <strong>1-{invoices.length}</strong> of <strong>{invoices.length}</strong> invoices
            </div>
          </CardFooter>
        </Card>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
                Update the details for invoice {editingInvoice?.id}.
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm 
            invoice={editingInvoice} 
            clients={clients} 
            onSave={handleInvoiceSave} 
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
