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
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const themeSchema = z.object({
  appName: z.string().optional(),
  primaryColor: z.string(),
  backgroundColor: z.string(),
  accentColor: z.string(),
  font: z.enum(['inter', 'space-grotesk', 'geist-sans']),
  companyLogo: z.string().optional(),
});

type ThemeFormValues = z.infer<typeof themeSchema>;

const fonts = [
    { id: 'inter', name: 'Inter', className: 'font-body' },
    { id: 'space-grotesk', name: 'Space Grotesk', className: 'font-headline' },
    { id: 'geist-sans', name: 'Geist Sans', className: ''},
];

const defaultTheme = {
  appName: 'QuoteCraft ELV',
  primaryColor: '231 48% 48%',
  backgroundColor: '220 13% 95%',
  accentColor: '174 100% 29%',
  font: 'inter',
  companyLogo: PlaceHolderImages.find(p => p.id === 'company-logo')?.imageUrl || '',
};

export function ThemeForm() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | undefined>(defaultTheme.companyLogo);

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: defaultTheme,
  });

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      form.reset(parsedTheme);
      setLogoPreview(parsedTheme.companyLogo);
      applyTheme(parsedTheme);
    }
  }, [form]);

  const applyTheme = (theme: ThemeFormValues) => {
    const root = document.documentElement;

    if (theme.appName) {
      document.title = theme.appName;
    }
    
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--background', theme.backgroundColor);
    root.style.setProperty('--accent', theme.accentColor);
    
    // For fonts, we'll just update the body. This is a simplification.
    document.body.classList.remove('font-body', 'font-headline');
    if (theme.font === 'inter') {
        document.body.classList.add('font-body');
    } else if (theme.font === 'space-grotesk') {
        document.body.classList.add('font-headline');
    }
    
    // Update company logo in placeholder data (for other pages)
    const logoPlaceholder = PlaceHolderImages.find(p => p.id === 'company-logo');
    if (logoPlaceholder && theme.companyLogo) {
      logoPlaceholder.imageUrl = theme.companyLogo;
    }
  };

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

  const onSubmit = (data: ThemeFormValues) => {
    localStorage.setItem('app-theme', JSON.stringify(data));
    applyTheme(data);
    toast({
      title: 'Theme Updated!',
      description: 'Your new theme has been applied.',
    });
    // Force a re-render of components that use the logo by slightly changing the URL
    window.dispatchEvent(new Event('storage'));
  };
  
  const onReset = () => {
    localStorage.removeItem('app-theme');
    form.reset(defaultTheme);
    applyTheme(defaultTheme);
    setLogoPreview(defaultTheme.companyLogo);
    toast({
      title: 'Theme Reset',
      description: 'The theme has been reset to its default settings.',
    });
     window.dispatchEvent(new Event('storage'));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <div className="flex justify-start gap-2">
          <Button type="submit">Save and Apply Theme</Button>
          <Button type="button" variant="outline" onClick={onReset}>Reset to Default</Button>
        </div>
      </form>
    </Form>
  );
}
