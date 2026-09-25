import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-6 px-4 md:px-8 text-center text-xs text-slate-500">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-medium text-slate-700">
          Personal Finance Advisor Bot <span className="text-slate-400">|</span> NASSCOM/SmartBridge College Project
        </p>
        <div className="flex items-center gap-1.5 text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>This application is an educational budgeting tool and does not provide professional financial advice.</span>
        </div>
      </div>
    </footer>
  );
};
