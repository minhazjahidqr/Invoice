
'use client';
import { useState, useTransition, ChangeEvent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, PlusCircle, Trash2, Wand2, Upload, Mail, Phone, MapPin, Pencil, UserPlus, ImageOff } from 'lucide-react';
import { suggestElvComponentsAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { defaultQuotationItems, type Client, type Quotation, getFromStorage, saveToStorage } from '@/lib/data';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClientForm } from '@/app/clients/client-form';

const formSchema = z.object({
  clientId: z.string().min(1, 'Client is required.'),
  quotationDraft: z.string(),
  items: z.array(z.object({
    imageUrl: z.string().url().optional().or(z.literal('')),
    brandName: z.string(),
    description: z.string().min(1, 'Description is required.'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
    unitPrice: z.coerce.number().min(0, 'Price must be positive.'),
  })).min(1, 'At least one item is required.'),
});

type QuotationFormValues = z.infer<typeof formSchema>;

interface QuotationFormProps {
  clients: Client[];
  onClientsUpdate: (clients: Client[]) => void;
}

export function QuotationForm({ clients, onClientsUpdate }: QuotationFormProps) {
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const [suggestions, setSuggestions] = useState('');
  const { toast } = useToast();
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const router = useRouter();

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      quotationDraft: `CCTV System:
- 8-Channel DVR
- 4x Dome Cameras
- 1TB Hard Drive`,
      items: defaultQuotationItems.map(({id, total, imageHint, ...item}) => ({...item, imageUrl: ''})),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedClientId = form.watch('clientId');
  const selectedClient = clients.find(c => c.id === selectedClientId);

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

  const handleSuggest = () => {
    const draft = form.getValues('quotationDraft');
    if (!draft.trim()) {
      toast({
        title: 'Draft is empty',
        description: 'Please write a draft before asking for suggestions.',
        variant: 'destructive',
      });
      return;
    }
    startSuggestionTransition(async () => {
      try {
        const result = await suggestElvComponentsAction({ quotationDraft: draft });
        setSuggestions(result.suggestedComponents);
      } catch (error) {
        toast({
          title: 'Error getting suggestions',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    });
  };

  function onClientSaved(client: Omit<Client, 'id'> & { id?: string }) {
    let updatedClients;
    let message = '';
    let newClientId;
  
    if (client.id && clients.some(c => c.id === client.id)) {
      // Update existing client
      updatedClients = clients.map(c => (c.id === client.id ? client as Client : c));
      message = `Client "${client.name}" has been updated.`;
      newClientId = client.id;
    } else {
      // Add new client
      const newClient = { ...client, id: `cli-${Date.now()}` } as Client;
      updatedClients = [newClient, ...clients];
      message = `Client "${client.name}" has been created.`;
      newClientId = newClient.id;
    }
    
    saveToStorage('clients', updatedClients);
    onClientsUpdate(updatedClients);
    form.setValue('clientId', newClientId, { shouldValidate: true });
    toast({
      title: 'Client Saved',
      description: message,
    });
    setClientFormOpen(false);
    setEditingClient(undefined);
  }

  function onSubmit(data: QuotationFormValues) {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) {
      toast({ title: 'Error', description: 'Selected client not found.', variant: 'destructive' });
      return;
    }

    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const existingQuotations = getFromStorage('quotations', []);

    const newQuotation: Quotation = {
        id: `Q-${new Date().getFullYear()}-${String(existingQuotations.length + 1).padStart(3, '0')}`,
        client: client.name,
        projectName: 'N/A',
        date: new Date().toISOString(),
        total: total,
        status: 'Sent'
    };

    const updatedQuotations = [newQuotation, ...existingQuotations];
    saveToStorage('quotations', updatedQuotations);
    window.dispatchEvent(new Event('storage'));

    toast({
      title: "Quotation Created!",
      description: "The quotation has been saved successfully and marked as sent.",
    });

    router.push('/quotations');
  }
  
  const subtotal = form.watch('items').reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  return (
    <Dialog open={clientFormOpen} onOpenChange={setClientFormOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogTrigger asChild>
                   <Button type="button" variant="outline" size="icon" aria-label="Add new client" onClick={() => setEditingClient(undefined)}>
                      <UserPlus className="h-4 w-4" />
                   </Button>
                </DialogTrigger>
              </div>
            </div>
          </div>

          {selectedClient && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Client Information</CardTitle>
                <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingClient(selectedClient)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                </DialogTrigger>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{selectedClient.email}</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{selectedClient.phone}</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedClient.address}</span>
                 </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Smart Suggestions</CardTitle>
              <CardDescription>Write a draft of the required components, and our AI will suggest any missing items.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <FormField
                      control={form.control}
                      name="quotationDraft"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Quotation Draft</FormLabel>
                              <FormControl>
                                  <Textarea {...field} rows={8} placeholder="e.g., 1x 8-port Switch, 4x IP Cameras..." />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <Button type="button" onClick={handleSuggest} disabled={isSuggesting}>
                      {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                      Suggest Components
                  </Button>
              </div>
              <div className={cn("rounded-lg bg-muted/50 p-4 transition-opacity", suggestions || isSuggesting ? 'opacity-100' : 'opacity-50')}>
                  <h3 className="font-semibold mb-2">Suggestions</h3>
                  {isSuggesting && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</div>}
                  {suggestions ? (
                      <div className="text-sm prose prose-sm prose-p:my-1 prose-ul:my-1 text-foreground">{suggestions}</div>
                  ) : !isSuggesting && (
                      <p className="text-sm text-muted-foreground italic">AI suggestions will appear here.</p>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>Add the products and services for this quotation.</CardDescription>
              </CardHeader>
              <CardContent>
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
              <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => append({ description: '', brandName: '', quantity: 1, unitPrice: 0, imageUrl: '' })}
              >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
              </CardContent>
          </Card>

          <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                  </div>
              </div>
          </div>
          
          <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="submit">Create & Send Quotation</Button>
          </div>
        </form>
      </Form>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {editingClient ? 'Update the details for this client.' : 'Add a new client to your records.'}
          </DialogDescription>
        </DialogHeader>
        <ClientForm client={editingClient} onSave={onClientSaved} />
      </DialogContent>
    </Dialog>
  );
}

