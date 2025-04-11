
import React from 'react';
import { Phone } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-2">
        <Phone className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Call Center Hub</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Agent: Demo User</span>
      </div>
    </header>
  );
};

export default Header;
