"use client";

import { memo } from 'react';
import { motion } from "framer-motion";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const NavItem = memo(({ icon: Icon, label, onClick, isLoading }) => {
  return (
    <motion.button
      onClick={onClick}
      className="nav-item-container"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }} // ✅ Faster transition
      disabled={isLoading}
    >
      <div className="nav-content">
        {isLoading ? (
          <AiOutlineLoading3Quarters className="nav-icon loading animate-spin" />
        ) : (
          <Icon className="nav-icon" />
        )}
        <span className="nav-label">{label}</span>
      </div>
    </motion.button>
  );
});

NavItem.displayName = 'NavItem';

export default NavItem;