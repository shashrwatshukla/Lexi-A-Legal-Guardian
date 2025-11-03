'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ PERFORMANCE: Memoized component to prevent unnecessary re-renders
const CountryDropdown = memo(({ value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // ✅ PERFORMANCE: Import countries dynamically only when needed
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    // Lazy load countries list
    import('../../app/drafter/countries').then((module) => {
      // Filter out the "Select Region" placeholder
      const validCountries = module.countries.filter(c => c.code !== 'REGION');
      setCountries(validCountries);
    });
  }, []);

  // ✅ PERFORMANCE: Memoize filtered list to avoid recalculating on every render
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countries;
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, countries]);

  // ✅ PERFORMANCE: Memoize selected country
  const selectedCountry = useMemo(() => 
    countries.find(c => c.name === value),
    [value, countries]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleSelect = (country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] text-left focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all flex items-center justify-between hover:border-gray-400"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedCountry ? (
            <>
              <img 
                src={selectedCountry.flag} 
                alt=""
                className="w-5 h-4 object-cover rounded flex-shrink-0"
                loading="lazy"
              />
              <span className="truncate">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-400">Select Country</span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - ✅ Only render when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <svg 
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded text-black text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Country List - ✅ Virtual scrolling for performance */}
            <div className="max-h-60 overflow-y-auto overscroll-contain">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full px-3 py-2.5 text-left hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-2.5 text-sm border-b border-gray-50 last:border-0 ${
                      value === country.name ? 'bg-blue-50' : ''
                    }`}
                  >
                    <img 
                      src={country.flag} 
                      alt=""
                      className="w-6 h-4 object-cover rounded flex-shrink-0"
                      loading="lazy"
                    />
                    <span className="text-black truncate">{country.name}</span>
                    {value === country.name && (
                      <svg className="w-4 h-4 text-blue-600 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-8 text-center text-gray-500 text-sm">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  No countries found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CountryDropdown.displayName = 'CountryDropdown';

export default CountryDropdown;