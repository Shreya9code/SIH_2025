import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useUser, UserButton } from "@clerk/clerk-react";
import logo from "../assets/icon.png";

const Navbar = ({ showAuthButtons }) => {
  const [open, setOpen] = useState(false);
  const { user, isSignedIn } = useUser();

  return (
    <nav className="fixed w-full bg-white/70 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo on extreme left */}
        <Link to="/" className="flex items-center space-x-2 justify-start">
          <img src={logo} alt="NrityaLens Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold text-[#8C3B26]">NrityaLens</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 font-medium text-[#8C3B26] items-center">
          <Link to="/" className="hover:text-[#5C261A]">
            Home
          </Link>
          <Link to="/detect" className="hover:text-[#5C261A]">
            Detect
          </Link>
          <Link to="/library" className="hover:text-[#5C261A]">
            Library
          </Link>
          <Link to="/ai-assistant" className="hover:text-[#5C261A]">
            Assistant
          </Link>

          {isSignedIn && user && (
            <>
              <Link to="/assessment" className="hover:text-[#5C261A]">
                Assessment
              </Link>
              <Link to="/progress" className="hover:text-[#5C261A]">
                Progress
              </Link>
              <Link to="/groups" className="hover:text-[#5C261A]">
                Group
              </Link>
            </>
          )}

          <Link to="/about" className="hover:text-[#5C261A]">
            About
          </Link>

          {/* Clerk UserButton at the very end */}
          {isSignedIn && user ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                userProfile: {
                  elements: { userButtonAvatar: "w-10 h-10 rounded-full" },
                },
              }}
            />
          ) : (
            showAuthButtons && (
              <Link
                to="/sign-in"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-semibold transition-all duration-300"
              >
                Sign In
              </Link>
            )
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#F3E6D8]"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X size={24} className="text-[#8C3B26]" />
          ) : (
            <Menu size={24} className="text-[#8C3B26]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white/90 shadow-lg px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block text-[#8C3B26] hover:text-[#5C261A]"
          >
            Home
          </Link>
          <Link
            to="/detect"
            onClick={() => setOpen(false)}
            className="block text-[#8C3B26] hover:text-[#5C261A]"
          >
            Detect
          </Link>
          <Link
            to="/library"
            onClick={() => setOpen(false)}
            className="block text-[#8C3B26] hover:text-[#5C261A]"
          >
            Library
          </Link>
          <Link
            to="/ai-assistant"
            onClick={() => setOpen(false)}
            className="block text-[#8C3B26] hover:text-[#5C261A]"
          >
            Assistant
          </Link>

          {isSignedIn && user && (
            <>
              <Link
                to="/assessment"
                onClick={() => setOpen(false)}
                className="block text-[#8C3B26] hover:text-[#5C261A]"
              >
                Assessment
              </Link>
              <Link
                to="/progress"
                onClick={() => setOpen(false)}
                className="block text-[#8C3B26] hover:text-[#5C261A]"
              >
                Progress
              </Link>
              <Link
                to="/groups"
                onClick={() => setOpen(false)}
                className="block text-[#8C3B26] hover:text-[#5C261A]"
              >
                Group
              </Link>
            </>
          )}

          <Link
            to="/about"
            onClick={() => setOpen(false)}
            className="block text-[#8C3B26] hover:text-[#5C261A]"
          >
            About
          </Link>

          {/* Clerk UserButton / Sign In at the very end */}
          {isSignedIn && user ? (
            <div className="pt-2">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  userProfile: {
                    elements: { userButtonAvatar: "w-10 h-10 rounded-full" },
                  },
                }}
              />
            </div>
          ) : (
            showAuthButtons && (
              <Link
                to="/sign-in"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-semibold transition-all duration-300"
              >
                Sign In
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
