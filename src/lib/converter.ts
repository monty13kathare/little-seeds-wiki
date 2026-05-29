/**
 * Simple Markdown <-> TipTap JSON Converter
 * This is a lightweight implementation for the Nexus Platform.
 */

export function jsonToMarkdown(json: string): string {
  try {
    const data = JSON.parse(json);
    if (!data.content) return json;

    let markdown = '';
    
    const processNode = (node: any) => {
      switch (node.type) {
        case 'heading':
          const level = node.attrs?.level || 1;
          markdown += `${'#'.repeat(level)} ${node.content?.map((n: any) => n.text).join('') || ''}\n\n`;
          break;
        case 'paragraph':
          markdown += `${node.content?.map((n: any) => n.text).join('') || ''}\n\n`;
          break;
        case 'bulletList':
          node.content?.forEach((item: any) => {
            markdown += `- ${item.content?.[0]?.content?.map((n: any) => n.text).join('') || ''}\n`;
          });
          markdown += '\n';
          break;
        case 'blockquote':
          markdown += `> ${node.content?.[0]?.content?.map((n: any) => n.text).join('') || ''}\n\n`;
          break;
        case 'codeBlock':
          markdown += `\`\`\`${node.attrs?.language || ''}\n${node.content?.[0]?.text || ''}\n\`\`\`\n\n`;
          break;
        case 'horizontalRule':
          markdown += '---\n\n';
          break;
        case 'table':
          if (node.content) {
            node.content.forEach((row: any, rowIndex: number) => {
              let rowMarkdown = '| ';
              row.content?.forEach((cell: any) => {
                const cellText = cell.content?.[0]?.content?.map((n: any) => n.text).join('') || '';
                rowMarkdown += `${cellText} | `;
              });
              markdown += rowMarkdown.trim() + '\n';
              
              if (rowIndex === 0) {
                // Add separator after header
                let sep = '|';
                row.content?.forEach(() => { sep += '---|'; });
                markdown += sep + '\n';
              }
            });
            markdown += '\n';
          }
          break;
      }
    };

    data.content.forEach(processNode);
    return markdown.trim();
  } catch (e) {
    return json;
  }
}

export function markdownToJSON(markdown: string): string {
  // Simple heuristic: convert headings and paragraphs
  const lines = markdown.split('\n');
  const content: any[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      let codeText = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeText += lines[i] + '\n';
        i++;
      }
      content.push({
        type: 'codeBlock',
        attrs: { language: language || 'javascript' },
        content: codeText ? [{ type: 'text', text: codeText.trim() }] : []
      });
      i++;
      continue;
    } else if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      content.push({
        type: 'heading',
        attrs: { level: Math.min(level, 4) },
        content: [{ type: 'text', text: line.replace(/^#+\s*/, '') }]
      });
    } else if (line.startsWith('- ')) {
      const listItems: any[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: lines[i].trim().replace(/^- \s*/, '') }]
          }]
        });
        i++;
      }
      content.push({ type: 'bulletList', content: listItems });
      continue;
    } else if (line.startsWith('|')) {
      const tableRows: any[] = [];
      let isFirstRow = true;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const tableLine = lines[i].trim();
        
        // Skip alignment/separator row
        if (tableLine.match(/^\|[\s\-:|]+\|$/) && tableLine.includes('-')) {
          i++;
          isFirstRow = false;
          continue;
        }

        const cells = tableLine.split('|').slice(1, -1).map(c => c.trim());
        const rowContent = cells.map(cellText => ({
          type: isFirstRow ? 'tableHeader' : 'tableCell',
          content: [{
            type: 'paragraph',
            content: cellText ? [{ type: 'text', text: cellText }] : []
          }]
        }));

        tableRows.push({
          type: 'tableRow',
          content: rowContent
        });
        
        isFirstRow = false;
        i++;
      }
      content.push({ type: 'table', content: tableRows });
      continue;
    } else if (line === '---') {
      content.push({ type: 'horizontalRule' });
    } else if (line.length > 0) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      });
    }
    i++;
  }

  return JSON.stringify({ type: 'doc', content });
}
