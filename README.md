# Base de Dados ENEM Backend

API backend em NestJS para consulta de provas do ENEM, montagem de simulados, resolucao de tentativas, correcao por gabarito oficial e estatisticas pedagogicas por usuario.

O projeto e usado para ensino, mas segue decisoes proximas de um backend de mercado: autenticacao por JWT, isolamento por usuario autenticado, soft delete de conta, paginacao padronizada, documentacao de rotas e testes automatizados para regras criticas.

## Stack

- Node.js com NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Jest e Supertest
- Swagger em `/api`

## Requisitos

- Node.js instalado
- npm instalado
- PostgreSQL disponivel
- Variaveis de ambiente configuradas

Exemplo de banco local usado no desenvolvimento:

```text
postgresql://enem:enem123@localhost:5433/enemdb
```

## Variaveis de ambiente

Crie um arquivo `.env` local conforme a sua configuracao:

```env
DATABASE_URL="postgresql://enem:enem123@localhost:5433/enemdb"
JWT_SECRET="troque-este-segredo"
JWT_EXPIRES_IN="1d"
PORT=3000
```

## Instalar dependencias

```bash
npm install
```

## Banco e Prisma

O projeto ja tem um `docker-compose.yml` com PostgreSQL 16. Para subir o banco local:

```bash
docker compose up -d
```

Conferir se o container esta rodando:

```bash
docker compose ps
```

Conferir se as migrations do Prisma ja estao aplicadas:

```bash
npx prisma migrate status
```

Aplicar migrations em desenvolvimento:

```bash
npx prisma migrate dev
```

Gerar o client do Prisma:

```bash
npx prisma generate
```

Popular a base pedagogica inicial:

```bash
npx ts-node prisma/seeds/seed.ts
```

Abrir o Prisma Studio, se precisar inspecionar dados:

```bash
npx prisma studio
```

## Rodar a API

Fluxo completo recomendado para ambiente local:

```bash
docker compose up -d
npx prisma migrate dev
npx ts-node prisma/seeds/seed.ts
npm run start:dev
```

Modo desenvolvimento:

```bash
npm run start:dev
```

Build e execucao da build:

```bash
npm run build
npm run start
```

URLs locais:

```text
API: http://localhost:3000
Swagger: http://localhost:3000/api
```

## Principais modulos

- `auth`: cadastro, login e emissao de JWT.
- `users`: perfil autenticado em `/users/me` e soft delete da propria conta.
- `catalog`: consultas publicas de areas, disciplinas, competencias, habilidades, objetos e conteudos.
- `exams`: consultas publicas de provas e questoes por prova.
- `questions`: consultas publicas de questoes.
- `simulations`: simulados do usuario autenticado.
- `attempt-sessions`: criacao, resposta, correcao e abandono de tentativas.
- `statistics`: estatisticas calculadas somente para o usuario do token JWT.

## Decisoes importantes

- Rotas de `users` nao expõem CRUD publico. Cadastro e login pertencem ao modulo `auth`; perfil pertence ao modulo `users`.
- `DELETE /users/me` faz soft delete com `deletedAt`; o historico pedagogico permanece preservado.
- Email de usuario desativado ainda nao pode ser reutilizado.
- Tokens antigos de usuarios desativados sao recusados pela estrategia JWT.
- Rotas publicas de questoes, provas, catalogos e simulados nao devem vazar `isCorrect`, `correctLetter` nem `txGabarito`.
- Sessoes `IN_PROGRESS` tambem nao retornam gabarito. O resultado aparece apenas depois de `POST /attempt-sessions/:sessionId/correct`.
- Estatisticas usam `req.user.id`; a API nao aceita `userId` por query para consultar dados de outro usuario.

## Testes

Testes unitarios e de comportamento:

```bash
npm test -- --runInBand
```

Testes e2e:

```bash
npm run test:e2e
```

Build:

```bash
npm run build
```

O e2e atual cobre:

- rota publica raiz;
- cadastro, perfil autenticado, atualizacao de perfil e soft delete;
- bloqueio de token antigo e login apos soft delete;
- fluxo completo de tentativa avulsa: criar sessao, responder, deixar questao em branco, consultar em andamento sem gabarito, corrigir, bloquear alteracao apos correcao e consultar estatisticas.

## Status tecnico

Ultima revisao local: 2026-06-04.

- `src/app.module.ts` foi revisado e nao mantem comentarios de modulos antigos fora de uso.
- `dist/` nao deve ser versionado, pois e gerado por build.
- `.env` nao deve ser versionado, pois contem configuracoes locais e possiveis segredos.
- `CHECKLIST_PROJETO.md` e um arquivo local de acompanhamento e esta no `.gitignore`.
- Validacoes finais desta revisao:
  - `npm test -- --runInBand`: passou, 18 suites e 25 testes.
  - `npm run test:e2e`: passou, 1 suite e 3 testes.
  - `npm run build`: passou.

## Documentacao do projeto

- `DOCUMENTACAO_ROTAS.md`: guia tecnico de rotas e roteiros manuais para Postman.
- `CONTROLE_API_CODEX.md`: historico tecnico das decisoes e alteracoes feitas no backend.
- `AULA_TESTE.MD`: apostila didatica sobre testes unitarios, testes de comportamento e testes e2e neste projeto.

## Fluxo manual recomendado

1. Subir a API com `npm run start:dev`.
2. Abrir `http://localhost:3000/api`.
3. Criar usuario em `POST /auth/register`.
4. Salvar o `accessToken`.
5. Buscar questoes em `GET /questions`.
6. Criar sessao em `POST /attempt-sessions/avulso`.
7. Responder com `PATCH /attempt-sessions/:sessionId/answers/:questionId`.
8. Conferir que a sessao em andamento nao retorna gabarito.
9. Corrigir com `POST /attempt-sessions/:sessionId/correct`.
10. Consultar estatisticas em `GET /statistics/overview`.

Para detalhes de payload, variaveis de ambiente do Postman e resultados esperados, use `DOCUMENTACAO_ROTAS.md`.
