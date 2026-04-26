"use client";
import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { motion } from 'motion/react';

const PasswordGen = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState([16]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let characters = '';
    if (options.uppercase) characters += charset.uppercase;
    if (options.lowercase) characters += charset.lowercase;
    if (options.numbers) characters += charset.numbers;
    if (options.symbols) characters += charset.symbols;

    if (characters === '') {
      setPassword('Select at least one option');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(length[0]);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length[0]; i++) {
      generatedPassword += characters.charAt(array[i] % characters.length);
    }
    setPassword(generatedPassword);
    setCopied(false);
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (password.length > 12) score++;
    if (password.length > 20) score++;
    if (options.uppercase) score++;
    if (options.lowercase) score++;
    if (options.numbers) score++;
    if (options.symbols) score++;
    
    if (score < 4) return { label: 'Weak', color: 'text-red-500', icon: ShieldAlert };
    if (score < 6) return { label: 'Medium', color: 'text-yellow-500', icon: ShieldCheck };
    return { label: 'Strong', color: 'text-accent', icon: ShieldCheck };
  };

  const strength = getStrength();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold mb-4">Password Generator</h2>
        <p className="text-soft-white/40 font-sans">
          Create cryptographically secure passwords locally in your browser. 
          No data is ever sent to a server.
        </p>
      </div>

      <div className="space-y-12">
        {/* Output Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-accent/20 blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <div className="relative bg-white/[0.02] border border-border-subtle p-8 flex items-center gap-4">
            <div className="flex-1 font-mono text-2xl tracking-wider text-soft-white overflow-hidden text-ellipsis whitespace-nowrap">
              {password}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={generatePassword}
                className="text-soft-white/20 hover:text-accent transition-subtle"
              >
                <RefreshCw size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyToClipboard}
                className={copied ? 'text-accent' : 'text-soft-white/20 hover:text-accent transition-subtle'}
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Strength Indicator */}
        <div className="flex items-center gap-3">
          <strength.icon size={16} className={strength.color} />
          <span className={`font-mono text-[10px] uppercase tracking-widest ${strength.color}`}>
            Security Strength: {strength.label}
          </span>
          <div className="flex-1 h-px bg-border-subtle/30" />
        </div>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Length: {length[0]}</Label>
              </div>
              <Slider 
                value={length} 
                onValueChange={setLength} 
                max={64} 
                min={8} 
                step={1}
                className="py-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {Object.entries(options).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 border border-border-subtle/50 hover:border-accent/40 transition-subtle group cursor-pointer" onClick={() => setOptions(prev => ({ ...prev, [key]: !value }))}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={key} 
                    checked={value} 
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, [key]: !!checked }))}
                    className="border-soft-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <Label htmlFor={key} className="font-mono text-[11px] uppercase tracking-widest cursor-pointer group-hover:text-soft-white transition-subtle">
                    {key}
                  </Label>
                </div>
                <span className="text-[10px] text-soft-white/10 font-mono">
                  {key === 'uppercase' && 'A-Z'}
                  {key === 'lowercase' && 'a-z'}
                  {key === 'numbers' && '0-9'}
                  {key === 'symbols' && '!@#$%^'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGen;
