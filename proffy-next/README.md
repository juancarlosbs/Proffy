# Proffy Next

Reescrita da Landing Page do Proffy com um stack atual, mantendo fidelidade visual e de conteúdo com a versão original em `web/`.

## Stack e versões

- [Next.js](https://nextjs.org) 16.3.5 (App Router, Turbopack)
- [React](https://react.dev) 19.2.8
- [TypeScript](https://www.typescriptlang.org) 5.x
- [Tailwind CSS](https://tailwindcss.com) 4.x (configuração via `@theme` em `app/globals.css`)
- Fontes Poppins e Archivo carregadas via `next/font/google`

## Como rodar

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Scripts

- `npm run dev` — inicia o servidor de desenvolvimento (Turbopack).
- `npm run build` — gera o build de produção.
- `npm run start` — serve o build de produção gerado por `npm run build`.
- `npm run lint` — executa o ESLint sobre o projeto.
- `npm run typecheck` — executa `tsc --noEmit` para checagem de tipos sem gerar arquivos.

## Estrutura de pastas

```
proffy-next/
├── app/
│   ├── globals.css   # estilos globais e tema Tailwind (cores e breakpoints do Proffy original)
│   ├── layout.tsx    # layout raiz, carregamento das fontes Poppins e Archivo
│   └── page.tsx      # página inicial (Landing)
├── public/
│   └── images/       # SVGs copiados de web/src/assets/images (logo, hero, ícones)
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

## Notas de implementação

- A rota `/` reproduz a Landing original de `web/src/pages/Landing`: logo, título, imagem hero, botões "Estudar" (`/study`) e "Dar aulas" (`/give-classes`) e o contador de conexões.
- As rotas `/study` e `/give-classes` ainda não existem — os botões apontam para elas como links (`next/link`) para uso futuro.
- O contador "total de X conexões já realizadas" usa um valor fixo definido como constante local (`TOTAL_CONNECTIONS`) em `app/page.tsx`, sem chamada à API.
- As cores do tema (`--color-primary`, `--color-primary-lighter`, `--color-secundary`, etc.) foram migradas de `web/src/assets/styles/global.css` para `app/globals.css`, expostas como utilitários Tailwind (`bg-primary`, `text-text-in-primary`, etc.).
- O breakpoint `min-width: 1100px` do CSS original foi recriado como o breakpoint customizado `lg1100` no Tailwind, reproduzindo o grid `logo/hero/hero` e `buttons/buttons/total`.
- Este projeto é independente dos apps legados `web/`, `server/` e `mobile/` — nenhum deles foi alterado.
