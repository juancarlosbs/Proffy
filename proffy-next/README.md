# Proffy Next

Reescrita do frontend do [Proffy](../web) com tecnologias atuais. Este app convive lado a lado com `web/`, `server/` e `mobile/` — nenhum deles foi alterado. A API do `server/` (Express + Knex) foi portada para cá como Route Handlers (veja [API](#api-e-banco-de-dados)).

## Stack e versões

- [Next.js](https://nextjs.org) `16.3.5` (App Router, Turbopack)
- [React](https://react.dev) `19.2.8`
- [TypeScript](https://www.typescriptlang.org) `5.x`
- [Tailwind CSS](https://tailwindcss.com) `4.x` (via `@tailwindcss/postcss`)
- [Drizzle ORM](https://orm.drizzle.team) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (SQLite) e [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) para migrações
- [Vitest](https://vitest.dev) para os testes da API
- [ESLint](https://eslint.org) `9.x` com `eslint-config-next`
- Fontes Google (`next/font/google`): **Poppins** e **Archivo**, as mesmas usadas no Proffy original

## Como rodar

Pré-requisitos: Node.js 20+ e npm.

```bash
cd proffy-next
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Script            | Descrição                                      |
| ----------------- | ----------------------------------------------- |
| `npm run dev`      | Sobe o servidor de desenvolvimento (Turbopack)  |
| `npm run build`    | Gera o build de produção                        |
| `npm run start`    | Serve o build de produção                       |
| `npm run lint`     | Roda o ESLint                                   |
| `npm run typecheck`| Roda o TypeScript em modo `--noEmit`            |
| `npm test`         | Roda os testes de contrato da API (Vitest)      |
| `npm run db:migrate` | Aplica as migrações no banco                  |
| `npm run db:generate` | Gera uma nova migração a partir de `src/db/schema.ts` |

## Estrutura de pastas

```
proffy-next/
├── public/                      # arquivos estáticos servidos na raiz
├── drizzle/                     # migrações SQL geradas pelo Drizzle Kit
├── tests/                       # testes de contrato da API
├── src/
│   ├── db/                      # schema (Drizzle), conexão e caminho do banco
│   ├── lib/                     # CORS e conversão de horário
│   ├── app/
│   │   ├── classes/route.ts     # GET/POST /classes
│   │   ├── connections/route.ts # GET/POST /connections
│   │   ├── favicon.ico
│   │   ├── layout.tsx           # layout raiz: fontes (Poppins/Archivo) e metadata
│   │   ├── page.tsx             # página inicial (Landing)
│   │   └── globals.css          # tema Tailwind (cores/tipografia do Proffy) + estilos globais
│   └── assets/
│       └── images/              # SVGs migrados de web/src/assets/images (logo, ilustrações, ícones)
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

## Sobre a página inicial

A Landing (`src/app/page.tsx`) é fiel ao design original em `web/src/pages/Landing`, reescrita com componentes do App Router e Tailwind:

- O tema Tailwind (`src/app/globals.css`, bloco `@theme`) replica as variáveis de cor de `web/src/assets/styles/global.css` (`--color-primary`, `--color-secondary`, etc.) e as fontes **Poppins** (texto) e **Archivo** (botões).
- Os botões **"Estudar"** e **"Dar aulas"** apontam para `/study` e `/give-classes`, rotas que ainda não existem no app — serão criadas nas próximas etapas da reescrita.
- O total de conexões exibido é um valor fixo (`TOTAL_CONNECTIONS` em `page.tsx`); a integração com a API real do Proffy ainda não foi implementada.
- O CSS original usa `font-size: 62.5%` na raiz para que `1rem = 10px`. Aqui a raiz continua em 16px, a escala padrão do Tailwind, e as medidas da original foram convertidas para pixels (`2.4rem` → `24px`, `10.4rem` → `104px`). Assim `rounded-lg`, `mt-2` e o resto da escala utilitária valem o que documentam.
- O grid de desktop da original entra em `min-width: 1100px`, que não é um breakpoint do Tailwind. Ele está declarado como `--breakpoint-lg1100` em `globals.css` e usado com o prefixo `lg1100:`.

## API e banco de dados

O contrato HTTP é o do `server/` original (mesmas rotas, parâmetros, status e formato de resposta; CORS aberto com `Access-Control-Allow-Origin: *`):

| Rota                | Descrição                                                                                   | Resposta                                     |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `GET /classes`      | Query `subject`, `week_day`, `time` (`H:MM`), todos obrigatórios                            | `200` lista de aulas · `400 { error }`        |
| `POST /classes`     | Body `name, avatar, whatsapp, bio, subject, cost, schedule[{ week_day, from, to }]`          | `201` sem corpo · `400 { error }`             |
| `GET /connections`  | Total de conexões                                                                           | `200 { total }`                              |
| `POST /connections` | Body `{ user_id }`                                                                          | `201` sem corpo                              |

Diferença de porta: o Express escutava em `3333`; aqui a API roda junto do app Next, em `3000` (`npm run dev`). Ajuste a URL base dos clientes (`web/`, `mobile/`) ao migrá-los.

### Criar e migrar o banco

O banco é um arquivo SQLite. Por padrão fica em `data/proffy.sqlite` (ignorado pelo git); use a variável `DATABASE_PATH` para outro caminho.

```bash
npm install
npm run db:migrate        # cria o arquivo (se não existir) e aplica as migrações de drizzle/
npm run dev
```

O schema é definido em `src/db/schema.ts` e é idêntico ao das migrações Knex de `server/src/database/migrations`. Para alterá-lo:

```bash
# 1. edite src/db/schema.ts
npm run db:generate       # gera um novo arquivo SQL em drizzle/ (versione-o no git)
npm run db:migrate        # aplica no banco
```

Não há comando de rollback: para desfazer, escreva uma nova migração ou apague `data/proffy.sqlite` e rode `npm run db:migrate` de novo.

**Dados existentes:** `server/src/database/database.sqlite` tem as mesmas tabelas e pode ser reaproveitado copiando-o para o caminho do banco (`cp ../server/src/database/database.sqlite data/proffy.sqlite`). Ele traz a tabela `knex_migrations`, que o Drizzle ignora; como as tabelas já existem, não rode `db:migrate` nesse banco (a migração inicial tentaria recriá-las).

### Testes

```bash
npm test
```

Os testes chamam os Route Handlers direto, contra um SQLite em memória criado com as mesmas migrações de `drizzle/`. Cobrem cada rota (sucesso, filtros, `400`, corpo/status), CORS e o schema das tabelas.

### Comportamentos legados preservados

A migração não muda comportamento, então estas peculiaridades do `server/` continuam aqui de propósito:

- Em `POST /classes`, o `class_id` dos horários recebe o **id do usuário**, não o da aula (só coincidem porque cada cadastro cria um usuário e uma aula juntos).
- `GET /classes` devolve `id` como o id do **usuário** (em `select classes.*, users.*`, `users.id` sobrescrevia `classes.id`).
- `connections.created_at` tem default literal `'CURRENT_TIMESTAMP'` (texto), e não o timestamp atual.
- As chaves estrangeiras não são impostas (`PRAGMA foreign_keys = OFF`), como no `sqlite3` do Knex.

Diferenças em casos que antes derrubavam o servidor: filtro `GET /classes` sem parâmetros obrigatórios agora responde `400` (o Express original travava a requisição), `week_day`/`time` não numéricos devolvem lista vazia (o original encerrava o processo) e falhas ao gravar em `POST /classes` sempre voltam como `400`.
