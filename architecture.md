# Arquitetura do Projeto Alurakut

Este documento detalha as especificações técnicas, tecnologias, estrutura do repositório e práticas de segurança adotadas no projeto **Alurakut**.

## 1. Tecnologias Utilizadas

- **Next.js**: Framework React para renderização Server-Side Rendering (SSR) e geração estática (SSG), além de providenciar rotas de API (Serverless functions).
- **React**: Biblioteca JavaScript para construção das interfaces de usuário.
- **Styled Components**: Biblioteca CSS-in-JS para estilização de componentes de forma encapsulada.
- **DatoCMS**: Headless CMS GraphQL usado como base de dados para gerenciar o conteúdo dinâmico (Comunidades e Postagens).
- **Nookies / JWT**: Gerenciamento de cookies e verificação de tokens JWT para o processo de autenticação via GitHub.

## 2. Estrutura de Pastas

A estrutura segue o padrão estabelecido pelo Next.js com as seguintes principais divisões:

- `/pages`: Contém as rotas da aplicação (ex: `index.js`, `login.js`, `amigos.js`, `comunidades.js`).
- `/pages/api`: Contém rotas de backend (Serverless functions do Next.js), como a criação de comunidades (`comunidades.js`) e postagens (`post.js`).
- `/src/components`: Componentes visuais isolados (ex: `Box`, `MainGrid`, `ComunidadeGrid`).
- `/src/lib`: Bibliotecas auxiliares e componentes base (ex: `alurakutCommons.js` com o header e utilitários).
- `.env.example`: Exemplo de configuração de variáveis de ambiente do projeto.

## 3. Segurança e Boas Práticas (Variáveis de Ambiente)

Para garantir a integridade do repositório público, **nenhum dado sensível (como chaves de API, senhas ou tokens) deve ser hardcoded (escrito diretamente)** no código-fonte.

- **Frontend (Browser)**: Variáveis que precisam ser acessadas pelo navegador, como o token *Read-Only* do DatoCMS, devem começar com o prefixo `NEXT_PUBLIC_` (ex: `NEXT_PUBLIC_DATOCMS_READ_ONLY_TOKEN`). Isso instrui o Next.js a embutir a variável no bundle do lado do cliente.
- **Backend (API Routes/SSR)**: Variáveis sensíveis de acesso completo (Full-Access API Keys) que não podem vazar para o usuário, como tokens de criação no DatoCMS, devem ser acessadas em rotas da `/api` ou em `getServerSideProps`. Elas **não** devem ter o prefixo `NEXT_PUBLIC_` (ex: `DATOCMS_FULL_ACCESS_TOKEN`).

Para rodar o projeto localmente, crie um arquivo chamado `.env.local` na raiz do projeto (este arquivo está no `.gitignore` e não será comitado) e adicione as variáveis necessárias descritas no `.env.example`.
