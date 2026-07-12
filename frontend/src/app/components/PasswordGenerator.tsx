'use client';

import { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

interface PasswordGeneratorProps {
  onSelectPassword?: (password: string) => void;
}

export default function PasswordGenerator({ onSelectPassword }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setGeneratedPassword('Select at least one option!');
      return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    setGeneratedPassword(password);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!generatedPassword || generatedPassword === 'Select at least one option!') return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate initial password on component load if empty
  if (!generatedPassword) {
    generatePassword();
  }

  return (
    <div className="flex flex-col gap-5 p-5 bg-slate-100/55 dark:bg-slate-900/10 rounded-3xl border border-slate-200/30">
      <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Password Generator</h4>
      
      {/* Generated output box */}
      <div className="flex items-center justify-between gap-3 p-4 bg-slate-200/50 dark:bg-slate-900/60 rounded-2xl border border-slate-250/20 shadow-inner">
        <span className="font-mono text-sm break-all select-all font-bold">
          {generatedPassword}
        </span>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={generatePassword}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-350/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500 hover:rotate-180 transition-transform duration-300" />
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-350/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Length selector */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span>Length</span>
          <span className="font-mono px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">{length}</span>
        </div>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => {
            setLength(parseInt(e.target.value));
            // Trigger auto-regen on range change
            setTimeout(generatePassword, 0);
          }}
          className="w-full accent-blue-500 cursor-pointer"
        />
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={useUppercase}
            onChange={(e) => {
              setUseUppercase(e.target.checked);
              setTimeout(generatePassword, 0);
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-500"
          />
          <span>ABC</span>
        </label>
        
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={useLowercase}
            onChange={(e) => {
              setUseLowercase(e.target.checked);
              setTimeout(generatePassword, 0);
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-500"
          />
          <span>abc</span>
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={useNumbers}
            onChange={(e) => {
              setUseNumbers(e.target.checked);
              setTimeout(generatePassword, 0);
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-500"
          />
          <span>123</span>
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={useSymbols}
            onChange={(e) => {
              setUseSymbols(e.target.checked);
              setTimeout(generatePassword, 0);
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-500"
          />
          <span>#$&</span>
        </label>
      </div>

      {/* Select button if provided */}
      {onSelectPassword && (
        <button
          type="button"
          onClick={() => onSelectPassword(generatedPassword)}
          className="clay-btn py-3 text-xs"
        >
          Use Generated Password
        </button>
      )}
    </div>
  );
}
