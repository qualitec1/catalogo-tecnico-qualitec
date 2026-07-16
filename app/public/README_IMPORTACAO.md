# Guia de Importação CSV - Catálogo Técnico

## Formato do Arquivo

O arquivo CSV deve conter as seguintes colunas obrigatórias:

- `title`: Título do produto
- `name_code`: Código/modelo do produto
- `category`: Categoria (deve existir no sistema)
- `tag`: Tag do produto (ex: NOVO, ATIVO)
- `layout_slots`: Layout de exibição (1, 2, ou 6)
- `image_url`: URL da imagem do produto
- `datasheet_url`: URL ou **nome do arquivo** da ficha técnica
- Colunas adicionais: Especificações técnicas

## Layout Slots

- **`1`** = Layout de 6 produtos por página (grade 3x2)
- **`2`** = Layout de 2 produtos por página (padrão)
- **`6`** = Layout de 1 produto por página (destaque hero)

## Campo `datasheet_url` - NOVO!

O campo `datasheet_url` agora aceita dois formatos:

### 1. URL Completa (tradicional)
```csv
datasheet_url
https://exemplo.com/ficha_tecnica.pdf
```

### 2. **Referência de Arquivo** (novo)
Se você já fez upload do arquivo pelo **Gerenciador de Arquivos**, pode simplesmente colocar o nome do arquivo:

```csv
datasheet_url
CRYOTRONICS COTAÇÃO KIT REPAROS 1298.pdf
```

O sistema irá **automaticamente buscar** o arquivo no storage e vincular ao produto!

## Benefícios da Referência de Arquivo

✅ Não precisa copiar URLs longas  
✅ Basta fazer upload uma vez no Gerenciador de Arquivos  
✅ Use o nome exato do arquivo no CSV  
✅ Sistema busca automaticamente a URL pública

## Fluxo de Trabalho Recomendado

1. **Faça upload** dos PDFs de fichas técnicas no **Gerenciador de Arquivos**
2. **Anote os nomes** dos arquivos enviados
3. **No CSV**, coloque apenas o **nome do arquivo** na coluna `datasheet_url`
4. **Importe o CSV** - o sistema vincula automaticamente!

## Exemplo Completo

### Passo 1: Upload no Gerenciador
- Upload: `Válvula_V123_Datasheet.pdf`
- Upload: `Filtro_F456_Manual.pdf`

### Passo 2: CSV com Referências
```csv
title,name_code,category,datasheet_url
Válvula Industrial V123,V123,VÁLVULAS,Válvula_V123_Datasheet.pdf
Filtro Coalescente F456,F456,FILTROS,Filtro_F456_Manual.pdf
```

### Passo 3: Resultado
✅ Produtos criados com links automáticos para os PDFs!

## Busca Case-Insensitive

A busca por nome de arquivo é **case-insensitive**, ou seja:
- `ARQUIVO.PDF` = `arquivo.pdf` = `Arquivo.Pdf`

Todos encontram o mesmo arquivo! 🎯

## Imagens EX

Para imagens extras, use as colunas:
- `ex_image_url`, `ex_url`, `ex_foto`, `foto_ex`, ou `ex`

Funcionam da mesma forma que `datasheet_url` - podem ser URL ou referência de arquivo!

---

**Dica:** Use o modelo em `modelo_importacao.csv` como base para sua planilha.
