import { useEffect, useState } from "react";
import { Link } from "react-scroll";
import { Menu, X, Terminal } from "lucide-react";
import { navLinks } from "../../data/misc";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-bold tracking-widest text-[#00FF88] text-glow">
          <Terminal size={20} />
          CODEOPS
        </div>

        <div className="hidden lg:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              smooth
              duration={600}
              offset={-70}
              spy
              onSetActive={() => setActive(link.to)}
              className={`px-3 py-2 cursor-pointer transition-colors relative ${
                active === link.to ? "text-[#00FF88]" : "text-white/60 hover:text-white"
              }`}
            >
              {link.label}
              {active === link.to && (
                <span className="absolute left-2 right-2 -bottom-0.5 h-[2px] bg-[#00FF88] box-glow-neon" />
              )}
            </Link>
          ))}
        </div>

        <button
          className="lg:hidden text-[#00FF88]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden glass mt-2 mx-4 rounded-lg p-4 flex flex-col gap-2 font-mono text-sm uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              smooth
              duration={600}
              offset={-60}
              onClick={() => setOpen(false)}
              className="py-2 text-white/70 hover:text-[#00FF88] cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}