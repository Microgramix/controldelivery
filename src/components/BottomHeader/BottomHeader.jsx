import React from 'react';
import { Home, BarChart, MoveRight, Shield } from 'lucide-react';

export default function BottomHeader() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] text-[#E0E0E0] border-t-2 border-[#ce7c00] rounded-t-xl shadow-[0_0_20px_#ce5600]">
      <nav className="max-w-3xl mx-auto px-4 py-3">
        <ul className="flex justify-center flex-wrap gap-3 list-none m-0 p-0">
          <li>
            <a
              href="/"
              className="block px-6 py-3 text-base font-semibold text-[#121212] bg-[#ce8d00] rounded-md shadow-md hover:bg-[#d07812] hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/ranking"
              className="block px-6 py-3 text-base font-semibold text-[#121212] bg-[#ce8d00] rounded-md shadow-md hover:bg-[#d07812] hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              Ranking
            </a>
          </li>
          <li>
            <a
              href="/compare"
              className="block px-6 py-3 text-base font-semibold text-[#121212] bg-[#ce8d00] rounded-md shadow-md hover:bg-[#d07812] hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              Comparar
            </a>
          </li>
          <li>
            <a
              href="/admin-teams"
              className="block px-6 py-3 text-base font-semibold text-[#121212] bg-[#ce8d00] rounded-md shadow-md hover:bg-[#d07812] hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              Admin
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
