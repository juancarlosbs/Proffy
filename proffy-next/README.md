# Proffy Next

Reescrita do frontend **e da API** do [Proffy](../web) com tecnologias atuais. Este app convive lado a lado com `web/`, `server/` e `mobile/` — nenhum deles foi alterado. A API que antes vivia em `server/` (Express + Knex) foi migrada para cá como Route Handlers do App Router, mantendo o mesmo contrato HTTP e o mesmo schema de dados.

## Stack e versões

- [Next.js](https://nextjs.org) `16.3.5` (App Router, Turbopack, Route Handlers)
- [React](https://react.dev) `19.2.8`
- [TypeScript](https://www.typescriptlang.org) `5.x`
- [Tailwind CSS](https://tailwindcss.com) `4.x` (via `@tailwindcss/postcss`)
- [ESLint](https://eslint.org) `9.x` com `eslint-config-next`
- [Knex](https://knexjs.org) `3.x` + [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (acesso a dados/migrations da API, mesmo schema SQLite do `server/` original)
- [Vitest](https://vitest.dev) para os testes de contrato da API
- Fontes Google (`next/font/google`): **Poppins** e **Archivo**, as mesmas usadas no Proffy original

## Como rodar

Pré-requisitos: Node.js 20+ e npm.

```bash
cd proffy-next
npm install
npm run db:migrate   # cria/atualiza o banco SQLite usado pela API (veja "Banco de dados")
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). As rotas da API ficam em `http://localhost:3000/classes` e `http://localhost:3000/connections`.

## Banco de dados

A API usa SQLite via Knex, com o mesmo schema (`users`, `classes`, `class_schedule`, `connections`) do `server/` original. O arquivo do banco fica em `src/server/database/database.sqlite` (gerado localmente, não é versionado) e as migrations ficam em `src/server/database/migrations/`.

Para criar o banco pela primeira vez ou aplicar novas migrations:

```bash
npm run db:migrate
```

Para desfazer o último batch de migrations:

```bash
npm run db:migrate:rollback
```

O caminho do arquivo do banco pode ser customizado com a variável de ambiente `PROFFY_DB_FILE` (usada também pelos testes automatizados, para rodar contra um banco temporário isolado).

## Scripts

| Script                        | Descrição                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| `npm run dev`                  | Sobe o servidor de desenvolvimento (Turbopack)                    |
| `npm run build`                | Gera o build de produção                                          |
| `npm run start`                | Serve o build de produção                                         |
| `npm run lint`                 | Roda o ESLint                                                      |
| `npm run typecheck`            | Roda o TypeScript em modo `--noEmit`                               |
| `npm run db:migrate`           | Cria/atualiza o banco SQLite aplicando as migrations do Knex       |
| `npm run db:migrate:rollback`  | Desfaz o último batch de migrations                                |
| `npm test`                     | Roda os testes de contrato da API (Vitest)                        |

## CI

Todo `push` e `pull_request` do repositório (qualquer branch) dispara o workflow `.github/workflows/proffy-next-ci.yml`, que roda em sequência, dentro de `proffy-next/`:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`

Uma falha em qualquer etapa marca o check como vermelho no PR/push. Para reproduzir localmente na mesma ordem:

```bash
cd proffy-next
npm ci
npm run lint
npx next typegen   # gera next-env.d.ts, necessário para o typecheck (ver nota abaixo)
npm run typecheck
npm test
npm run build
```

> `tsc --noEmit` depende de `next-env.d.ts`, um arquivo gerado pelo Next.js (não versionado) que declara os tipos de imports como `*.svg`. Em um checkout limpo esse arquivo ainda não existe; `npm run dev` ou `npm run build` também o geram, mas `npx next typegen` faz isso sem rodar um build completo.

## Estrutura de pastas

```
proffy-next/
├── public/                      # arquivos estáticos servidos na raiz
├── src/
│   ├── app/
│   │   ├── classes/route.ts     # GET/POST /classes (migrado de server/)
│   │   ├── connections/route.ts # GET/POST /connections (migrado de server/)
│   │   ├── favicon.ico
│   │   ├── layout.tsx           # layout raiz: fontes (Poppins/Archivo) e metadata
│   │   ├── page.tsx             # página inicial (Landing)
│   │   └── globals.css          # tema Tailwind (cores/tipografia do Proffy) + estilos globais
│   ├── assets/
│   │   └── images/              # SVGs migrados de web/src/assets/images (logo, ilustrações, ícones)
│   └── server/                  # código de acesso a dados da API (migrado de server/)
│       ├── db.ts                # instância do Knex
│       ├── utils/convertHourToMinutes.ts
│       └── database/
│           ├── database.sqlite  # gerado localmente por `npm run db:migrate` (não versionado)
│           └── migrations/      # migrations do Knex (schema users/classes/class_schedule/connections)
├── test/                        # testes de contrato da API (Vitest)
├── knexfile.ts                  # config do Knex CLI (`npm run db:migrate`)
├── vitest.config.ts
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

## API (migrada de `server/`)

As rotas abaixo substituem a antiga API Express de `server/`, mantendo o mesmo contrato HTTP (parâmetros, status codes e formato de resposta) e o mesmo schema de dados:

| Rota                | Método | Descrição                                                                 |
| -------------------- | ------ | --------------------------------------------------------------------------- |
| `/classes`       | GET    | Lista aulas filtrando por `subject`, `week_day` e `time` (query params). Retorna `400` se algum filtro faltar. |
| `/classes`       | POST   | Cria um professor, sua aula e os horários (`schedule`). Retorna `201` sem corpo. |
| `/connections`   | GET    | Retorna `{ total }` com o total de conexões registradas.                   |
| `/connections`   | POST   | Registra uma nova conexão a partir de `user_id`. Retorna `201` sem corpo.   |

O acesso a dados usa Knex + `better-sqlite3` (ver [Banco de dados](#banco-de-dados)) em vez do `sqlite3` + Knex `0.21` usados no `server/` original.

## Sobre a página inicial

A Landing (`src/app/page.tsx`) é fiel ao design original em `web/src/pages/Landing`, reescrita com componentes do App Router e Tailwind:

- O tema Tailwind (`src/app/globals.css`, bloco `@theme`) replica as variáveis de cor de `web/src/assets/styles/global.css` (`--color-primary`, `--color-secondary`, etc.) e as fontes **Poppins** (texto) e **Archivo** (botões).
- Os botões **"Estudar"** e **"Dar aulas"** apontam para `/study` e `/give-classes`, rotas que ainda não existem no app — serão criadas nas próximas etapas da reescrita.
- O total de conexões exibido é um valor fixo (`TOTAL_CONNECTIONS` em `page.tsx`); a integração com a API real do Proffy ainda não foi implementada.
- O CSS original usa `font-size: 62.5%` na raiz para que `1rem = 10px`. Aqui a raiz continua em 16px, a escala padrão do Tailwind, e as medidas da original foram convertidas para pixels (`2.4rem` → `24px`, `10.4rem` → `104px`). Assim `rounded-lg`, `mt-2` e o resto da escala utilitária valem o que documentam.
- O grid de desktop da original entra em `min-width: 1100px`, que não é um breakpoint do Tailwind. Ele está declarado como `--breakpoint-lg1100` em `globals.css` e usado com o prefixo `lg1100:`.
