'use client'

import { useState, useEffect, useRef } from "react"
import initSqlJs from "sql.js"
import styles from "./page.module.css"
import { sqlExamples } from "./sqlExamples"
import { highlightSqlSyntax, formatSql } from "./sqlHelper"
import { parseCSV, inferColumnTypes, generateCreateTableSQL, generateInsertSQL } from "./csvParser"

export function Sql() {
  const [query, setQuery] = useState("")
  const [db, setDb] = useState(null)
  const [results, setResults] = useState([{ id: 1, data: [], error: "", timestamp: new Date().toISOString() }])
  const [activeResultId, setActiveResultId] = useState(1)
  const [showExamples, setShowExamples] = useState(false)
  const [lineCount, setLineCount] = useState(1)
  const [highlightedQuery, setHighlightedQuery] = useState("")
  const [importedTables, setImportedTables] = useState([])
  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)
  const previewRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const loadDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `/sql-wasm.wasm` 
        })
        const dbInstance = new SQL.Database()
        dbInstance.run("CREATE TABLE users (id INTEGER, name TEXT);") 
        dbInstance.run("INSERT INTO users VALUES (1, 'Leonardo'), (2, 'Agata');")
        setDb(dbInstance)
      } catch (err) {
        setError("Erro ao carregar o SQL.js: " + err.message)
      }
    }
    loadDb()
  }, [])
  
  // Inicializa o destacamento de código
  useEffect(() => {
    if (query) {
      setHighlightedQuery(highlightSQLCode(query));
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!db) return
    try {
      const res = db.exec(query)
      
      // Atualizar o resultado atual
      setResults(prevResults => {
        const updatedResults = [...prevResults];
        const activeResultIndex = updatedResults.findIndex(r => r.id === activeResultId);
        
        if (activeResultIndex !== -1) {
          updatedResults[activeResultIndex] = {
            ...updatedResults[activeResultIndex],
            data: res,
            error: "",
            timestamp: new Date().toISOString(),
            query: query // Salva a consulta executada
          };
        }
        
        return updatedResults;
      });
    } catch (err) {
      console.error("Erro ao executar query:", err)
      
      setResults(prevResults => {
        const updatedResults = [...prevResults];
        const activeResultIndex = updatedResults.findIndex(r => r.id === activeResultId);
        
        if (activeResultIndex !== -1) {
          updatedResults[activeResultIndex] = {
            ...updatedResults[activeResultIndex],
            data: [],
            error: err.toString(),
            timestamp: new Date().toISOString()
          };
        }
        
        return updatedResults;
      });
    }
  }
  
  function addNewResultTab() {
    const newId = results.length > 0 ? Math.max(...results.map(r => r.id)) + 1 : 1;
    setResults(prev => [
      ...prev,
      { id: newId, data: [], error: "", timestamp: new Date().toISOString() }
    ]);
    setActiveResultId(newId);
  }
  
  function switchToResultTab(id) {
    setActiveResultId(id);
  }
  
  function removeResultTab(id) {
    if (results.length <= 1) return;
    
    const updatedResults = results.filter(r => r.id !== id);
    setResults(updatedResults);
    
    // Se o tab ativo foi removido, selecionar o primeiro disponível
    if (activeResultId === id) {
      setActiveResultId(updatedResults[0].id);
    }
  }

  function handleKeyDown(e) {
    // Execute on Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
    
    // Format on Ctrl+Shift+F
    if (e.key === 'f' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      formatCode();
    }
    
    // Auto-indent on tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // Inserir 2 espaços em vez da tabulação
      const newValue = query.substring(0, start) + '  ' + query.substring(end);
      setQuery(newValue);
      
      // Mover o cursor após a tabulação
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  }
  
  function formatCode() {
    const formattedCode = formatSql(query);
    setQuery(formattedCode);
    // Atualizar contagem de linhas após formatação
    setTimeout(updateLineCount, 0);
  }
  
  function updateLineCount() {
    if (!query) {
      setLineCount(1);
      return;
    }
    
    // Conta o número de quebras de linha no texto + 1
    const lines = query.split('\n').length;
    setLineCount(lines);
    
    // Sincronizar scroll entre o textarea e os números de linha
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }
  
  // Função para destacar palavras-chave SQL
  function highlightSQLCode(text) {
    if (!text) return "";
    
    // Lista de palavras-chave SQL para destacar
    const sqlKeywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 
      'CREATE', 'ALTER', 'DROP', 'TABLE', 'DATABASE', 'INTO', 'VALUES', 
      'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'GROUP', 'BY', 
      'ORDER', 'HAVING', 'LIMIT', 'AS', 'ON', 'AND', 'OR', 'NOT', 
      'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE', 'DISTINCT', 'COUNT', 
      'SUM', 'AVG', 'MIN', 'MAX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
      'IF', 'EXISTS', 'SET', 'CONSTRAINT', 'DEFAULT'
    ];
    
    // Substitui as palavras-chave por spans com classe para coloração (com cor rosa)
    const highlighted = text.replace(
      new RegExp(`\\b(${sqlKeywords.join('|')})\\b`, 'gi'),
      match => `<span class="${styles.sqlKeyword}" style="color: var(--highlight-pink); font-weight: bold;">${match}</span>`
    );
    
    return highlighted;
  }

  // Manipulador de eventos para o textarea
  function handleTextChange(e) {
    const newText = e.target.value;
    setQuery(newText);
    setHighlightedQuery(highlightSQLCode(newText));
    updateLineCount();
    
    // Sincroniza o scroll do preview com o textarea
    if (textareaRef.current && previewRef.current) {
      previewRef.current.scrollTop = textareaRef.current.scrollTop;
      previewRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }
  
  // Sincroniza o scroll entre o textarea e os números de linha
  function handleScroll() {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      
      if (previewRef.current) {
        previewRef.current.scrollTop = textareaRef.current.scrollTop;
        previewRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    }
  }
  
  async function handleLoadTable() {
    if (!fileInputRef.current) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv';
      fileInputRef.current = fileInput;
    }
    
    fileInputRef.current.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        
        // Extrai o nome do arquivo sem extensão para usar como nome da tabela
        const tableName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        
        // Lê o conteúdo do arquivo CSV
        const content = await file.text();
        
        // Analisa o CSV
        const { headers, rows } = parseCSV(content);
        
        // Inferir tipos de coluna
        const columnTypes = inferColumnTypes(rows, headers);
        
        // Gerar SQL para criar a tabela
        const createTableSQL = generateCreateTableSQL(tableName, headers, columnTypes);
        
        // Executar o SQL para criar a tabela
        if (db) {
          try {
            // Criar a tabela
            db.run(createTableSQL);
            
            // Inserir os dados
            if (rows.length > 0) {
              const stmt = db.prepare(generateInsertSQL(tableName, headers, rows));
              
              // Inserir cada linha
              for (const row of rows) {
                stmt.run(row);
              }
              
              stmt.free();
            }
            
            // Adicionar à lista de tabelas importadas
            setImportedTables(prev => [...prev, { name: tableName, columns: headers.length, rows: rows.length }]);
            
            // Exibe uma consulta de exemplo para a nova tabela
            const exampleQuery = `SELECT * FROM ${tableName} LIMIT 10;`;
            setQuery(exampleQuery);
            setHighlightedQuery(highlightSQLCode(exampleQuery));
            updateLineCount();
            
            // Mostrar mensagem de sucesso
            addNewResultTab();
            setResults(prev => {
              const newResults = [...prev];
              const lastIndex = newResults.length - 1;
              newResults[lastIndex] = {
                ...newResults[lastIndex],
                data: [],
                error: "",
                successMessage: `Tabela '${tableName}' importada com sucesso! ${rows.length} linhas inseridas.`,
                timestamp: new Date().toISOString()
              };
              return newResults;
            });
            
          } catch (err) {
            // Em caso de erro na criação da tabela
            addNewResultTab();
            setResults(prev => {
              const newResults = [...prev];
              const lastIndex = newResults.length - 1;
              newResults[lastIndex] = {
                ...newResults[lastIndex],
                data: [],
                error: `Erro ao importar CSV: ${err.message}`,
                timestamp: new Date().toISOString()
              };
              return newResults;
            });
          }
        }
      } catch (err) {
        // Em caso de erro na leitura/análise do CSV
        addNewResultTab();
        setResults(prev => {
          const newResults = [...prev];
          const lastIndex = newResults.length - 1;
          newResults[lastIndex] = {
            ...newResults[lastIndex],
            data: [],
            error: `Erro ao processar arquivo CSV: ${err.message}`,
            timestamp: new Date().toISOString()
          };
          return newResults;
        });
      }
      
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      fileInputRef.current.value = '';
    };
    
    // Abre o diálogo de seleção de arquivo
    fileInputRef.current.click();
  }

  function loadExample(code) {
    setQuery(code)
    setHighlightedQuery(highlightSQLCode(code))
    setShowExamples(false)
    // Atualizar a contagem de linhas
    setTimeout(() => {
      updateLineCount();
      // Dar foco ao textarea e posicionar o cursor no início
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.selectionStart = 0
        textareaRef.current.selectionEnd = 0
      }
    }, 0);
  }
  
  // Adiciona uma função para mostrar a lista de tabelas disponíveis
  function showTablesList() {
    if (!db) return;
    
    try {
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
      if (tables && tables.length > 0 && tables[0].values.length > 0) {
        let tableListQuery = "-- Tabelas disponíveis no banco de dados:\n";
        tables[0].values.forEach(table => {
          tableListQuery += `-- * ${table[0]}\n`;
        });
        tableListQuery += "\n-- Exemplo de consulta:\n";
        tableListQuery += `SELECT * FROM ${tables[0].values[0][0]} LIMIT 10;`;
        
        setQuery(tableListQuery);
        setHighlightedQuery(highlightSQLCode(tableListQuery));
        updateLineCount();
      }
    } catch (err) {
      console.error("Erro ao listar tabelas:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="Dados para Elas x ARTEFACT" className={styles.logo} />
        </div>
        <h1 className={styles.title}>SQL Interpreter</h1>
        <div className={styles.actions}>
          <button type="submit" className={styles.executeButton}>Execute</button>
          <button type="button" className={styles.loadButton} onClick={handleLoadTable}>Load Table</button>
          <button type="button" className={styles.tablesButton} onClick={showTablesList}>Tables</button>
          <button 
            type="button" 
            className={styles.examplesButton}
            onClick={() => setShowExamples(!showExamples)}
          >
            Examples
          </button>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <span>SQL Editor</span>
            <div className={styles.shortcuts}>
              <span>Ctrl+Enter</span>
            </div>
          </div>
          
          {showExamples && (
            <div className={styles.examplesPanel}>
              <h3>SQL Examples</h3>
              <div className={styles.exampleList}>
                {sqlExamples.map((example, index) => (
                  <div key={index} className={styles.exampleItem} onClick={() => loadExample(example.code)}>
                    <h4>{example.title}</h4>
                    <p>{example.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.editorWithLineNumbers}>
            <div className={styles.lineNumbers} ref={lineNumbersRef}>
              {Array.from({length: lineCount}, (_, i) => (
                <div key={i} className={styles.lineNumber}>{i + 1}</div>
              ))}
            </div>
            <div className={styles.editorContent}>
              <textarea
                ref={textareaRef}
                name="queryInput"
                className={styles.input}
                placeholder="Digite seu código SQL aqui..."
                value={query}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                spellCheck="false"
              />
              <pre 
                ref={previewRef}
                className={styles.syntaxHighlight}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: highlightedQuery }}
              ></pre>
            </div>
          </div>
        </div>
        
        <div className={styles.resultContainer}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTabs}>
              {results.map(res => (
                <div 
                  key={res.id}
                  className={`${styles.resultTab} ${res.id === activeResultId ? styles.activeTab : ''}`}
                  onClick={() => switchToResultTab(res.id)}
                >
                  <span>Result {res.id}</span>
                  {results.length > 1 && (
                    <button 
                      className={styles.closeTab} 
                      onClick={(e) => { e.stopPropagation(); removeResultTab(res.id); }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button className={styles.addTabButton} onClick={addNewResultTab}>+</button>
            </div>
          </div>
          
          {results.map(res => {
            const currentResult = res.data;
            const currentError = res.error;
            const isActive = res.id === activeResultId;
            
            if (!isActive) return null;
            
            return (
              <div key={res.id} className={styles.result}>
                {currentError ? (
                  <div className={styles.errorMessage}>
                    <strong>Erro SQL:</strong> {currentError}
                  </div>
                ) : res.successMessage ? (
                  <>
                    <div className={styles.successMessage}>
                      <strong>Sucesso:</strong> {res.successMessage}
                    </div>
                    
                    {importedTables.length > 0 && (
                      <div className={styles.importedTablesContainer}>
                        <h3>Tabelas Importadas</h3>
                        <div className={styles.importedTablesList}>
                          {importedTables.map((table, idx) => (
                            <div 
                              key={idx} 
                              className={styles.importedTableItem}
                              onClick={() => {
                                const query = `SELECT * FROM ${table.name} LIMIT 10;`;
                                setQuery(query);
                                setHighlightedQuery(highlightSQLCode(query));
                                updateLineCount();
                              }}
                            >
                              <h4>{table.name}</h4>
                              <div className={styles.tableStats}>
                                <span>{table.columns} colunas</span>
                                <span>{table.rows} linhas</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : currentResult.length > 0 ? (
                  <>
                    <div className={styles.resultStats}>
                      <span>Consulta #{res.id} - {new Date(res.timestamp).toLocaleTimeString()}</span>
                      <span>{currentResult[0]?.values?.length || 0} linhas | {currentResult[0]?.columns?.length || 0} colunas</span>
                    </div>
                    {res.query && <div className={styles.executedQuery}>{res.query}</div>}
                    <table className={styles.resultTable}>
                      <thead>
                        <tr>
                          {currentResult[0].columns.map((col, i) => (
                            <th key={i}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentResult[0].values.map((row, i) => (
                          <tr key={i}>
                            {row.map((val, j) => (
                              <td key={j}>{val === null ? 'NULL' : String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className={styles.noResults}>
                    {importedTables.length > 0 
                      ? 'Execute uma consulta nas tabelas importadas' 
                      : 'Os resultados da sua consulta SQL aparecerão aqui. Importe uma tabela CSV para começar.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </form>
  )
}
