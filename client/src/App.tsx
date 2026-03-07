import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TransactionPage from "./pages/TransactionPage";
import BlockPage from "./pages/BlockPage";
import AddressPage from "./pages/AddressPage";
import { Link } from "react-router-dom";
import { type Transition } from "framer-motion";
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
const pageTransition: Transition = { duration: 0.25, ease: "easeOut" };

function NavCrumb() {
  const loc = useLocation();
  const parts = loc.pathname.split("/").filter(Boolean);
  if (!parts.length) return null;

  const label =
    parts[0] === "tx"
      ? "transaction"
      : parts[0] === "address"
        ? "address"
        : parts[0] === "block"
          ? "block"
          : parts[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-gray-600 font-mono"
    >
      <Link to="/" className="hover:text-orange-500 transition-colors">
        HOME
      </Link>
      <span className="text-gray-800">/</span>
      <span className="text-orange-500/70 uppercase">{label}</span>
      {parts[1] && (
        <>
          <span className="text-gray-800">/</span>
          <span className="text-gray-700 truncate max-w-[120px]">
            {parts[1].slice(0, 10)}…
          </span>
        </>
      )}
    </motion.div>
  );
}

function BitcoinLogo() {
  return (
    <motion.div
      whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="relative select-none"
    >
      <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-md scale-150" />
      <span
        className="relative text-2xl leading-none"
        style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.6))" }}
      >
        ₿
      </span>
    </motion.div>
  );
}

function routeGroup(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/tx/")) return "tx-page";
  if (pathname.startsWith("/block/")) return "block-page";
  if (pathname.startsWith("/address/")) return "address-page";
  return pathname;
}

function AppInner() {
  const location = useLocation();
  const animKey = routeGroup(location.pathname);

  return (
    <div
      className="min-h-screen bg-[#060a0e] text-white"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-gray-800/60 backdrop-blur-xl bg-[#060a0e]/80">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <BitcoinLogo />
            <div className="flex flex-col leading-tight select-none">
              <span className="text-orange-400 text-sm font-bold tracking-[0.15em]">
                TX
              </span>
              <span className="text-gray-400 text-[9px] tracking-[0.3em] -mt-0.5">
                VISUALIZER
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex flex-1 justify-center">
            <NavCrumb />
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-gray-800 bg-gray-900/60">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[9px] tracking-[0.2em] text-gray-500 uppercase select-none cursor-pointer">
              Mainnet
            </span>
          </div>
        </div>
        <div className="sm:hidden px-4 pb-2 -mt-1">
          <NavCrumb />
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <Routes location={location} key={animKey}>
            <Route
              path="/"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <TransactionPage />
                </motion.div>
              }
            />
            <Route
              path="/tx/:txid"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <TransactionPage />
                </motion.div>
              }
            />
            <Route
              path="/block/:hash"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <BlockPage />
                </motion.div>
              }
            />
            <Route
              path="/address/:addr"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AddressPage />
                </motion.div>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-800/40 mt-16 py-6 px-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-orange-500/60 text-sm">₿</span>
            <span className="text-[10px] text-gray-700 tracking-widest uppercase select-none">
              TX Visualizer
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://mempool.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-700 hover:text-orange-500/70 tracking-widest uppercase transition-colors"
            >
              Powered by Mempool.space
            </a>
            <span className="text-gray-800 text-[10px]">·</span>
            <span className="text-[10px] text-gray-800 tracking-widest uppercase">
              Bitcoin Network
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
