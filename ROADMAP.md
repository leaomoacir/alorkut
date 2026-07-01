# 🗺️ ROADMAP: OrkutRevival (Alurakut)

Este documento centraliza a arquitetura do projeto, tudo o que já foi construído, e o mapa das próximas atualizações para transformar o Alurakut na experiência definitiva de nostalgia para desenvolvedores.

---

## 🏛️ 1. Estrutura Definida (Arquitetura Atual)

### Stack Tecnológica
- **Frontend/Backend:** Next.js (React)
- **Estilização:** Styled-Components (com sistema flexível para temas nostálgicos e glassmorphism)
- **Banco de Dados Local:** SQLite (via Prisma ORM), garantindo autonomia sem depender de CMS externos (como o antigo DatoCMS).

### Modelagem do Banco (Prisma)
A base de dados cresceu para suportar as complexas mecânicas sociais:
- `Follow`: Sistema de amizades (quem segue quem).
- `Community`: Capas e metadados das comunidades (com `creatorId`).
- `CachedProfile`: Cache dos dados do GitHub (repos, estrelas) para carregamento rápido.
- `Scrap`: Recados enviados de um usuário para o mural de outro.
- `Testimonial`: Textos longos de depoimentos (com sistema de aprovação pública).
- `BadgeVote`: Votos de selos clássicos (Confiável 🤝, Legal 😎, Sexy 💋).
- `CommunityTopic`: Tópicos criados dentro do fórum de uma comunidade.
- `CommunityPost`: Respostas dentro de um tópico de comunidade.

---

## ✅ 2. O Que Já Foi Feito (Concluído)

### Fase 1: O Coração da Nostalgia (Perfil e Scraps)
- [x] **Banco Local Completo:** Transição do DatoCMS/Mock para SQLite usando Prisma.
- [x] **Tela de Login Renovada:** Novo visual com fundo em gradiente e caixas em glassmorphism.
- [x] **Perfil em 3 Colunas:** Recriação fiel do layout clássico (Sidebar, Mural Central e Interações à direita).
- [x] **Mural de Scraps:** Usuários podem receber e deixar recados no perfil uns dos outros.
- [x] **Selos Interativos:** Sistema 100% funcional onde amigos podem votar nos 3 selos originais (Confiável, Legal, Sexy).
- [x] **Cache de API:** Integração com GitHub salvando estrelas e repositórios em cache para performance.
- [x] **Depoimentos:** Criação da área de depoimentos longos na coluna direita.

### Fase 2: Vida Longa aos Fóruns e Amigos
- [x] **Fóruns de Comunidades:** Telas exclusivas para comunidades (`/comunidades/[id]`), permitindo a criação de Tópicos e postagem de Respostas.
- [x] **Tela "Meus Amigos" Avançada:** Remodelagem da aba `/amigos` incluindo a seção fixa de **⭐ Melhores Amigos (Top 3)** no topo.
- [x] **Grid Perfeito:** Implementação das listagens limitadas a 16 slots nas colunas laterais, respeitando a estética de 2004.

---

## 🚀 3. O Que Será Feito (Próximas Fases)

### Fase 3: Dinâmica de Rede e Descoberta
- [ ] **Feed de Atualizações (Home):** O mural da página inicial será turbinado para exibir não apenas scraps, mas também "Fulano entrou na comunidade X" e "Ciclano adicionou Beltrano aos amigos".
- [ ] **Busca Unificada Global:** Uma barra de busca funcional no cabeçalho que permite procurar por Amigos, Comunidades e Tópicos.
- [ ] **Sistema de Notificações:** Um "sininho" no cabeçalho alertando sobre novos scraps, respostas em tópicos e pedidos de amizade.

### Fase 4: Gamificação e Retenção (Karma e Níveis)
- [ ] **Níveis de Usuário:** Tags como "Novato", "Veterano" e "Lenda do Orkut" baseadas na atividade combinada.
- [ ] **Selos Especiais (Dev):** Badges automáticos como "Top Contributor" (puxando commits do GitHub) e "Open Source Hero".
- [ ] **Jogos e Quizzes:** Adição de enquetes "Quem te conhece melhor?" e clássicos repaginados.

### Fase 5: Estética Total e Temas
- [ ] **Múltiplos Temas:** Seletor de cores permitindo mudar de "Rosa Clássico" para "Azul MSN", "Dark Mode" ou "Matrix Verde".
- [ ] **Customização de Perfil:** Opção do usuário alterar a cor de fundo do seu próprio mural.
- [ ] **Álbuns de Fotos:** Suporte a upload (ou link) de álbuns de projetos e setups.

---

*Este roadmap é um documento vivo e pode ser adaptado conforme testamos as mecânicas antigas no cenário moderno!*
