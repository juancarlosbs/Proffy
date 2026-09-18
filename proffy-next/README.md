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

| Script            | Descrição                                      |
| ----------------- | ----------------------------------------------- |
| `npm run dev`      | Sobe o servidor de desenvolvimento (Turbopack)  |
| `npm run build`    | Gera o build de produção                        |
| `npm run start`    | Serve o build de produção                       |
| `npm run lint`     | Roda o ESLint                                   |
| `npm run typecheck`| Roda o TypeScript em modo `--noEmit`            |

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
