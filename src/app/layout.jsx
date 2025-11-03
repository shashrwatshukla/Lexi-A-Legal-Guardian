import "./globals.css";
import Chatbot from "../components/chatbot/ChatBot";
import { LanguageProvider } from '../context/LanguageContext';
import { AnalysisProvider } from '../context/AnalysisContext';
import { AuthProvider } from '../context/AuthContext';  

export const metadata = {
  title: "Lexi - A Legal Guardian",
  description: "AI-powered legal document analysis that empowers you to understand complex contracts",
  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
      }
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Performance optimizations */}
        <link rel="preload" as="font" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon Links - Updated with timestamp trick */}
        <link rel="icon" href="/logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
        <link rel="shortcut icon" href="/logo.png?v=2" />
        
        {/* Meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        
        {/* Font Links */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        {/* Wrap everything with Providers for multi-language support and analysis sharing */}
        <LanguageProvider>
          <AuthProvider>  
          <AnalysisProvider>
            {children}
          </AnalysisProvider>
          </AuthProvider>  
        </LanguageProvider>
      </body>
    </html>
  );
}