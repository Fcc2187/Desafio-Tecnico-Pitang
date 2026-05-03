# 🚀 Pitang Reimburse - Sistema de Gestão de Reembolsos

Este é um sistema completo para controle de solicitações de reembolso, desenvolvido como parte do desafio técnico da Pitang Agile IT. A solução abrange desde a criação de rascunhos por colaboradores até o processamento final de pagamento pelo setor financeiro, com fluxos de aprovação e auditoria rigorosos.

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Node.js & TypeScript**
- **Express**: Framework web.
- **Prisma ORM**: Modelagem e persistência de dados (PostgreSQL).
- **Zod**: Validação de esquemas e dados de entrada.
- **DayJS**: Manipulação e validação de datas e fusos horários.
- **JWT & BcryptJS**: Autenticação segura e hash de senhas.
- **Jest & Supertest**: Testes de integração.

### **Frontend**
- **React & TypeScript**
- **Vite**: Ferramenta de build e desenvolvimento.
- **Chakra UI v3**: Biblioteca de componentes e estilização premium.
- **TanStack Query (React Query)**: Gerenciamento de estado assíncrono e cache.
- **React Hook Form & Zod**: Formulários robustos e validados.
- **Lucide React**: Ícones modernos.
- **Vitest**: Framework de testes unitários e de componentes.

---

## ✨ Funcionalidades e Diferenciais

### **1. Fluxo de Vida Completo (Máquina de Estados)**
O sistema gerencia o ciclo completo de um reembolso:
`RASCUNHO -> ENVIADO -> APROVADO/REJEITADO -> PAGO`.
Existem travas de segurança que impedem ações inválidas (ex: editar um pedido que já foi pago ou aprovado).

### **2. Controle de Acesso Baseado em Perfis (RBAC)**
- **COLABORADOR**: Cria, edita (rascunhos) e acompanha seus próprios pedidos.
- **GESTOR**: Visualiza, aprova ou rejeita (com justificativa obrigatória) os pedidos enviados.
- **FINANCEIRO**: Processa os pagamentos de pedidos já aprovados.
- **ADMIN**: Gestão total de categorias de despesa (criar, editar, inativar).

### **3. Auditoria e Histórico Detalhado**
Toda e qualquer alteração em um reembolso (mudança de status, edição de valores ou novos anexos) gera um registro automático na tabela de histórico, informando **quem** fez, **quando** fez e **o que** foi feito.

### **4. Regras de Negócio Avançadas**
- **Limites por Categoria**: O Admin pode definir um valor máximo por categoria. O sistema bloqueia solicitações que excedam esse limite.
- **Anexo Obrigatório**: Solicitações acima de **R$ 1.000,00** exigem obrigatoriamente o upload/link de um comprovante.
- **Validação Temporal**: Bloqueio de datas futuras para despesas utilizando a biblioteca **DayJS**.

### **5. Diferenciais Técnicos (Plus)**
- **Dashboard Dinâmico**: Painel com indicadores de gastos do mês, solicitações pendentes e feed de atividades recentes.
- **Paginação e Filtros**: Listagem de reembolsos com paginação no backend e filtros combinados (Status, Categoria, Nome do Colaborador).
- **Ordenação**: Suporte a ordenação dinâmica por valor, data ou descrição.
- **Segurança**: Interceptor de resposta no frontend para redirecionamento automático em caso de token expirado (401).

---

## 🚀 Como Executar o Projeto

### **Pré-requisitos**
- Node.js (v18 ou superior)
- Docker e Docker Compose (para o banco de dados)

### **1. Configuração do Banco de Dados**
Na raiz da pasta `backend`, suba o container do PostgreSQL:
```bash
docker-compose up -d
```

### **2. Configuração do Backend**
1. Acesse a pasta `backend`: `cd backend`
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` (existe um modelo no projeto ou use as flags padrão):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/pitang_reimburse?schema=public"
   JWT_SECRET="sua_chave_secreta_aqui"
   PORT=3000
   ```
   > Você pode gerar uma `JWT_SECRET` segura rodando o comando:
   > `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Execute as migrações do Prisma:
   ```bash
   npm run migrate
   ```
5. Popule o banco com dados de teste (Seed):
   ```bash
   npm run seed
   ```
6. Inicie o servidor:
   ```bash
   npm run dev
   ```

### **3. Configuração do Frontend**
1. Acesse a pasta `frontend`: `cd ../frontend`
2. Instale as dependências: `npm install`
3. Inicie a aplicação:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:5173` no seu navegador.

---

## 👤 Usuários de Teste (Seed)

Após rodar o comando de `seed`, você pode utilizar as seguintes credenciais para testar os diferentes fluxos:

| Perfil | Email | Senha |
|---|---|---|
| **Admin** | admin@pitang.com | 123456 |
| **Gestor** | gestor@pitang.com | 123456 |
| **Financeiro** | financeiro@pitang.com | 123456 |
| **Colaborador** | colaborador1@pitang.com | 123456 |

---

## 🧪 Rodando os Testes

### **Backend**
```bash
cd backend
npm test
```

### **Frontend**
```bash
cd frontend
npm run test
```