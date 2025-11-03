'use client';

import React, { useState, useRef, useEffect } from "react";
import { countries } from "./countries";

export default function RegionSelector({ onSelect }) {
  const [selected, setSelected] = useState(countries.find(c => c.code === "REGION"));
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    window.selectedJurisdiction = null;
  }, []);
  
  const dropdownRef = useRef(null);
  
  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (country) => {
    setSelected(country);
    setIsOpen(false);
    setSearchTerm(''); // ✅ Clear search after selection
    
    if (country.code === "REGION") {
      window.selectedJurisdiction = null;
      if (onSelect) {
        onSelect(null);
      }
      return;
    }
    
    const params = new URLSearchParams(window.location.search);
    params.set('region', country.code);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    if (onSelect) {
      const jurisdiction = country.name;
      onSelect(jurisdiction);
      window.selectedJurisdiction = jurisdiction;
      console.log('Jurisdiction set to:', jurisdiction);
    }
  };

  return (
    <>
      <style jsx>{`
        /* ✅ FIX: Remove blue outline from search box */
        .search-input:focus {
          outline: none !important;
          border-color: #42c58a !important;
          box-shadow: 0 0 0 3px rgba(66, 197, 138, 0.1) !important;
        }

        /* Custom scrollbar */
        .country-list::-webkit-scrollbar {
          width: 8px;
        }
        .country-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .country-list::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .country-list::-webkit-scrollbar-thumb:hover {
          background: #666;
        }

        /* Dropdown animation */
        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-menu {
          animation: dropdownFade 0.2s ease-out;
        }

        /* ✅ MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          .region-selector-container {
            width: 100% !important;
            max-width: 350px !important;
            position: relative !important;
            top: 0 !important;
            transform: none !important;
            margin: 0 auto 15px !important;
            padding: 0 15px !important;
          }

          .dropdown-menu {
            max-width: 100% !important;
          }
        }

        @media (min-width: 769px) {
          .region-selector-container {
            position: absolute;
            top: -61px;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div 
        ref={dropdownRef}
        className="region-selector-container"
        style={{ 
          width: "400px",
          maxWidth: "100%",
          zIndex: 9999
        }}
      >
        {/* Selected Country Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="w-full px-4 md:px-6 py-3 md:py-3.5 bg-white border-2 border-gray-300 rounded-xl flex items-center gap-2 md:gap-3 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151"
          }}
        >
          {selected ? (
            selected.code === "REGION" ? (
              <span className="flex-1 text-left text-gray-900 text-sm md:text-base">
                Select Region
              </span>
            ) : (
              <>
                <img
                  src={selected.flag}
                  alt={selected.name}
                  className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover flex-shrink-0"
                />
                <span className="flex-1 text-left text-gray-900 truncate text-sm md:text-base">
                  {selected.name}
                </span>
              </>
            )
          ) : (
            <span className="flex-1 text-left text-gray-400 text-sm md:text-base">
              Select Region
            </span>
          )}
          <svg
            className="w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-200"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
            }}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="dropdown-menu absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
            style={{
              zIndex: 10000,
              maxWidth: "100%"
            }}
          >
            {/* ✅ FIX: Search input with no blue outline */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Type to search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400"
                style={{
                  transition: "all 0.2s"
                }}
              />
            </div>
            
            {/* ✅ FIX: Country list with black text */}
            <div 
              className="country-list max-h-[300px] md:max-h-[350px] overflow-y-auto"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleSelect(country)}
                    type="button"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 border-none cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-0"
                    style={{
                      background: selected?.code === country.code ? "#e7f9f3" : "white",
                      ...(country.code === "REGION" && {
                        fontWeight: "500",
                        borderBottom: "2px solid #eee"
                      })
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 
                        selected?.code === country.code ? "#e7f9f3" : "white";
                    }}
                  >
                    {country.code !== "REGION" && (
                      <img
                        src={country.flag}
                        alt={country.name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    {/* ✅ FIX: Black text instead of white */}
                    <span className="flex-1 text-left text-gray-900 text-sm md:text-base">
                      {country.name}
                    </span>
                    
                    {/* ✅ Checkmark for selected */}
                    {selected?.code === country.code && (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No countries found</p>
                  <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}