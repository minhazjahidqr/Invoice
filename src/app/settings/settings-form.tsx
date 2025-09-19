
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Upload, Moon, Sun, Computer } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const settingsSchema = z.object({
  appName: z.string().optional(),
  primaryColor: z.string(),
  backgroundColor: z.string(),
  accentColor: z.string(),
  font: z.enum(['inter', 'space-grotesk', 'geist-sans']),
  companyLogo: z.string().optional(),
  themeMode: z.enum(['light', 'dark', 'system']),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyContact: z.string().optional(),
  quotationTerms: z.string().optional(),
  invoicePaymentDetails: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

const fonts = [
    { id: 'inter', name: 'Inter', className: 'font-body' },
    { id: 'space-grotesk', name: 'Space Grotesk', className: 'font-headline' },
    { id: 'geist-sans', name: 'Geist Sans', className: ''},
];

export const defaultSettings: SettingsFormValues = {
  appName: 'QuoteCraft ELV',
  primaryColor: '231 48% 48%',
  backgroundColor: '220 13% 95%',
  accentColor: '174 100% 29%',
  font: 'inter',
  companyLogo: PlaceHolderImages.find(p => p.id === 'company-logo')?.imageUrl || '',
  themeMode: 'system',
  companyName: 'QuoteCraft ELV',
  companyAddress: '123 Tech Avenue, Silicon Valley, CA 94043',
  companyContact: 'contact@quotecraft.dev',
  quotationTerms: 'Payment: 50% advance, 50% on completion.\nValidity: This quotation is valid for 30 days.\nWarranty: 1-year standard warranty on hardware.',
  invoicePaymentDetails: 'Bank: Tech Bank Inc.\nAccount #: 1234567890\nSWIFT: TBICUS33',
};

function applySettings(settings: SettingsFormValues) {
    const root = document.documentElement;

    if (settings.appName) {
      document.title = settings.appName;
    }
    
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--background', settings.backgroundColor);
    root.style.setProperty('--accent', settings.accentColor);
    
    document.body.classList.remove('font-body', 'font-headline');
    if (settings.font === 'inter') {
        document.body.classList.add('font-body');
    } else if (settings.font === 'space-grotesk') {
        document.body.classList.add('font-headline');
    }
    
    if (settings.themeMode === 'dark') {
      root.classList.add('dark');
    } else if (settings.themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    const logoPlaceholder = PlaceHolderImages.find(p => p.id === 'company-logo');
    if (logoPlaceholder && settings.companyLogo) {
      logoPlaceholder.imageUrl = settings.companyLogo;
    }
}

export function SettingsForm() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | undefined>(defaultSettings.companyLogo);
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      form.reset(parsedSettings);
      setLogoPreview(parsedSettings.companyLogo);
      applySettings(parsedSettings);
    }
  }, [form]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        const settings = form.getValues();
        if (settings.themeMode === 'system') {
            applySettings(settings);
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [form]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue('companyLogo', result);
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SettingsFormValues) => {
    localStorage.setItem('app-settings', JSON.stringify(data));
    applySettings(data);
    toast({
      title: 'Settings Updated!',
      description: 'Your new settings have been saved and applied.',
    });
    window.dispatchEvent(new Event('storage'));
  };
  
  const onReset = () => {
    localStorage.removeItem('app-settings');
    form.reset(defaultSettings);
    applySettings(defaultSettings);
    setLogoPreview(defaultSettings.companyLogo);
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to their defaults.',
    });
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-start gap-2 sticky top-[calc(theme(height.14)+1px)] bg-background/80 backdrop-blur-sm p-4 -m-4 z-10">
          <Button type="submit">Save Settings</Button>
          <Button type="button" variant="outline" onClick={onReset}>Reset to Default</Button>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Theme Customization</CardTitle>
                    <CardDescription>
                    Customize the look and feel of your application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="themeMode"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Theme Mode</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid max-w-md grid-cols-3 gap-8 pt-2"
                                >
                                <FormItem>
                                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem value="light" className="sr-only" />
                                    </FormControl>
                                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                        </div>
                                        </div>
                                    </div>
                                    <span className="block w-full p-2 text-center font-normal">
                                        Light
                                    </span>
                                    </FormLabel>
                                </FormItem>
                                <FormItem>
                                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem value="dark" className="sr-only" />
                                    </FormControl>
                                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent">
                                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                        </div>
                                        </div>
                                    </div>
                                    <span className="block w-full p-2 text-center font-normal">
                                        Dark
                                    </span>
                                    </FormLabel>
                                </FormItem>
                                <FormItem>
                                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem value="system" className="sr-only" />
                                    </FormControl>
                                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                                        <Computer className="mx-auto my-10 h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <span className="block w-full p-2 text-center font-normal">
                                        System
                                    </span>
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="appName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Application Title</FormLabel>
                            <FormControl>
                            <Input {...field} placeholder="e.g., QuoteCraft ELV" />
                            </FormControl>
                            <FormDescription>This will be the title of the application in the browser tab.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Primary Color</FormLabel>
                                <FormControl>
                                <Input {...field} placeholder="e.g., 231 48% 48%" />
                                </FormControl>
                                <FormDescription>HSL format: Hue Saturation% Lightness%</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="backgroundColor"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background Color</FormLabel>
                                <FormControl>
                                <Input {...field} placeholder="e.g., 220 13% 95%" />
                                </FormControl>
                                <FormDescription>HSL format: Hue Saturation% Lightness%</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accentColor"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Accent Color</FormLabel>
                                <FormControl>
                                <Input {...field} placeholder="e.g., 174 100% 29%" />
                                </FormControl>
                                <FormDescription>HSL format: Hue Saturation% Lightness%</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="font"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Application Font</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a font" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fonts.map(font => <SelectItem key={font.id} value={font.id}>{font.name}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormDescription>This will change the main font of the application.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <FormLabel>Company Logo</FormLabel>
                            <div className="flex items-center gap-4">
                            {logoPreview && <Image src={logoPreview} alt="Company Logo Preview" width={64} height={64} className="rounded-md object-contain bg-muted" />}
                            <FormField
                                control={form.control}
                                name="companyLogo"
                                render={() => (
                                <FormItem>
                                    <FormControl>
                                        <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                                            <Upload className="h-4 w-4" />
                                            <span>Upload New Logo</span>
                                        </Label>
                                    </FormControl>
                                    <Input id="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                            </div>
                        </div>
                    </div>
                 </CardContent>
               </Card>
            
               <Card>
                    <CardHeader>
                        <CardTitle>PDF & Document Settings</CardTitle>
                        <CardDescription>
                        Information that will appear on your quotations and invoices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Your Company LLC" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="companyContact"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Company Contact</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="contact@yourcompany.com" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="companyAddress"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Company Address</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="123 Main St, Anytown, USA" rows={3}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quotationTerms"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Quotation - Terms & Conditions</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Payment: 50% advance..." rows={4} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="invoicePaymentDetails"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Invoice - Payment Details</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Bank: My Bank..." rows={4} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
        </form>
    </Form>
  );
}
