Regras obrigatórias de desenvolvimento — Nuxt 4

0. Aplicação e leitura obrigatória

Estas regras têm aplicação permanente em qualquer tarefa que envolva análise, sugestão, criação, alteração, remoção, refatoração, migração, configuração, teste ou revisão de código.

Antes de planejar ou executar qualquer mudança, leia este arquivo por completo e consulte também qualquer AGENTS.md ou AGENTS.override.md mais próximo da pasta afetada.

Na primeira atualização da tarefa, confirme: Regras do projeto lidas: AGENTS.md.

Se este arquivo não puder ser lido integralmente, interrompa a tarefa e informe o bloqueio. Não faça alterações com base em suposições.

O PRD descreve a intenção do produto, mas o repositório e o banco atuais são a evidência do estado real. Sempre confronte os três antes de implementar.

1. Ordem obrigatória de prioridade

Em caso de conflito, siga esta ordem:

Integridade dos dados e dos vínculos.

Segurança, autorização e preservação de dados.

Consistência de estado entre entidades e camadas.

Compatibilidade com dados existentes e evolução futura.

Arquitetura, organização e padrões do projeto.

Preferências pontuais do desenvolvedor.

Uma preferência de interface ou conveniência nunca pode romper dados, permissões, vínculos ou compatibilidade.

2. Verificação obrigatória antes de alterar

Antes de criar, alterar, remover ou sugerir implementação:

Inspecione a estrutura real do repositório, package.json, nuxt.config.ts, configurações TypeScript, scripts, migrações e os arquivos diretamente relacionados.

Verifique o estado do Git e preserve alterações existentes e não relacionadas.

Identifique o fluxo completo afetado: interface, composable, API, serviço, banco, cache, painel administrativo, integrações e testes.

Responda internamente:

Qual entidade será afetada?

Quais entidades dependem dela?

Qual vínculo deve existir ou ser preservado?

Qual é a origem da verdade?

Qual estado pode ficar divergente?

A mudança exige propagação, invalidação de cache, migração ou backfill?

O que pode quebrar em dados antigos ou em futuras expansões?

Procure uma implementação existente antes de criar outra. Reutilize componentes, composables, endpoints, tipos, helpers e padrões já adotados quando forem adequados.

Declare lacunas relevantes. Nunca apresente uma suposição como fato confirmado.

Nenhuma alteração pode começar sem essa análise mínima.

3. Banco de dados primeiro

Esta regra é obrigatória para qualquer funcionalidade que persista, consulte, filtre, relacione, importe, exporte ou altere dados.

3.1 Inspeção obrigatória

Consulte o banco real antes de propor ou criar tabela, coluna, enum, relacionamento, índice, view, função, trigger, bucket ou policy.

Quando o MCP do Supabase estiver disponível e apontando para o projeto correto, use-o primeiro em modo somente leitura para inspecionar:

tabelas, colunas, tipos, valores padrão e nulabilidade;

chaves primárias e estrangeiras;

constraints, índices e unicidade;

RLS e policies;

views, funções, triggers e buckets;

relacionamentos, registros representativos e dependências.

Em seguida, compare o resultado com as migrações, tipos gerados e código do repositório.

Se o MCP não estiver disponível, examine migrações, schema, tipos gerados e código. Se isso não for suficiente para confirmar o estado real, pare e solicite acesso ou evidência do schema. Não invente estruturas.

Nunca reutilize uma coluna ou JSON genérico apenas porque ele já existe. Confirme se representa corretamente o domínio. Listas relacionais crescentes não devem ser colocadas em JSONB sem justificativa técnica explícita.

3.2 Alterações de schema

Toda alteração deve definir explicitamente:

entidade pai, entidade filha e chave do vínculo;

origem da verdade;

cardinalidade e obrigatoriedade;

comportamento de ON DELETE e ON UPDATE;

nulabilidade, valor padrão, unicidade e índices;

regras de autorização e RLS;

estratégia para dados existentes, migração e backfill;

compatibilidade temporária entre versões antiga e nova;

impacto em tipos, validações, API, interface, filtros, exportações, histórico e testes.

Não altere migrações que já possam ter sido aplicadas. Crie uma nova migração incremental, seguindo o padrão existente. Mudanças destrutivas, perda de dados e ações em produção exigem autorização explícita.

4. Uso obrigatório e responsável dos MCPs

Supabase MCP: use para confirmar o schema e as policies antes de qualquer trabalho dependente do banco. Comece sempre por operações de leitura.

Context7 MCP: consulte documentação atual antes de introduzir ou atualizar bibliotecas, usar APIs de framework cuja versão possa ter mudado ou implementar tecnologia sobre a qual exista incerteza.

shadcn/ui MCP: procure componentes e padrões existentes antes de construir um componente visual equivalente do zero. Adapte o resultado aos tokens e ao design do projeto.

Use somente o MCP relevante à tarefa. Não faça chamadas aleatórias nem use uma ferramenta apenas para cumprir formalidade.

Nunca invente resultados de uma consulta. Se um MCP necessário estiver indisponível, informe a limitação e use apenas evidências locais suficientes; caso contrário, interrompa a parte bloqueada.

Nenhum MCP autoriza alterações destrutivas, publicação, migração em produção ou exposição de segredos sem autorização explícita.

5. Estrutura obrigatória do projeto

Ao criar arquivos ou pastas, respeite a estrutura e o padrão já existente. Para código novo em Nuxt 4, use:

my-nuxt-app/
├─ app/
│  ├─ assets/           # fontes, ícones, imagens processadas e CSS global
│  ├─ components/       # UI pequena e reutilizável
│  ├─ composables/      # estado reativo, busca e orquestração client-side
│  ├─ layouts/          # layouts do Nuxt
│  ├─ middleware/       # guards de rota
│  ├─ pages/            # rotas baseadas em arquivos
│  ├─ plugins/          # registro e injeção de bibliotecas
│  ├─ utils/            # funções puras sem reatividade
│  ├─ app.vue
│  ├─ app.config.ts
│  └─ error.vue
├─ content/             # conteúdo estático/Markdown, quando utilizado
├─ public/              # arquivos servidos diretamente pela raiz
├─ shared/
│  ├─ types/            # contratos, DTOs e entidades compartilhadas
│  └─ constants/        # constantes e enums compartilhados
├─ server/
│  ├─ api/              # handlers Nitro finos
│  ├─ middleware/       # middleware server-side
│  ├─ plugins/          # plugins server-side
│  ├─ services/         # regras de negócio e orquestração server-side
│  ├─ repositories/     # acesso ao banco, quando o projeto adotar essa camada
│  └─ utils/            # helpers exclusivos do servidor
├─ tailwind.config.ts
├─ nuxt.config.ts
└─ .env                 # local e nunca versionado

Regras de colocação:

components não acessam banco diretamente nem concentram regras de negócio. Estado estritamente visual e local é permitido.

composables concentram reatividade, estado compartilhado, chamadas à API e orquestração do frontend.

server/api valida entrada, autentica, autoriza e delega. Não concentre toda a regra de negócio no handler.

services implementam casos de uso; repositories isolam acesso a dados quando essa separação trouxer clareza.

utils contêm funções puras ou helpers técnicos, nunca um depósito de lógica sem domínio definido.

Tipos compartilhados ficam em shared/types; não duplique contratos no frontend e backend.

Não crie arquivos temporários, cópias como novo, final, v2, backup ou scripts soltos. Todo arquivo novo deve ter finalidade clara, consumidor conhecido e diretório correto.

Não crie uma pasta nova apenas por preferência. Primeiro verifique a convenção real do repositório.

6. Limite de tamanho e componentização

Arquivos manuscritos de lógica não podem ultrapassar 300 linhas totais.

Ao se aproximar de 250 linhas, avalie e faça a separação antes de adicionar nova responsabilidade.

Exceções: código gerado, lockfiles, snapshots, dados estáticos extensos e migrações indivisíveis. A exceção deve ser informada e não pode esconder lógica de aplicação.

Cada arquivo deve ter responsabilidade única e um motivo claro para mudar.

Componentize interfaces em partes pequenas, coesas e reutilizáveis. Extraia seções complexas, formulários, tabelas, modais e estados visuais independentes.

Não fragmente marcação trivial apenas para reduzir linhas. A divisão deve melhorar coesão, teste, leitura ou reutilização.

Um componente não deve buscar dados e implementar regras de domínio ao mesmo tempo. Extraia isso para composables ou serviços.

Handlers de API devem ser curtos; validação reutilizável, acesso a dados e regras de negócio devem ser extraídos.

7. Camadas e fluxo de dependência

Use o fluxo:

UI → composable → API/serviço → repositório/SDK → banco

A interface não conhece credenciais, service keys, SQL ou detalhes internos do banco.

Regras críticas de autorização e transição de estado devem ser validadas no servidor, mesmo que também existam validações de experiência no frontend.

Evite dependências circulares e acesso lateral entre camadas.

Defina uma única origem de verdade para cada estado. Não mantenha cópias independentes sem estratégia explícita de sincronização.

8. Vínculos e consistência de estado

Nunca presuma que um vínculo será criado manualmente depois.

Toda entidade dependente deve declarar entidade pai, chave estrangeira, origem da verdade e consumidores do vínculo.

Mudanças de estado devem ser refletidas em todos os pontos afetados: escrita, leitura, detalhes, listagens, filtros, relatórios, exportações, painel administrativo, cache e histórico.

Transições críticas devem ser atômicas ou transacionais quando houver mais de uma gravação dependente.

Use idempotência quando reenvios, webhooks, importações ou retries puderem duplicar operações.

Preserve histórico e auditoria quando o domínio exigir rastreabilidade. Não sobrescreva silenciosamente informação histórica relevante.

Ao adicionar um campo, confirme criação, edição, leitura, validação, serialização, tipagem, filtros, permissões e retrocompatibilidade.

Se o vínculo ou a propagação não estiver claro, a tarefa não está concluída.

9. Nomenclatura e TypeScript

Componentes Vue: PascalCase.vue, por exemplo UserCard.vue.

Páginas: nomes minúsculos e subpastas por contexto, por exemplo app/pages/admin/users.vue. Segmentos dinâmicos usam a sintaxe do Nuxt, por exemplo [id].vue.

Layouts do Nuxt: nomes de rota/layout em minúsculas, por exemplo default.vue e admin.vue. Use <NuxtLayout> conforme a arquitetura do app.

Composables: prefixo use + PascalCase, por exemplo useAuth.ts.

Middleware: camelCase, por exemplo authGuard.ts.

Utils: camelCase, por exemplo formatDate.ts.

Interfaces, tipos e DTOs: nomes em PascalCase; arquivos devem seguir o padrão já adotado em shared/types.

APIs Nitro: use o padrão por recurso e método, como users.get.ts, users.post.ts e users/[id].patch.ts.

Use TypeScript em todo código novo e lang="ts" em componentes Vue.

Não use any sem justificativa explícita. Prefira tipos concretos, unknown com narrowing e schemas de validação.

Use imports explícitos para dependências, componentes, composables, tipos e helpers. Não dependa silenciosamente de auto-imports em código novo.

10. SSR, hidratação e identificadores

Não use Math.random(), Date.now() ou valores não determinísticos no HTML renderizado pelo servidor.

Não atribua o mesmo ID fixo a todas as instâncias de um componente. Quando um ID for necessário, ele deve ser determinístico, estável entre servidor e cliente e único por instância, preferencialmente derivado de props ou dados persistidos.

Não crie IDs sem necessidade; prefira referências e relações semânticas corretas.

APIs exclusivas do navegador devem ser usadas em onMounted, guards client-side ou <ClientOnly> quando necessário.

Use chaves estáveis baseadas na identidade dos dados. Evite índice como key em listas reordenáveis.

O estado inicial do servidor e do cliente deve produzir a mesma estrutura de DOM.

11. Segurança, configuração e integrações

Nunca grave segredos, tokens, senhas ou chaves reais no código, logs, commits ou documentação.

Chaves de serviço do Supabase, credenciais SMTP e credenciais R2/S3 são exclusivas do servidor.

O frontend nunca é uma fronteira de confiança. Autenticação, autorização, ownership e validação devem ocorrer no servidor e/ou por RLS.

Valide payloads de entrada e saída; trate erros sem vazar detalhes internos.

Antes de adicionar dependência, confirme se o projeto já possui solução equivalente e justifique custo, manutenção e impacto no bundle.

Não mude versão de Nuxt, Vue, Tailwind, Supabase ou outra dependência estrutural como efeito colateral de uma funcionalidade.

12. Regras específicas do produto Qualitec

Verifique a versão real instalada no package.json. O alvo destas regras é Nuxt 4; se o repositório ou PRD ainda indicar Nuxt 3, sinalize a divergência antes de alterar arquitetura ou dependências.

Todo texto novo visível ao público deve contemplar PT, EN e ES, seguindo a infraestrutura i18n existente.

Mudanças em produtos, categorias, especificações, PDFs, contatos, newsletter ou traduções devem considerar a área pública e o painel administrativo.

Uploads devem respeitar o fluxo existente de R2/S3; não substitua armazenamento ou URLs sem plano de migração.

Envios de e-mail devem preservar validação, segurança, idiomas, tratamento de falha e rastreabilidade sem expor credenciais.

Não acrescente novos arrays de contatos ou inscrições dentro de pdf_settings.layout_settings sem antes avaliar normalização, consultas, concorrência, histórico e migração dos dados existentes.

13. Verificação e definição de concluído

Antes de declarar conclusão:

Revise o diff e confirme que não há alterações aleatórias ou fora do escopo.

Verifique o limite de 300 linhas e a responsabilidade de cada arquivo alterado.

Execute os comandos existentes e relevantes de lint, typecheck, testes e build. Não invente comandos; leia os scripts do projeto.

Valide o fluxo principal e os estados de erro, vazio, carregamento, permissão e responsividade afetados.

Para mudanças de dados, valide leitura e escrita, vínculos, RLS, migração, backfill, tipos, filtros, histórico e cache.

Para mudanças visuais, valide SSR/hidratação e desktop/mobile.

Informe objetivamente o que foi alterado, quais verificações passaram e o que não pôde ser verificado.

A tarefa só está concluída quando estrutura, dados, vínculos, estados, segurança, frontend, backend e evolução futura estiverem coerentes. Se alguma verificação não puder ser feita com segurança, sinalize a lacuna em vez de presumir sucesso.