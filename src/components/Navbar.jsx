import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Plus, List } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
     ${
       isActive
         ? "bg-white/15 text-white"
         : "text-white/80 hover:text-white hover:bg-white/10"
     }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900 backdrop-blur">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="leading-tight">
              <p className="text-base font-bold text-white">Listing App</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              <Plus className="w-4 h-4" />
              Create Listing
            </NavLink>

            <NavLink to="/listings" className={navLinkClass}>
              <List className="w-4 h-4" />
              View Listings
            </NavLink>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/10 transition"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-4">
            <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
              <NavLink
                to="/"
                className={navLinkClass}
                end
                onClick={() => setOpen(false)}
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </NavLink>

              <NavLink
                to="/listings"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <List className="w-4 h-4" />
                View Listings
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
