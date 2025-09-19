
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Receipt, ArrowUpRight, MoreHorizontal, DollarSign } from 'lucide-react';
import { mockInvoices, mockQuotations, saveInvoices, saveQuotations, type Quotation, type Invoice } from '@/lib/data';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Paid: 'default',
  Approved: 'default',
  Sent: 'secondary',
  Draft: 'outline',
  Overdue: 'destructive',
  Rejected: 'destructive',
  Pending: 'secondary'
};


export default function DashboardPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    setQuotations(mockQuotations);
    setInvoices(mockInvoices);

    const handleStorageChange = () => {
      // This is a bit of a hack to re-read from our "database" (localStorage)
      const newQuotations = JSON.parse(localStorage.getItem('quotations') || '[]');
      const newInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      setQuotations(newQuotations);
      setInvoices(newInvoices);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateQuotations = (newQuotations: Quotation[]) => {
    setQuotations(newQuotations);
    saveQuotations(newQuotations);
  };

  const updateInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    saveInvoices(newInvoices);
  }

  const handleQuotationStatusChange = (quotationId: string, newStatus: Quotation['status']) => {
    const newQuotations = quotations.map(quo =>
      quo.id === quotationId ? { ...quo, status: newStatus } : quo
    );
    updateQuotations(newQuotations);
    toast({
      title: 'Quotation Status Updated',
      description: `Quotation ${quotationId} has been marked as ${newStatus}.`
    });
  };
  
  const handleInvoiceStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    const newInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: newStatus } : inv
    );
    updateInvoices(newInvoices);
    toast({
      title: 'Invoice Status Updated',
      description: `Invoice ${invoiceId} has been marked as ${newStatus}.`
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      if (date?.from && date?.to) {
        return invoiceDate >= date.from && invoiceDate <= date.to;
      }
      return true;
  });

  const filteredQuotations = quotations.filter(quotation => {
    const quotationDate = new Date(quotation.date);
    if (date?.from && date?.to) {
      return quotationDate >= date.from && quotationDate <= date.to;
    }
    return true;
  });

  const recentActivity: (Quotation | Invoice)[] = [...filteredQuotations, ...filteredInvoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  const totalRevenue = filteredInvoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.total, 0);
  const pendingAmount = filteredInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue' || i.status === 'Pending').reduce((acc, i) => acc + i.total, 0);
  const activeQuotationsCount = filteredQuotations.filter(q => q.status === 'Sent' || q.status === 'Approved').length;

  return (
    <AppLayout>
      <div className="grid gap-8">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-semibold tracking-tight">Dashboard</h1>
          <DateRangePicker date={date} onDateChange={setDate} />
        </div>
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Revenue in the selected date range.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Amount
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue' || i.status === 'Pending').length} invoices pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{activeQuotationsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Currently awaiting client action
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>An overview of your latest quotations and invoices in the selected range.</CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/quotations">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((item) => {
                      const isInvoice = 'quotationId' in item;
                      return (
                        <TableRow key={`${isInvoice ? 'inv' : 'quo'}-${item.id}`}>
                          <TableCell>
                            <div className="font-medium">{isInvoice ? 'Invoice' : 'Quotation'}</div>
                            <div className="text-sm text-muted-foreground md:hidden">{item.client}</div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{item.client}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant={statusVariant[item.status]}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {isInvoice ? (
                                  <>
                                    <DropdownMenuItem asChild><Link href={`/invoices/${item.id}`}>View Details</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleInvoiceStatusChange(item.id, 'Paid')}>Mark as Paid</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleInvoiceStatusChange(item.id, 'Pending')}>Mark as Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleInvoiceStatusChange(item.id, 'Sent')}>Mark as Sent</DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownMenuItem asChild><Link href={`/quotations/${item.id}`}>View Details</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleQuotationStatusChange(item.id, 'Sent')}>Mark as Sent</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleQuotationStatusChange(item.id, 'Approved')}>Mark as Approved</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleQuotationStatusChange(item.id, 'Rejected')}>Mark as Rejected</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleQuotationStatusChange(item.id, 'Draft')}>Mark as Draft</DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                 {recentActivity.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                      No activity found for the selected date range.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
