
'use client';

import { useRef, useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { mockQuotations, defaultQuotationItems, mockClients } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, Share2, FileCheck, Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { defaultSettings, type SettingsFormValues } from '@/app/settings/settings-form';

export default function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotation = mockQuotations.find(q => q.id === params.id);
  const client = mockClients.find(c => c.name === quotation?.client);
  const companyLogo = PlaceHolderImages.find(img => img.id === 'company-logo');
  const quotationRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [settings, setSettings] = useState<SettingsFormValues>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleDownloadPdf = async () => {
    const element = quotationRef.current;
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
        pdf.save(`quotation-${quotation?.id}.pdf`);
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

  if (!quotation) {
    return (
      <AppLayout>
        <div className="text-center">
          <h1 className="font-headline text-2xl">Quotation not found</h1>
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
                <h1 className="font-headline text-2xl font-bold">Quotation {quotation.id}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4"/>}
                         PDF
                    </Button>
                    <Button variant="outline"><Share2 className="mr-2 h-4 w-4"/> Share</Button>
                    <Button><FileCheck className="mr-2 h-4 w-4"/> Convert to Invoice</Button>
                </div>
            </div>

            <Card className="p-8" ref={quotationRef}>
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
                             <h2 className="font-headline text-2xl font-bold">{settings.companyName}</h2>
                        </div>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">{settings.companyAddress}</p>
                        <p className="text-muted-foreground text-sm">{settings.companyContact}</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">QUOTATION</h1>
                        <div className="text-sm">
                            <p><strong>Quotation #:</strong> {quotation.id}</p>
                            <p><strong>Date:</strong> {new Date(quotation.date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {quotation.status}</p>
                        </div>
                    </div>
                </header>

                <section className="mb-10">
                    <h3 className="font-semibold mb-2">To:</h3>
                    <p className="font-medium">{quotation.client}</p>
                    {client && (
                        <>
                            <p className="text-muted-foreground text-sm">{client.address}</p>
                            <p className="text-muted-foreground text-sm">{client.email}</p>
                        </>
                    )}
                    <p className="text-muted-foreground text-sm mt-2">Project: {quotation.projectName}</p>
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
                        <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                        <div className="text-xs text-muted-foreground space-y-1 whitespace-pre-line">
                            {settings.quotationTerms}
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
                            <span>Total</span>
                            <span>{formatCurrency(quotation.total)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Thank you for the opportunity to quote.</p>
                </footer>
            </Card>
        </div>
    </AppLayout>
  );
}
