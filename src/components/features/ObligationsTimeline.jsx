"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ObligationsTimeline({ obligations = [], keyDates = [] }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  
  const allEvents = [
    ...obligations.map(o => ({
      ...o,
      type: 'obligation',
      displayDate: o.dueDate === 'Ongoing' ? 'Ongoing' : o.dueDate
    })),
    ...keyDates.map(k => ({
      ...k,
      type: 'keyDate',
      displayDate: k.date
    }))
  ].sort((a, b) => {
    if (a.displayDate === 'Ongoing') return 1;
    if (b.displayDate === 'Ongoing') return -1;
    return new Date(a.displayDate) - new Date(b.displayDate);
  });

  const getEventIcon = (event) => {
    if (event.type === 'obligation') {
      switch (event.frequency) {
        case 'Monthly': return '🔄';
        case 'Annual': return '📅';
        case 'One-time': return '📌';
        default: return '📋';
      }
    } else {
      switch (event.type) {
        case 'Deadline': return '⏰';
        case 'Renewal': return '🔄';
        case 'Payment': return '💰';
        default: return '📅';
      }
    }
  };

  const getEventColor = (event) => {
    if (event.type === 'obligation') {
      return event.frequency === 'Monthly' ? 'bg-blue-500' : 'bg-purple-500';
    }
    return event.type === 'Deadline' ? 'bg-red-500' : 'bg-green-500';
  };

  return (
    <div className="relative">
      {/* Timeline bar */}
      <motion.div
        className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isVisible ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transformOrigin: "top" }}
      />

      {/* Events */}
      <div className="space-y-6">
        {allEvents.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: 0 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            className="flex items-start gap-4"
          >
            {/* Event marker */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isVisible ? 1 : 0 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              className={`relative z-10 w-16 h-16 rounded-full ${getEventColor(event)} flex items-center justify-center text-2xl shadow-lg`}
            >
              {getEventIcon(event)}
            </motion.div>

            {/* Event details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex-1 bg-gray-900/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-semibold text-white">
                    {event.type === 'obligation' ? event.obligation : event.event}
                  </h5>
                  {event.party && (
                    <p className="text-sm text-gray-400 mt-1">
                      Responsible: {event.party}
                    </p>
                  )}
                  {event.frequency && (
                    <p className="text-sm text-gray-400">
                      Frequency: {event.frequency}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-purple-400">
                  {event.displayDate}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}