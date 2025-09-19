import { AppLayout } from '@/components/app-layout';
import { mockInvoices, defaultQuotationItems } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, Share2, CreditCard } from 'lucide-react';
import { Icons } from '@/components/icons';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = mockInvoices.find(inv => inv.id === params.id);
  const companyLogo = PlaceHolderImages.find(img => img.id === 'company-logo');

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center">
          <h1 className="font-headline text-2xl">Invoice not found</h1>
        </div>
      </AppLayout>
    );
  }
  
  const subtotal = defaultQuotationItems.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.05;

  return (
    <AppLayout>
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="font-headline text-2xl font-bold">Invoice {invoice.id}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4"/> PDF</Button>
                    <Button variant="outline"><Share2 className="mr-2 h-4 w-4"/> Share</Button>
                    <Button><CreditCard className="mr-2 h-4 w-4"/> Mark as Paid</Button>
                </div>
            </div>

            <Card className="p-8">
                <header className="grid grid-cols-2 gap-8 items-start mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             {companyLogo?.imageUrl ? (
                                <Image 
                                    src={companyLogo.imageUrl}
                                    alt="Company Logo"
                                    width={40}
                                    height={40}
                                    data-ai-hint={companyLogo.imageHint}
                                    className="object-contain"
                                />
                             ) : (
                                <Icons.Logo className="w-10 h-10 text-primary" />
                             )}
                             <h2 className="font-headline text-2xl font-bold">QuoteCraft ELV</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">123 Tech Avenue, Silicon Valley, CA 94043</p>
                        <p className="text-muted-foreground text-sm">contact@quotecraft.dev</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">INVOICE</h1>
                        <div className="text-sm">
                            <p><strong>Invoice #:</strong> {invoice.id}</p>
                            <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
                            <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </header>

                <section className="mb-10">
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p className="font-medium">{invoice.client}</p>
                    <p className="text-muted-foreground text-sm">Project: {invoice.projectName}</p>
                </section>
                
                <section>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">SL</TableHead>
                                <TableHead>Discription</TableHead>
                                <TableHead>Brand Name</TableHead>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {defaultQuotationItems.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell>{item.brandName}</TableCell>
                                    <TableCell>
                                        <Image
                                          src={item.imageUrl ?? 'https://picsum.photos/seed/placeholder/64/64'}
                                          alt={item.description}
                                          width={64}
                                          height={64}
                                          className="rounded-md object-cover"
                                          data-ai-hint={item.imageHint}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>

                <Separator className="my-8" />

                <section className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2">Payment Details</h3>
                        <p className="text-sm text-muted-foreground">Bank: Tech Bank Inc.</p>
                        <p className="text-sm text-muted-foreground">Account #: 1234567890</p>
                        <p className="text-sm text-muted-foreground">SWIFT: TBICUS33</p>
                    </div>
                     <div className="space-y-2 text-right">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax (5%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="font-bold text-lg text-primary flex justify-between">
                            <span>Amount Due</span>
                            <span>{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Thank you for your business!</p>
                </footer>
            </Card>
        </div>
    </AppLayout>
  );
}
