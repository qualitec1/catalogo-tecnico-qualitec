# Configurações Padrão do Sistema

Este diretório contém as configurações padrão do sistema de catálogo PDF.

## defaultPdfSettings.json

Contém todas as configurações padrão de PDF que serão aplicadas:
- Ao criar novas categorias
- Ao importar produtos via CSV
- Ao resetar configurações de uma categoria

### Como atualizar os padrões

Para atualizar as configurações padrão do sistema:

1. Configure uma categoria (ex: GERAL) com todas as configurações desejadas
2. Exporte essas configurações para o arquivo `defaultPdfSettings.json`
3. As novas configurações serão aplicadas automaticamente a:
   - Novos produtos importados
   - Novas categorias criadas
   - Categorias que forem resetadas

### Campos Incluídos

- **Títulos e cabeçalhos**: fontes, tamanhos, cores, posições
- **Cards de produtos**: layout, cores, offsets
- **Especificações**: fontes, cores, larguras de coluna
- **Logo**: tamanho e posição
- **Capa**: fontes e cores do título/subtítulo
- **Imagens**: escalas e offsets padrão
- **Tags e badges**: estilos e posicionamento

### Função de Reset

Para resetar uma categoria para os padrões:

```typescript
await resetToDefaults(category, supabase)
```

Esta função:
1. Confirma com o usuário
2. Aplica todas as configurações do `defaultPdfSettings.json`
3. Limpa todos os overrides de densidade (layout 1, 3, 6)
