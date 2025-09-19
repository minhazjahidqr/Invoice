
'use client';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, ImageOff, Upload } from 'lucide-react';
import type { Invoice, QuotationItem } from '@/lib/data';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { ChangeEvent } from 'react';

const invoiceItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  brandName: z.string(),
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  unitPrice: z.coerce.number().min(0, 'Price must be positive.'),
  total: z.number(),
  imageHint: z.string().optional(),
});

const formSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
});

type InvoiceItemsFormValues = z.infer<typeof formSchema>;

interface InvoiceItemsFormProps {
  invoice: Invoice;
  onSave: (updatedInvoice: Invoice) => void;
  onCancel: () => void;
}

export function InvoiceItemsForm({ invoice, onSave, onCancel }: InvoiceItemsFormProps) {
  const form = useForm<InvoiceItemsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: invoice.items,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, index: number, fieldName: `items.${number}.imageUrl`) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(fieldName, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: InvoiceItemsFormValues) {
    const updatedItems = data.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice,
    }));
    const total = updatedItems.reduce((acc, item) => acc + item.total, 0);

    const updatedInvoice: Invoice = {
      ...invoice,
      items: updatedItems,
      total,
    };
    onSave(updatedInvoice);
  }

  const watchedItems = form.watch('items');
  const total = watchedItems.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unitPrice || 0)), 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">SL</TableHead>
                    <TableHead>Discription</TableHead>
                    <TableHead>Brand Name</TableHead>
                    <TableHead className="w-[120px]">Image</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Unit Price</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                    <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {fields.map((field, index) => {
                    const imageUrl = form.watch(`items.${index}.imageUrl`);
                    return (
                    <TableRow key={field.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                        <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => <Input {...field} placeholder="Item description"/>}/>
                    </TableCell>
                    <TableCell>
                        <FormField control={form.control} name={`items.${index}.brandName`} render={({ field }) => <Input {...field} placeholder="Brand name"/>}/>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-2 items-center">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={form.watch(`items.${index}.description`) || 'Item image'}
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                                <ImageOff className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}
                            <FormField
                            control={form.control}
                            name={`items.${index}.imageUrl`}
                            render={() => (
                                <FormItem>
                                <FormControl>
                                    <Label htmlFor={`item-image-${index}`} className="cursor-pointer inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                                        <Upload className="h-3 w-3" />
                                        <span>{imageUrl ? 'Change' : 'Upload'}</span>
                                    </Label>
                                </FormControl>
                                <Input id={`item-image-${index}`} type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, index, `items.${index}.imageUrl`)} />
                                <FormMessage/>
                                </FormItem>
                            )}
                            />
                        </div>
                    </TableCell>
                    <TableCell>
                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="number" {...field} />}/>
                    </TableCell>
                    <TableCell>
                        <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => <Input type="number" {...field} />}/>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                        {formatCurrency((form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.unitPrice`) || 0))}
                    </TableCell>
                    <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </TableCell>
                    </TableRow>
                )})}
                </TableBody>
            </Table>
        </div>
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => append({ id: `item-${Date.now()}`, description: '', brandName: '', quantity: 1, unitPrice: 0, imageUrl: '', total: 0 })}
        >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>

        <div className="flex justify-end pt-4">
            <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
