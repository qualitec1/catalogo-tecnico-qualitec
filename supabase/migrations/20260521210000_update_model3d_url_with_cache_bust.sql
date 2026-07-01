-- Atualiza URL do modelo 3D com cache busting para forçar download da versão nova (8MB comprimida)
UPDATE products
SET model3d_url = 'https://cdn.jsdelivr.net/gh/qualitec1/catalogo-tecnico-qualitec@027699f/public/model3d.glb'
WHERE name_code = 'TRANS-15554';

-- Ou use essa versão com timestamp para forçar bypass de cache:
-- UPDATE products
-- SET model3d_url = 'https://cdn.jsdelivr.net/gh/qualitec1/catalogo-tecnico-qualitec@main/public/model3d.glb?v=1781623297'
-- WHERE name_code = 'TRANS-15554';

-- Confirma a atualização:
SELECT name_code, title, model3d_url 
FROM products 
WHERE name_code = 'TRANS-15554';
