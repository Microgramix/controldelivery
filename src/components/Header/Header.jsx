import React from 'react';
import InstallButton from '../InstallButton/InstallButton';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-orange-500 shadow-md">
      <img
        src="/logof.png"
        alt="Logo Fastrack"
        className="h-10 w-auto object-contain"
      />
      <InstallButton />
    </header>
  );
};

export default Header;
