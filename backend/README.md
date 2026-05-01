# 💸 Pitang - Sistema de Controle de Reembolso (Backend)

Este é o backend do desafio técnico da Pitang. O sistema permite o gerenciamento de solicitações de reembolso de despesas, controle de categorias, trilha de auditoria e controle de acesso baseado em perfis (RBAC).

## 🚀 Tecnologias Utilizadas
Conforme solicitado na ementa do desafio, foram utilizadas:
- **Node.js** (Ambiente de execução)
- **TypeScript** (Linguagem com tipagem estática)
- **Express** (Framework Web)
- **Prisma ORM** (Acesso ao banco de dados)
- **PostgreSQL** (Banco de dados relacional via Docker)
- **Zod** (Validação de schemas e dados)
- **JSON Web Token (JWT)** (Autenticação e segurança)
- **Bcryptjs** (Criptografia de senhas)
- **Jest & Supertest** (Testes de integração)

---

## 🛠️ Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- Docker e Docker Compose instalado

### Passo a Passo
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Fcc2187/Desafio-Tecnico-Pitang.git
   cd Desafio-Tecnico-Pitang/backend
   ```

2. **Configure o Banco de Dados (Docker):**
   ```bash
   docker-compose up -d
   ```
   *Nota: O banco está configurado para rodar na porta **5433**

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Configuração de Ambiente:**
   - O arquivo `.env` já deve estar configurado dentro de `src/config/`. Caso não esteja, utilize o comando:
   ```bash
   cp src/config/.env.example src/config/.env
   ```

5. **Rodar Migrations e Seed:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Iniciar o Servidor:**
   ```bash
   npm run dev
   ```
   O servidor estará rodando em `http://localhost:3000`.

---

## 🧪 Usuários de Teste (Seed)
Após rodar o comando `npx prisma db seed`, os seguintes usuários estarão disponíveis para teste (senha padrão: `password123`):

| Nome | Email | Perfil |
| :--- | :--- | :--- |
| **Admin** | admin@pitang.com | ADMIN |
| **João Gestor** | gestor@pitang.com | GESTOR |
| **Maria Financeiro** | financeiro@pitang.com | FINANCEIRO |
| **José Colaborador** | colab@pitang.com | COLABORADOR |

---

## 🧠 Decisões Técnicas
- **Arquitetura Modular:** O código foi organizado em `modules` (domínios) para facilitar a manutenção e separação de responsabilidades.
- **RBAC (Role-Based Access Control):** Foi implementado um middleware de autorização que verifica o perfil do usuário antes de permitir ações específicas (ex: apenas Admin cria categorias).
- **Trilha de Auditoria:** Foi criado um histórico automático para toda mudança de status de um reembolso, garantindo transparência no processo.
- **Validação com Zod:** Todos os dados de entrada (body, params, query) são validados antes de chegar ao controller, prevenindo erros de runtime e ataques de injeção de dados inválidos.
- **Testes de Integração:** Foi optado pelo uso de testes que simulam requisições HTTP reais (Supertest) contra o banco de dados, garantindo que o fluxo fim-a-fim esteja funcionando.

---

## ✅ O que foi implementado
- [x] Autenticação JWT e Hashing de senhas.
- [x] CRUD de Usuários e Categorias.
- [x] Módulo de Reembolsos com Máquina de Estados.
- [x] Histórico de Auditoria Automático.
- [x] Upload simulado de anexos.
- [x] Testes de Integração (Auth, Categories, Reimbursements).
- [x] Configuração Dockerizada.

---

## 📮 Testando a API (Postman / REST Client)
- Deixamos um arquivo chamado `api.http` na raiz do projeto. 
- Caso use o VS Code, instale a extensão **REST Client** para rodar as chamadas diretamente no editor.
- Para o **Postman**, veja as instruções abaixo no repositório.
