import os

file_path = r"c:\Users\Vendas2\Desktop\COTAÇÕES\Instrucoes_Criar_Pagina_Painel_Catalogo.md"

content = """# Guia e Prompt para Criar a Página do Painel White Martins no Projeto do Catálogo

Este documento contém o passo a passo exato e o **Prompt Pronto** para você abrir o projeto do seu catálogo (`D:\\site qualitec` ou `D:\\catalogo manometros`) e solicitar a criação automática de uma página completa e interativa para este painel.

---

## 🚀 Passo a Passo Rápido

1. **Abra o Projeto do Catálogo na IDE**:
   * No menu superior, clique em **File** -> **Open Folder** (ou `Ctrl + K, Ctrl + O`).
   * Selecione a pasta do seu site catálogo:
     * `D:\\site qualitec` (ou `D:\\catalogo manometros`).
2. **Abra um novo chat**:
   * Inicie uma nova conversa comigo nessa pasta.
3. **Copie e Cole o Prompt abaixo** no chat e dê Enter!

---

## 📋 PROMPT PRONTO PARA COPIAR E COLAR

```text
Olá! Eu quero criar uma página exclusiva e interativa no meu projeto para o Painel de Gestão de Pedidos Pendentes do cliente WHITE MARTINS.

Eu já realizei o levantamento completo dos dados no ITKSoft (banco db_qualitecnew) e já tenho a estrutura mapeada. Eu quero que você crie uma página dedicada no meu site (Nuxt 3 / Vue / Tailwind) chamada:
pages/admin/pendencias-white-martins.vue (ou pages/pendencias-white-martins.vue)

A página deve ter um design profissional, limpo e intuitivo (Dark/Light mode integrado ao tema do catálogo), contendo:

1. CARDS DE KPI NO TOPO:
   - Valor Total Pendente a Faturar (R$ 1.758.773,73)
   - Total de Pedidos em Aberto (138 Pedidos)
   - Total de Pedidos 100% Pendentes sem NF (84 Pedidos)
   - Total de Pedidos Parcialmente Faturados (51 Pedidos)
   - Valor de Itens Importados Pendentes (R$ 1.039.298,78 - 137 itens)
   - Valor de Itens Nacionais Pendentes (R$ 719.474,95 - 69 itens)

2. BARRA DE FILTROS AVANÇADOS E INTERATIVOS:
   - Filtro por Região (Todas, Sudeste, Nordeste, Centro-Oeste, Sul, Norte)
   - Filtro por Filial White Martins (Contagem, Duque de Caxias, Vinhedo, Jaboatão, Salvador, Cariacica, etc.)
   - Filtro por Status (Todos, 100% Pendente, Parcialmente Faturado, Pré-Nota Gerada)
   - Filtro por Origem (Todos, Importado, Nacional)
   - Filtro por Período / Ordenação por Data (Mais antigos primeiro ou Mais recentes primeiro)
   - Campo de Busca Livre (para buscar por número do pedido ITK, pedido do cliente, nome do produto ou Part Number)

3. TABELA PRINCIPAL DE PEDIDOS (COM EXPANSÃO DE ITENS):
   - Cada linha deve exibir: Região, Filial, Pedido ITK, Pedido Cliente, Data de Emissão, Dias em Aberto, Valor Total, Valor Faturado, Valor Pendente, Status de Faturamento e Status Logístico (se tem Romaneio, Ordem de Separação ou NF).
   - Ao clicar na linha ou no botão de expansão (+), abrir uma sanfona/subtabela mostrando os itens daquele pedido com: Part Number, Código, Descrição, Unidade, Origem (badge Importado/Nacional), Qtd Pedida, Qtd Faturada, Qtd Pendente, Preço Unitário e Valor Pendente.

4. ABA ALTERNATIVA OU VISÃO "ITENS MAIS CAROS":
   - Uma aba para ver diretamente o ranking dos itens pendentes ordenados do mais caro para o mais barato.

5. BOTÃO "EXPORTAR EXCEL / CSV":
   - Botão para baixar os dados filtrados em formato Excel ou CSV.

FONTE DOS DADOS:
Você pode criar o endpoint backend em `server/api/pedidos-white-martins.get.ts`.
Os dados consolidados de todos os 138 pedidos e 206 itens já foram extraídos e estão disponíveis no arquivo:
C:\\Users\\Vendas2\\Desktop\\COTAÇÕES\\Relatorio_Pendencias_White_Martins.xlsx
e no JSON de apoio:
C:\\Users\\Vendas2\\.gemini\\antigravity-ide\\brain\\bd9a4848-8328-4c46-becf-679f0946637b\\scratch\\wm_pending_data.json
(Você também pode ler diretamente do banco MySQL local 192.168.0.4:7177 db_qualitecnew se preferir).

Crie a página com visual moderno, responsivo e de fácil navegação.
```

---

## 🛠️ O que será criado no seu projeto do catálogo

Quando você enviar esse comando, eu vou:
1. Criar o **Endpoint de API** em `server/api/pedidos-white-martins.get.ts` que carrega a base de dados dos pedidos e itens da White Martins.
2. Criar a **Página Completa** em `pages/admin/pendencias-white-martins.vue` (ou `pages/pendencias-white-martins.vue`) com:
   * Reatividade total do Vue 3 (`ref`, `computed`).
   * Gráficos ou barras de progresso de atendimento.
   * Filtros reativos instantâneos sem precisar recarregar a tela.
   * Visual integrado às cores e componentes do seu catálogo.
3. Adicionar o link de acesso no menu ou sidebar de administração do catálogo para você abrir sempre que quiser com 1 clique no navegador!
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Arquivo de instruções criado com sucesso em: {file_path}")
