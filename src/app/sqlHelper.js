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
  if (!code) return code;

  // Dividindo o código em tokens (simplificado)
  let tokens = code.split(/(\s+|[,;().])/);
  
  // Destaca palavras-chave SQL
  const highlighted = tokens.map(token => {
    const upperToken = token.toUpperCase();
    
    if (SQL_KEYWORDS.includes(upperToken)) {
      return `<span class="sql-keyword">${token}</span>`;
    } 
    
    // Destaca strings
    if ((token.startsWith("'") && token.endsWith("'")) || 
        (token.startsWith('"') && token.endsWith('"'))) {
      return `<span class="sql-string">${token}</span>`;
    }
    
    // Destaca números
    if (!isNaN(token) && token.trim() !== '') {
      return `<span class="sql-number">${token}</span>`;
    }
    
    // Destaca comentários (simplificado)
    if (token.trim().startsWith('--')) {
      return `<span class="sql-comment">${token}</span>`;
    }
    
    return token;
  });
  
  return highlighted.join('');
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
