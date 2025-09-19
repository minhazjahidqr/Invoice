
'use client';

import { useState } from 'react';
import Link from "next/link";
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { mockQuotations as initialQuotations, type Quotation } from '@/lib/data';
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

const statusVariant: { [key in Quotation['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Approved: 'default',
  Sent: 'secondary',
  Draft: 'outline',
  Rejected: 'destructive',
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const { toast } = useToast();

  const handleStatusChange = (quotationId: string, newStatus: Quotation['status']) => {
    setQuotations(quotations.map(quo =>
      quo.id === quotationId ? { ...quo, status: newStatus } : quo
    ));
    toast({
      title: 'Quotation Status Updated',
      description: `Quotation ${quotationId} has been marked as ${newStatus}.`
    });
  };

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
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
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
                  <TableCell className="font-medium">{quotation.client}</TableCell>
                  <TableCell>{quotation.projectName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={statusVariant[quotation.status]}>
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(quotation.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(quotation.total)}</TableCell>
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
                        <DropdownMenuItem asChild>
                            <Link href={`/quotations/${quotation.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Convert to Invoice</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/quotations/${quotation.id}`}>Download PDF</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(quotation.id, 'Sent')}>Mark as Sent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(quotation.id, 'Approved')}>Mark as Approved</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(quotation.id, 'Rejected')}>Mark as Rejected</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
