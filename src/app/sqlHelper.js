'use client';

// Uma lista simples de palavras-chave SQL para colorir no editor
export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'DATABASE', 'VIEW',
  'INTO', 'VALUES', 'GROUP', 'BY', 'ORDER', 'HAVING',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL',
  'ON', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN',
  'BETWEEN', 'LIKE', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
  'DISTINCT', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'CASE',
  'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'EXISTS', 'PRIMARY',
  'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'INDEX', 'INTEGER',
  'TEXT', 'VARCHAR', 'DATE', 'DATETIME', 'BOOLEAN', 'FLOAT',
  'DOUBLE', 'DECIMAL', 'NUMERIC', 'CONSTRAINT', 'DEFAULT'
];

// Função para adicionar cores à sintaxe SQL
export function highlightSqlSyntax(code) {
  if (!code) return "";

  // Regex patterns para tipos de conteúdo SQL
  const patterns = [
    // Comentários
    { pattern: /--(.*?)(?:\r?\n|$)/g, style: 'sql-comment', color: '#888' },
    // Strings com aspas simples
    { pattern: /'(.*?)'/g, style: 'sql-string', color: '#28a745' },
    // Strings com aspas duplas
    { pattern: /"(.*?)"/g, style: 'sql-string', color: '#28a745' },
    // Palavras-chave SQL (case insensitive)
    { 
      pattern: new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi'),
      style: 'sql-keyword', 
      color: '#FF0066',
      transform: match => match.toUpperCase()
    },
    // Números
    { pattern: /\b\d+(\.\d+)?\b/g, style: 'sql-number', color: '#17a2b8' }
  ];

  // Aplicar cada padrão em sequência
  let html = code;
  patterns.forEach(({ pattern, style, color, transform }) => {
    html = html.replace(pattern, (match, group) => {
      const content = transform ? transform(match) : (group !== undefined ? group : match);
      return `<span class="${style}" style="color: ${color}; font-weight: ${style === 'sql-keyword' ? 'bold' : 'normal'}">${style === 'sql-comment' ? match : content}</span>`;
    });
  });

  return html;
}

// Função para formatar o código SQL
export function formatSql(sql) {
  // Esta é uma implementação básica, para uma formatação mais robusta 
  // seria melhor usar uma biblioteca dedicada
  
  if (!sql) return sql;
  
  // Remove espaços extras
  sql = sql.trim();
  
  // Adiciona quebra de linha após ponto e vírgula
  sql = sql.replace(/;/g, ';\n\n');
  
  // Adiciona quebra de linha após palavras-chave principais
  const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 
                   'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
                   'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'];
                   
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sql = sql.replace(regex, `\n${keyword}`);
  });
  
  return sql;
}
