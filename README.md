# 🚀 Pitang Reimburse - Sistema de Gestão de Reembolsos

Este é um sistema completo para controle de solicitações de reembolso, desenvolvido como parte do desafio técnico da **Pitang Agile IT**. A solução abrange desde a criação de rascunhos por colaboradores até o processamento final de pagamento pelo setor financeiro, com fluxos de aprovação e auditoria rigorosos.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Node.js & TypeScript**
- **Express**: Framework web robusto.
- **Prisma ORM**: Modelagem e persistência de dados (PostgreSQL).
- **Multer**: Middleware para upload de arquivos reais.
- **Zod**: Validação rigorosa de esquemas e dados de entrada.
- **DayJS**: Manipulação inteligente de datas e validações temporais.
- **JWT & BcryptJS**: Autenticação segura e criptografia de senhas.
- **Jest & Supertest**: Testes de integração automatizados.

### **Frontend**
- **React 18 & TypeScript**
- **Vite**: Ferramenta de build ultra-rápida.
- **Chakra UI v3**: Design System premium e responsivo.
- **TanStack Query (React Query)**: Cache e gerenciamento de estado assíncrono.
- **React Hook Form**: Performance em formulários complexos.
- **Lucide React**: Biblioteca de ícones modernos.
- **Vitest**: Framework de testes moderno.

---

## ✨ Funcionalidades e Diferenciais (Plus)

O projeto cumpre **100% dos requisitos obrigatórios** e implementa diversos diferenciais técnicos:

### **1. Fluxo de Vida e Máquina de Estados**
Gerenciamento rígido do ciclo: `RASCUNHO -> ENVIADO -> APROVADO/REJEITADO -> PAGO`.
Travas de segurança impedem que um pedido aprovado seja editado ou um cancelado seja pago.

### **2. Upload Real de Comprovantes (Local)**
Diferente de simulações com links, este sistema permite o **upload real** de arquivos (PDF, PNG, JPG). Os arquivos são armazenados no servidor e servidos como estáticos com previews automáticos na interface.

### **3. Controle de Acesso Baseado em Perfis (RBAC)**
- **ADMIN**: Gestão total de categorias e **gerenciamento de usuários** (alteração de perfis).
- **GESTOR**: Análise técnica, aprovação e rejeição com justificativa.
- **FINANCEIRO**: Visão consolidada de aprovados e processamento de pagamentos.
- **COLABORADOR**: Gestão de solicitações próprias e auditoria.

### **4. Auditoria e Histórico Detalhado**
Toda ação (criação, edição, upload, aprovação) gera uma entrada na trilha de auditoria informando **quem**, **quando** e **o que** foi alterado.

### **5. Dashboard e Inteligência**
Painel dinâmico com:
- Total de reembolsos pagos (acumulado).
- Valor aprovado no mês atual.
- Contagem de solicitações pendentes.
- Feed de atividades recentes em tempo real.

### **6. Regras de Negócio Implementadas**
- **Limites por Categoria**: Valor máximo configurável por tipo de despesa.
- **Anexo Obrigatório**: Travas para solicitações acima de **R$ 1.000,00**.
- **Bloqueio de Datas Futuras**: Impedimento de lançamentos antecipados.

---

## 🚀 Como Executar o Projeto

### **Pré-requisitos**
- Node.js (v18 ou superior)
- Docker e Docker Compose

### **1. Configuração do Banco de Dados**
Na raiz da pasta `backend`, inicie o PostgreSQL via Docker:
```bash
docker-compose up -d
```

### **2. Configuração do Backend**
1. Acesse `cd backend` e instale: `npm install`.
2. Configure o `.env` (use o `env.example` como base):
   ```env
   DATABASE_URL="postgresql://pitang_user:pitang_password@127.0.0.1:5433/pitang_reimbursements?schema=public"
   JWT_SECRET="gerar com isso: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"" 

   PORT=3000
   ```
3. Rode as migrações e o **Seed** (popula o banco com dados de teste):
   ```bash
   npm run migrate
   npm run seed
   ```
4. Inicie: `npm run dev`.

### **3. Configuração do Frontend**
1. Acesse `cd frontend` e instale: `npm install`.
2. Inicie: `npm run dev`.
3. Acesse `http://localhost:5173`.

---

## 📂 Estrutura do Projeto

O projeto foi organizado seguindo princípios de **Clean Code** e **Modularização**, facilitando a manutenção e escalabilidade.

### **Backend (`/backend`)**
A arquitetura é orientada a módulos (features):
- `src/modules/`: Contém os módulos da aplicação (Auth, Users, Categories, Reimbursements, History, Attachments). Cada módulo possui:
    - `routes.ts`: Definição das rotas e permissões.
    - `controller.ts`: Lógica de controle e orquestração.
    - `schema.ts`: Validações de entrada via Zod.
- `src/middlewares/`: Middlewares globais (Autenticação, Tratamento de Erros, Validação de Schemas).
- `src/config/`: Configurações de upload (Multer) e variáveis de ambiente.
- `prisma/`: Schema do banco de dados e scripts de Seed.

### **Frontend (`/frontend`)**
Organizado por responsabilidades:
- `src/pages/`: Componentes de página (Views) organizados por domínio (Dashboard, Reimbursements, Users, etc).
- `src/components/`: Componentes reutilizáveis (Layout, Sidebar, UI base).
- `src/services/`: Camada de comunicação com a API (Axios).
- `src/contexts/`: Gerenciamento de estado global (Autenticação).
- `src/__tests__/`: Suíte de testes unitários e de integração.

---

## 👤 Usuários para Teste (Credenciais)

Utilize os usuários abaixo (criados via Seed) para navegar pelos diferentes fluxos:

| Perfil | Email | Senha |
|---|---|---|
| **Administrador** | admin@pitang.com | 123456 |
| **Gestor** | gestor@pitang.com | 123456 |
| **Financeiro** | financeiro@pitang.com | 123456 |
| **Colaborador** | colaborador1@pitang.com | 123456 |

---

## 📂 Documentação e Coleção API (Postman)

Na raiz do projeto, você encontrará o arquivo `postman_collection.json`. 
- **Dica**: Importe-o no Postman para testar todos os endpoints. Ele já possui scripts para salvar o Token JWT automaticamente após o login.

---

## 🧪 Qualidade e Testes

O projeto conta com uma suíte de testes que cobre as regras de negócio críticas.
- **Backend**: `cd backend && npm test`
- **Frontend**: `cd frontend && npm run test`

---
