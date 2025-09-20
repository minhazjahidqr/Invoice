
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'QuoteCraft ELV',
  description: 'Smart Quotation and Invoice Generator for ELV Systems',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <script dangerouslySetInnerHTML={{ __html: `
            try {
              if (typeof window !== 'undefined') {
                const theme = localStorage.getItem('app-settings');
                if (theme) {
                  const { appName, primaryColor, backgroundColor, accentColor, font, themeMode } = JSON.parse(theme);
                  const root = document.documentElement;

                  if (appName) {
                    document.title = appName;
                  }
                  
                  if (primaryColor) root.style.setProperty('--primary', primaryColor);
                  if (backgroundColor) root.style.setProperty('--background', backgroundColor);
                  if (accentColor) root.style.setProperty('--accent', accentColor);
                  
                  if (font) {
                      document.body.classList.remove('font-body', 'font-headline');
                      if (font === 'inter') document.body.classList.add('font-body');
                      else if (font === 'space-grotesk') document.body.classList.add('font-headline');
                  }

                  if (themeMode === 'dark') {
                      root.classList.add('dark');
                  } else if (themeMode === 'light') {
                      root.classList.remove('dark');
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      root.classList.add('dark');
                  } else {
                      root.classList.remove('dark');
                  }

                }
              }
            } catch (e) {
              console.error('Failed to apply theme from localStorage', e);
            }
        `}} />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
