import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const parseMarkdown = (text: string): string => {
  if (!text) return '';

  const lines = text.split('\n');
  const newLines = [];
  let inList = false;
  let inBlockquote = false;

  for (const line of lines) {
    let processedLine = line
      .replace(/<color-green>(.*?)<\/color-green>/g, '<span class="text-primary-green font-semibold">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

    if (/^>\s?/.test(processedLine)) {
      if (inList) {
        newLines.push('</ul>');
        inList = false;
      }
      if (!inBlockquote) {
        newLines.push('<blockquote>');
        inBlockquote = true;
      }
      newLines.push(processedLine.replace(/^>\s?/, ''));
    } else if (/^\s*[-*]\s/.test(processedLine)) {
      if (inBlockquote) {
        newLines.push('</blockquote>');
        inBlockquote = false;
      }
      if (!inList) {
        newLines.push('<ul>');
        inList = true;
      }
      newLines.push(processedLine.replace(/^\s*[-*]\s/, '<li>') + '</li>');
    } else {
      if (inList) {
        newLines.push('</ul>');
        inList = false;
      }
      if (inBlockquote) {
        newLines.push('</blockquote>');
        inBlockquote = false;
      }
      if (processedLine.trim()) {
        newLines.push(`<p>${processedLine}</p>`);
      }
    }
  }

  if (inList) newLines.push('</ul>');
  if (inBlockquote) newLines.push('</blockquote>');

  return newLines.join('');
};


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const html = parseMarkdown(content);
  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MarkdownRenderer;