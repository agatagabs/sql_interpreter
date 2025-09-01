// Exemplos de SQL para o SQL.js Interpreter

export const sqlExamples = [
  {
    title: "Tabela de Funcionários",
    description: "Cria uma tabela de funcionários e insere alguns dados de exemplo",
    code: `-- Basic SQL Demo
-- Create a simple employees table
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary NUMERIC,
  hire_date DATE
);

-- Insert sample data
INSERT INTO employees (name, department, salary, hire_date) VALUES
('Alice Smith', 'Engineering', 85000, '2020-01-15'),
('Bob Johnson', 'Marketing', 72000, '2019-03-20'),
('Carol Williams', 'Engineering', 92000, '2018-11-07'),
('Dave Brown', 'Finance', 115000, '2017-05-12'),
('Eve Davis', 'Engineering', 110000, '2021-08-30');

-- Query the data
SELECT 
  department,
  COUNT(*) as employee_count,
  ROUND(AVG(salary), 2) as avg_salary
FROM employees
GROUP BY department
ORDER BY avg_salary DESC;`
  },
  {
    title: "Análise de Vendas",
    description: "Cria tabelas de produtos e vendas e faz uma análise de vendas por categoria",
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
    description: "Demonstração de funções de data e agregação",
    code: `-- Criando tabela de eventos
DROP TABLE IF EXISTS events;
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  event_name TEXT,
  event_date DATE,
  user_id INTEGER,
  value NUMERIC
);

-- Inserindo dados de exemplo
INSERT INTO events (event_name, event_date, user_id, value) VALUES
('login', '2023-01-01', 1, NULL),
('purchase', '2023-01-01', 1, 50.00),
('login', '2023-01-02', 2, NULL),
('add_to_cart', '2023-01-02', 2, 30.00),
('purchase', '2023-01-03', 2, 30.00),
('login', '2023-01-03', 3, NULL),
('add_to_cart', '2023-01-03', 3, 100.00),
('purchase', '2023-01-04', 3, 100.00),
('login', '2023-01-05', 4, NULL),
('add_to_cart', '2023-01-05', 4, 25.00),
('add_to_cart', '2023-01-05', 4, 35.00),
('purchase', '2023-01-06', 4, 60.00);

-- Análise por dia da semana
SELECT 
  strftime('%w', event_date) as day_of_week,
  COUNT(*) as total_events,
  SUM(CASE WHEN event_name = 'purchase' THEN 1 ELSE 0 END) as purchases,
  ROUND(AVG(CASE WHEN event_name = 'purchase' THEN value END), 2) as avg_purchase_value
FROM events
GROUP BY day_of_week
ORDER BY day_of_week;

-- Análise de conversão
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  SUM(CASE WHEN event_name = 'login' THEN 1 ELSE 0 END) as logins,
  SUM(CASE WHEN event_name = 'add_to_cart' THEN 1 ELSE 0 END) as add_to_carts,
  SUM(CASE WHEN event_name = 'purchase' THEN 1 ELSE 0 END) as purchases,
  ROUND(SUM(CASE WHEN event_name = 'purchase' THEN 1 ELSE 0 END) * 100.0 / 
        COUNT(DISTINCT user_id), 2) as purchase_conversion_rate
FROM events;`
  }
];
