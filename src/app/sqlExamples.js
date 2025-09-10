// Exemplos de SQL para o SQL.js Interpreter

export const sqlExamples = [
  {
    title: "Quantas corridas foram concluidas com sucesso?",
    code: `SELECT COUNT(*) AS total_concluidas
FROM corridas
WHERE status_da_reserva = 'Concluída';
`
  },
  {
    title: "Qual o valor médio das corridas por tipo de veículo?",
    code: `-- Criando as tabelas
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC
);

DROP TABLE IF EXISTS sales;
CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  sale_date DATE,
  quantity INTEGER,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Inserindo dados de produtos
INSERT INTO products (name, category, price) VALUES
('Smartphone XYZ', 'Eletrônicos', 1200),
('Laptop Pro', 'Eletrônicos', 2500),
('Fones de Ouvido', 'Acessórios', 150),
('Mouse Sem Fio', 'Acessórios', 80),
('Teclado Mecânico', 'Acessórios', 120),
('TV 4K', 'Eletrônicos', 3000);

-- Inserindo dados de vendas
INSERT INTO sales (product_id, sale_date, quantity) VALUES
(1, '2023-01-10', 5),
(2, '2023-01-15', 2),
(3, '2023-01-20', 10),
(4, '2023-02-05', 8),
(5, '2023-02-10', 5),
(1, '2023-02-15', 3),
(2, '2023-03-01', 1),
(6, '2023-03-10', 2);

-- Análise de vendas por categoria
SELECT 
  p.category,
  SUM(s.quantity) as total_quantity,
  SUM(s.quantity * p.price) as total_revenue,
  COUNT(DISTINCT p.id) as unique_products
FROM sales s
JOIN products p ON s.product_id = p.id
GROUP BY p.category
ORDER BY total_revenue DESC;`
  },
  {
    title: "Análise de Dados por Data",
    code: `SELECT tipo_de_veiculo,
       AVG(valor_da_reserva) AS valor_medio
FROM corridas
WHERE valor_da_reserva IS NOT NULL
GROUP BY tipo_de_veiculo
ORDER BY valor_medio DESC;
`
  },
  {
    title: "Qual a taxa de corridas canceladas (motorista + cliente) em relação ao total?",
    code: `SELECT
  SUM(CASE WHEN status_da_reserva IN ('Cancelada pelo motorista','Cancelada pelo cliente')
           THEN 1 ELSE 0 END
  ) * 1.0 / COUNT(*) AS taxa_cancelamento
FROM corridas;
`
  },
  {
    title: "Média de avaliação do motorista e do cliente por método de pagamento",
    code: `SELECT metodo_de_pagamento,
       AVG(avaliacao_do_motorista) AS media_motorista,
       AVG(avaliacao_do_cliente) AS media_cliente
FROM corridas
WHERE metodo_de_pagamento IS NOT NULL
GROUP BY metodo_de_pagamento;
`
  }
];
