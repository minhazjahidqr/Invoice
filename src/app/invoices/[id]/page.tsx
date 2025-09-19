
'use client';

import { useRef, useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { getFromStorage, saveToStorage, type Invoice, type Client, type QuotationItem } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, Share2, CreditCard, Loader2, Pencil } from 'lucide-react';
import { Icons } from '@/components/icons';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { defaultSettings, type SettingsFormValues } from '@/app/settings/settings-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InvoiceItemsForm } from '../invoice-items-form';


export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | undefined>(undefined);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const companyLogo = PlaceHolderImages.find(img => img.id === 'company-logo');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [settings, setSettings] = useState<SettingsFormValues>(defaultSettings);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const invoices = getFromStorage<Invoice[]>('invoices', []);
    const foundInvoice = invoices.find(inv => inv.id === params.id);
    setInvoice(foundInvoice);

     if (foundInvoice) {
      const clients = getFromStorage<Client[]>('clients', []);
      const foundClient = clients.find(c => c.id === foundInvoice.clientId);
      setClient(foundClient);
    }

  }, [params.id]);
  
  const handleItemSave = (updatedInvoice: Invoice) => {
    const invoices = getFromStorage<Invoice[]>('invoices', []);
    const updatedInvoices = invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv);
    saveToStorage('invoices', updatedInvoices);
    setInvoice(updatedInvoice);
    setIsItemFormOpen(false);
    toast({
        title: "Invoice Items Updated",
        description: "The line items for this invoice have been saved.",
    })
    window.dispatchEvent(new Event('storage'));
  }


  const handleDownloadPdf = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: settings.pageOrientation,
          unit: 'mm',
          format: settings.pageSize,
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`invoice-${invoice?.id}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF", error);
        toast({
            title: "Download Failed",
            description: "Could not generate PDF. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsDownloading(false);
    }
  };

  if (!invoice || !client) {
    return (
      <AppLayout>
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="font-headline text-2xl mt-4">Loading Invoice...</h1>
            <p className="text-muted-foreground">If it does not load, the invoice may not exist.</p>
        </div>
      </AppLayout>
    );
  }
  
  const subtotal = (invoice.items || []).reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.05;

  const headerStyle = settings.headerBackgroundImage
    ? {
        backgroundImage: `url(${settings.headerBackgroundImage})`,
        backgroundSize: settings.headerBackgroundSize,
        backgroundPosition: settings.headerBackgroundPosition,
      }
    : {};

  return (
    <AppLayout>
        <Dialog open={isItemFormOpen} onOpenChange={setIsItemFormOpen}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="font-headline text-2xl font-bold">Invoice {invoice.id}</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4"/>}
                            PDF
                        </Button>
                        <Button variant="outline"><Share2 className="mr-2 h-4 w-4"/> Share</Button>
                        <Button><CreditCard className="mr-2 h-4 w-4"/> Mark as Paid</Button>
                    </div>
                </div>

                <Card className="p-8" ref={invoiceRef}>
                    <header className="relative grid grid-cols-2 gap-8 items-start mb-10 rounded-lg overflow-hidden p-6" style={headerStyle}>
                        {settings.headerBackgroundImage && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>}
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                {companyLogo?.imageUrl ? (
                                    <Image 
                                        src={companyLogo.imageUrl}
                                        alt="Company Logo"
                                        width={40}
                                        height={40}
                                        data-ai-hint={companyLogo.imageHint}
                                        className="object-contain bg-white/80 p-1 rounded"
                                    />
                                ) : (
                                    <Icons.Logo className="w-10 h-10 text-primary" />
                                )}
                                <h2 className="font-headline text-2xl font-bold text-white shadow-md">{settings.companyName}</h2>
                            </div>
                            <p className="text-sm text-gray-200 shadow-sm whitespace-pre-line">{settings.companyAddress}</p>
                            <p className="text-sm text-gray-200 shadow-sm">{settings.companyContact}</p>
                        </div>
                        <div className="relative z-10 text-right">
                            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white" style={{color: `hsl(${settings.headerTitleColor})`}}>INVOICE</h1>
                            <div className="text-sm text-gray-200">
                                <p><strong>Invoice #:</strong> {invoice.id}</p>
                                <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
                                <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </header>

                    <section className="mb-10">
                        <h3 className="font-semibold mb-2">Bill To:</h3>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-muted-foreground text-sm">Project: {invoice.projectName}</p>
                    </section>
                    
                    <section>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Line Items</h3>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Pencil className="mr-2 h-4 w-4" /> Edit Items
                                </Button>
                            </DialogTrigger>
                        </div>
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
                                {(invoice.items || []).map((item, index) => (
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
                            <div className="text-sm text-muted-foreground whitespace-pre-line">
                            {settings.invoicePaymentDetails}
                            </div>
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
                        <p>{settings.footerText}</p>
                    </footer>
                </Card>
            </div>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit Invoice Items</DialogTitle>
                    <DialogDescription>
                        Modify the line items for invoice {invoice.id}. The total will be recalculated automatically.
                    </DialogDescription>
                </DialogHeader>
                <InvoiceItemsForm 
                    invoice={invoice} 
                    onSave={handleItemSave} 
                    onCancel={() => setIsItemFormOpen(false)} 
                />
            </DialogContent>
        </Dialog>
    </AppLayout>
  );
}
