-- Atualiza o produto TRANS-15554 com o modelo 3D do GitHub raw
UPDATE products
SET model3d_url = 'https://github.com/qualitec1/catalogo-tecnico-qualitec/raw/main/public/model3d.glb'
WHERE name_code = 'TRANS-15554';

-- Verifica se foi atualizado
SELECT id, name_code, title, model3d_url
FROM products
WHERE name_code = 'TRANS-15554';
