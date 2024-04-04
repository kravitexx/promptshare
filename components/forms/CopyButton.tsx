// CopyButton.tsx
"use client"

import { Button } from "../ui/button";
import React, { useState } from 'react';
interface CopyButtonProps {
  code: string;
  width: string;
  height: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ code, width, height }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Button
    style={{ width: width, height: height }}
      className={`community-card_btn ${isCopied ? 'copied-class' : ''}`}
      onClick={copyToClipboard}
    >
      {isCopied ? 'Copied!' : 'Copy Prompt'}
    </Button>
  );
};

export default CopyButton;
