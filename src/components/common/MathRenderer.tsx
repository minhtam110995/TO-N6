import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { splitMathText } from '../../services/mathText';

export const MathText: React.FC<{ text: string }> = ({ text }) => <>{splitMathText(text).map((part, i) => typeof part === 'string' ? part : <MathRenderer key={i} fraction={part} />)}</>;

interface MathRendererProps {
  formula?: string;
  fraction?: { top: string | React.ReactNode; bottom: string | React.ReactNode };
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  formula,
  fraction,
  className = '',
  inline = false,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (formula && containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          displayMode: !inline,
          throwOnError: false,
        });
      } catch {
        containerRef.current.innerText = formula;
      }
    }
  }, [formula, inline]);

  if (fraction) {
    return (
      <span className={`inline-flex flex-col items-center justify-center font-bold px-1.5 align-middle leading-tight ${className}`}>
        <span className="border-b-2 border-current px-1 text-center w-full pb-0.5">{fraction.top}</span>
        <span className="px-1 text-center w-full pt-0.5">{fraction.bottom}</span>
      </span>
    );
  }

  if (formula) {
    return <span ref={containerRef} className={`math-formula ${className}`} />;
  }

  return null;
};
