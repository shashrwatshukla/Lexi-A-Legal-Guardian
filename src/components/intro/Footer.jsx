'use client';

import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Footer() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const footerLinks = {
    Product: [
      { name: 'Contract Analyzer', href: '/home', requiresAuth: true },
      { name: 'Document Drafter', href: '/drafter', requiresAuth: true },
    ],
    Company: [
      { name: 'About', href: '/FooterComponents/about' },
      { name: 'Contact', href: '/FooterComponents/contact' },
    ],
    Resources: [
      { name: 'Help Center', href: '/FooterComponents/help' },
      { name: 'Documentation', href: '/FooterComponents/docs' },
      { name: 'Privacy Policy', href: '/FooterComponents/privacy' },
      { name: 'Terms of Service', href: '/FooterComponents/terms' },
    ],
    Legal: [
      { name: 'Security', href: '/FooterComponents/security' },
      { name: 'Compliance', href: '/FooterComponents/compliance' },
      { name: 'Cookie Policy', href: '/FooterComponents/cookies' },
    ]
  };

  const scrollToElement = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleProtectedLinkClick = (e, href) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth');
    } else {
      router.push(href);
    }
  };

  const handleLinkClick = async (href) => {
    if (!mounted) return;

    // Handle anchor links with path (e.g., /#chatbot)
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      
      // If we're already on the correct path, just scroll
      if (path === '/' || window.location.pathname === path) {
        scrollToElement(hash);
        return;
      }

      // Navigate first, then scroll after page loads
      await router.push(path);
      setTimeout(() => scrollToElement(hash), 100);
      return;
    }

    // Regular navigation
    router.push(href);
  };

  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 relative">
                <img 
                  src="/logo.png" 
                  alt="Lexi Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <span 
                className="text-3xl font-black text-white"
                style={{ 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  opacity: 1,
                  visibility: 'visible'
                }}
              >
                Lexi
              </span>
            </div>
            <p 
              className="text-white/70 text-base leading-relaxed mb-6"
              style={{ 
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                opacity: 0.7,
                visibility: 'visible'
              }}
            >
              AI-powered legal document analysis. Understand contracts in seconds, protect your interests with confidence.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">

              {/* GitHub */}
              <a 
                href="https://github.com/shashrwatshukla/Lexi-A-Legal-Guardian" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-white transition-colors" 
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns - ADDED EXPLICIT VISIBILITY */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 
                className="text-white font-bold mb-6 text-lg" 
                style={{ 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  opacity: 1,
                  visibility: 'visible'
                }}
              >
                {category}
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.requiresAuth ? (
                      <Link
                        href={link.href}
                        onClick={(e) => handleProtectedLinkClick(e, link.href)}
                        className="text-white/70 hover:text-white transition-colors text-base block"
                        style={{ 
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          opacity: 0.7,
                          visibility: 'visible'
                        }}
                        prefetch={true}
                      >
                        {link.name}
                      </Link>
                    ) : link.href.includes('#') ? (
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-white/70 hover:text-white transition-colors text-base text-left block w-full"
                        style={{ 
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          opacity: 0.7,
                          visibility: 'visible'
                        }}
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors text-base block"
                        style={{ 
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                          opacity: 0.7,
                          visibility: 'visible'
                        }}
                        prefetch={true}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-6">
          <p 
            className="text-white/60 text-base" 
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              opacity: 0.6,
              visibility: 'visible'
            }}
          >
            © {new Date().getFullYear()} Lexi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}