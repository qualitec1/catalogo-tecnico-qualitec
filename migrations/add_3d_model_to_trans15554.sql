-- Atualiza o produto TRANS-15554 com o modelo 3D
UPDATE products
SET model3d_url = '/model3d.glb'
WHERE name_code = 'TRANS-15554';

-- Verifica se foi atualizado
SELECT id, name_code, title, model3d_url
FROM products
WHERE name_code = 'TRANS-15554';
