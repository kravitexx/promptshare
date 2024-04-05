// AIToolsButton.tsx
import React from 'react';
import {Button} from '../ui/button'; // Adjust the import path as needed

interface AIToolsButtonProps {
  width: string;
  height: string;
}

const AIToolsButton: React.FC<AIToolsButtonProps> = ({ width, height }) => {
  return (
    <a href="https://linktr.ee/kravitexx" target="_blank" rel="noopener noreferrer" className="ai-tools-link">
      <Button style={{ width, height }} className="community-card_btn">
        AI Tools
      </Button>
    </a>
  );
};

export default AIToolsButton;
