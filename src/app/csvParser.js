/**
 * Função para analisar um arquivo CSV e converter em um formato adequado para SQLite
 */
export function parseCSV(csvContent) {
  // Divide o conteúdo por linhas
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    throw new Error("CSV vazio");
  }
  
  // Extrai os cabeçalhos (primeira linha)
  const headers = lines[0].split(',').map(header => 
    header.trim().replace(/["']/g, '').replace(/\s+/g, '_')
  );
  
  // Verifica se há cabeçalhos válidos
  if (!headers || headers.length === 0) {
    throw new Error("Cabeçalhos CSV inválidos");
  }
  
  // Processa as linhas de dados
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    // Divisão simples por vírgula (pode ser melhorado para lidar com campos entre aspas)
    const values = lines[i].split(',').map(val => val.trim());
    
    // Se o número de valores não corresponder ao número de cabeçalhos, ignore a linha
    if (values.length !== headers.length) {
      continue;
    }
    
    // Adiciona a linha de dados
    rows.push(values);
  }
  
  return { headers, rows };
}

/**
 * Determina o tipo de dados para cada coluna com base nos valores
 */
export function inferColumnTypes(rows, headers) {
  // Tipos padrão para cada coluna
  const types = headers.map(() => 'TEXT');
  
  // Se não houver dados para inferência, retorna TEXT para todas as colunas
  if (!rows || rows.length === 0) return types;
  
  // Verifica cada coluna
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    let isNumeric = true;
    let isInteger = true;
    
    // Verifica cada valor na coluna
    for (const row of rows) {
      const value = row[colIndex];
      
      // Ignora valores vazios para inferência de tipo
      if (value === '' || value === null || value === undefined) continue;
      
      // Verifica se é um número
      if (isNaN(Number(value))) {
        isNumeric = false;
        isInteger = false;
        break;
      }
      
      // Verifica se é um inteiro
      if (isNumeric && !Number.isInteger(Number(value))) {
        isInteger = false;
      }
    }
    
    // Define o tipo com base na verificação
    if (isInteger) {
      types[colIndex] = 'INTEGER';
    } else if (isNumeric) {
      types[colIndex] = 'REAL';
    }
  }
  
  return types;
}

/**
 * Gera a instrução SQL CREATE TABLE com base nos cabeçalhos e tipos inferidos
 */
export function generateCreateTableSQL(tableName, headers, columnTypes) {
  const columnDefinitions = headers.map((header, index) => 
    `${header} ${columnTypes[index]}`
  ).join(', ');
  
  return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions});`;
}

/**
 * Gera a instrução SQL INSERT com base nos dados
 */
export function generateInsertSQL(tableName, headers, rows) {
  if (rows.length === 0) return '';
  
  const placeholders = headers.map(() => '?').join(', ');
  return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${placeholders});`;
}
