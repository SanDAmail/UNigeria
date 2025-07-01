import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const parseMarkdown = (text: string): string => {
  if (!text) return '';

  const lines = text.split('\n');
  const newLines = [];
  let inList = false;

  for (const line of lines) {
    // Process inline markdown first
    let processedLine = line
      .replace(/<color-green>(.*?)<\/color-green>/g, '<span class="text-primary-green font-semibold">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Check for list items
    if (/^\s*[-*]\s/.test(processedLine)) {
      if (!inList) {
        newLines.push('<ul>');
        inList = true;
      }
      newLines.push(processedLine.replace(/^\s*[-*]\s/, '<li>') + '</li>');
    } else {
      // If the line is not a list item, close the list if it was open
      if (inList) {
        newLines.push('</ul>');
        inList = false;
      }
      // Wrap non-list, non-empty lines in <p> tags
      if (processedLine.trim()) {
        newLines.push(`<p>${processedLine}</p>`);
      }
    }
  }

  // Close any open list at the end of the text
  if (inList) {
    newLines.push('</ul>');
  }

  return newLines.join('');
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const html = parseMarkdown(content);
  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MarkdownRenderer;