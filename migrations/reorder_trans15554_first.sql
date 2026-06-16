-- Coloca o TRANS-15554 como primeiro item (id menor ou sort_order = 0)
-- Opção 1: Se a tabela tem coluna sort_order
UPDATE products SET sort_order = 0 WHERE name_code = 'TRANS-15554';
UPDATE products SET sort_order = sort_order + 1 WHERE name_code != 'TRANS-15554' AND sort_order >= 0;

-- Opção 2: Se ordenar por ID, altera o ID para o menor possível
-- Primeiro, verificar qual é o menor ID atual
-- SELECT MIN(id) FROM products;
-- Depois trocar o ID (requer desabilitar constraints temporariamente)

-- Verifique o resultado:
SELECT id, name_code, title, sort_order, model3d_url
FROM products
ORDER BY sort_order NULLS LAST, id
LIMIT 5;
