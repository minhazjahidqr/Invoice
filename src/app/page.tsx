import Link from "next/link";
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, Receipt, ArrowUpRight } from 'lucide-react';
import { mockInvoices, mockQuotations, type Quotation, type Invoice } from '@/lib/data';
import { Button } from "@/components/ui/button";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Paid: 'default',
  Approved: 'default',
  Sent: 'secondary',
  Draft: 'outline',
  Overdue: 'destructive',
  Rejected: 'destructive',
};


export default function DashboardPage() {
  const recentActivity: (Quotation | Invoice)[] = [...mockQuotations.slice(0, 3), ...mockInvoices.slice(0, 2)]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalRevenue = mockInvoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.total, 0);
  const pendingAmount = mockInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((acc, i) => acc + i.total, 0);

  return (
    <AppLayout>
      <div className="grid gap-8">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Dashboard</h1>
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
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Invoices
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {mockInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').length} invoices pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{mockQuotations.filter(q => q.status === 'Sent').length}</div>
              <p className="text-xs text-muted-foreground">
                Currently awaiting client approval
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Activity</CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((item) => (
                  <TableRow key={`${'quotationId' in item ? 'inv' : 'quo'}-${item.id}`}>
                    <TableCell>
                      <div className="font-medium">{'quotationId' in item ? 'Invoice' : 'Quotation'}</div>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
