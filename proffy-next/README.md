# Proffy Next

Reescrita do frontend do [Proffy](../web) com tecnologias atuais. Este app convive lado a lado com `web/`, `server/` e `mobile/` — nenhum deles foi alterado.

## Stack e versões

- [Next.js](https://nextjs.org) `16.3.5` (App Router, Turbopack)
- [React](https://react.dev) `19.2.8`
- [TypeScript](https://www.typescriptlang.org) `5.x`
- [Tailwind CSS](https://tailwindcss.com) `4.x` (via `@tailwindcss/postcss`)
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

| Script               | Descrição                                               |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`         | Sobe o servidor de desenvolvimento (Turbopack)           |
| `npm run build`       | Gera o build de produção                                 |
| `npm run start`       | Serve o build de produção                                |
| `npm run lint`        | Roda o ESLint                                             |
| `npm run typecheck`   | Roda o TypeScript em modo `--noEmit`                      |
| `npm test`            | Roda a suíte de testes de contrato da API (Vitest)        |
| `npm run db:generate` | Gera migrations Drizzle a partir de `src/db/schema.ts`   |
| `npm run db:migrate`  | Aplica as migrations Drizzle pendentes ao banco SQLite    |

## API: `classes` e `connections`

Além do frontend, `proffy-next/` expõe uma API própria via Route Handlers, migrada de `server/` (Express + Knex) para Drizzle ORM + SQLite:

- `GET /classes?subject=&week_day=&time=` — lista aulas que atendem aos filtros (todos obrigatórios).
- `POST /classes` — cria professor (`users`), aula (`classes`) e horários (`class_schedule`).
- `GET /connections` — retorna o total de conexões feitas.
- `POST /connections` — registra uma nova conexão (`user_id`).

O schema (tabelas `users`, `classes`, `class_schedule`, `connections`) é definido em `src/db/schema.ts`, equivalente ao schema de `server/src/database/migrations`. `server/`, `web/` e `mobile/` não são afetados por essa API — ela é independente, incluindo seu próprio banco SQLite em `proffy-next/data/database.sqlite` (não versionado, nem compartilhado com `server/src/database/database.sqlite`).

### Criando o banco do zero

O banco de dados (`proffy-next/data/database.sqlite`) não é versionado e não é migrado a partir do banco existente em `server/`. Para criá-lo do zero:

```bash
cd proffy-next
npm install
npm run db:generate   # gera os arquivos SQL de migration em drizzle/migrations (já existe um commitado, rode só se mudar o schema)
npm run db:migrate    # aplica as migrations e cria/atualiza data/database.sqlite
```

Isso cria as tabelas `users`, `classes`, `class_schedule` e `connections` vazias, prontas para uso.

### Rodando os testes

Os testes de contrato da API usam Vitest + supertest e rodam contra um banco SQLite em memória (migrations aplicadas automaticamente antes de cada suíte, sem depender de `data/database.sqlite`):

```bash
cd proffy-next
npm test
```

## Estrutura de pastas

```
proffy-next/
├── public/                      # arquivos estáticos servidos na raiz
├── src/
│   ├── app/
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
