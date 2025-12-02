import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose prose-stone prose-sm max-w-none prose-headings:font-semibold prose-a:text-teal-600 prose-strong:text-stone-800">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
