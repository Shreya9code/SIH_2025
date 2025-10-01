import React from "react";
import icon from "../assets/icon.png";
import { Sparkles } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-amber-900 to-orange-900 text-white py-4 relative overflow-hidden">
      {/* Moving Icon */}
      <img 
        src={icon} 
        alt="NrityaLens Icon" 
        className="w-24 h-24 object-contain absolute top-1/2 left-0 -translate-y-1/2 animate-icon-move" 
      />

      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center items-center space-x-2 mb-2">
          <Sparkles className="text-amber-300" size={16} />
          <h3 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            NrityaLens
          </h3>
        </div>

        <p className="text-amber-200 mb-2 max-w-md mx-auto text-sm">
         Where Tradition Meets AI Innovation
        </p>
        <p className="text-amber-300 text-xs">
          &copy; {currentYear} NrityaLens. All rights reserved. Crafted with ❤️ for dance enthusiasts.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
