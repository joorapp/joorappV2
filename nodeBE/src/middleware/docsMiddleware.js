/**
 * @author Bhavesh Venugopal
 * Documentation Middleware
 * Handles API documentation rendering and formatting
 */

/**
 * Format documentation response
 * @param {Object} docs - Documentation object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const formatDocsResponse = (docs, req, res) => {
  const format = req.query.format || 'json';
  const includeExamples = req.query.examples !== 'false';
  
  let response = {
    success: true,
    message: `${docs.module} module documentation`,
    data: {
      ...docs,
      timestamp: new Date().toISOString(),
      requestedAt: new Date().toISOString(),
      format: format
    }
  };

  // Remove examples if not requested
  if (!includeExamples && response.data.examples) {
    delete response.data.examples;
  }

  // Set appropriate content type
  switch (format.toLowerCase()) {
    case 'html':
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(generateHTMLDocs(response.data));
    
    case 'markdown':
      res.setHeader('Content-Type', 'text/markdown');
      return res.status(200).send(generateMarkdownDocs(response.data));
    
    case 'json':
    default:
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(response);
  }
};

/**
 * Generate HTML documentation
 * @param {Object} docs - Documentation object
 * @returns {string} HTML string
 */
const generateHTMLDocs = (docs) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docs.module} API Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .endpoint { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; margin: 20px 0; padding: 20px; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px; }
        .get { background: #28a745; color: white; }
        .post { background: #007bff; color: white; }
        .put { background: #ffc107; color: black; }
        .delete { background: #dc3545; color: white; }
        .path { font-family: monospace; font-size: 16px; color: #2c3e50; }
        .description { margin: 10px 0; color: #6c757d; }
        .code { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; margin: 10px 0; font-family: monospace; overflow-x: auto; }
        .status-code { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin: 2px; }
        .status-200 { background: #d4edda; color: #155724; }
        .status-500 { background: #f8d7da; color: #721c24; }
        h1, h2, h3 { color: #2c3e50; }
        .badge { display: inline-block; padding: 4px 8px; background: #6c757d; color: white; border-radius: 4px; font-size: 12px; margin: 2px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${docs.module} API Documentation</h1>
            <p>${docs.description}</p>
            <p><strong>Version:</strong> ${docs.version} | <strong>Base Path:</strong> ${docs.basePath}</p>
        </div>
        <div class="content">
            <h2>Endpoints (${docs.totalEndpoints})</h2>
            ${docs.endpoints.map(endpoint => `
                <div class="endpoint">
                    <div>
                        <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                        <span class="path">${endpoint.path}</span>
                    </div>
                    <h3>${endpoint.summary}</h3>
                    <p class="description">${endpoint.description}</p>
                    <div>
                        ${endpoint.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
                    </div>
                    <h4>Response Example:</h4>
                    <div class="code">${JSON.stringify(endpoint.responseExample, null, 2)}</div>
                    <h4>Status Codes:</h4>
                    <div>
                        ${Object.entries(endpoint.statusCodes).map(([code, desc]) => 
                            `<span class="status-code status-${code}">${code}: ${desc}</span>`
                        ).join('')}
                    </div>
                </div>
            `).join('')}
            
            ${docs.examples ? `
                <h2>Usage Examples</h2>
                <h3>cURL</h3>
                ${Object.entries(docs.examples.curl).map(([name, cmd]) => `
                    <div class="code">${cmd}</div>
                `).join('')}
                
                <h3>JavaScript</h3>
                ${Object.entries(docs.examples.javascript).map(([name, code]) => `
                    <div class="code">${code}</div>
                `).join('')}
            ` : ''}
            
            ${docs.notes ? `
                <h2>Notes</h2>
                <ul>
                    ${docs.notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
};

/**
 * Generate Markdown documentation
 * @param {Object} docs - Documentation object
 * @returns {string} Markdown string
 */
const generateMarkdownDocs = (docs) => {
  let markdown = `# ${docs.module} API Documentation\n\n`;
  markdown += `${docs.description}\n\n`;
  markdown += `**Version:** ${docs.version}  \n`;
  markdown += `**Base Path:** ${docs.basePath}  \n`;
  markdown += `**Last Updated:** ${docs.lastUpdated}\n\n`;
  
  markdown += `## Endpoints (${docs.totalEndpoints})\n\n`;
  
  docs.endpoints.forEach(endpoint => {
    markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
    markdown += `**${endpoint.summary}**\n\n`;
    markdown += `${endpoint.description}\n\n`;
    
    if (endpoint.tags && endpoint.tags.length > 0) {
      markdown += `**Tags:** ${endpoint.tags.join(', ')}\n\n`;
    }
    
    markdown += `#### Response Example\n\n`;
    markdown += `\`\`\`json\n${JSON.stringify(endpoint.responseExample, null, 2)}\n\`\`\`\n\n`;
    
    if (endpoint.statusCodes) {
      markdown += `#### Status Codes\n\n`;
      Object.entries(endpoint.statusCodes).forEach(([code, desc]) => {
        markdown += `- **${code}:** ${desc}\n`;
      });
      markdown += '\n';
    }
    
    markdown += '---\n\n';
  });
  
  if (docs.examples) {
    markdown += `## Usage Examples\n\n`;
    
    if (docs.examples.curl) {
      markdown += `### cURL\n\n`;
      Object.entries(docs.examples.curl).forEach(([name, cmd]) => {
        markdown += `\`\`\`bash\n${cmd}\n\`\`\`\n\n`;
      });
    }
    
    if (docs.examples.javascript) {
      markdown += `### JavaScript\n\n`;
      Object.entries(docs.examples.javascript).forEach(([name, code]) => {
        markdown += `\`\`\`javascript\n${code}\n\`\`\`\n\n`;
      });
    }
  }
  
  if (docs.notes) {
    markdown += `## Notes\n\n`;
    docs.notes.forEach(note => {
      markdown += `- ${note}\n`;
    });
  }
  
  return markdown;
};
