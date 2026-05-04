# Detalhamento de Testes Automatizados (28 Casos)

Este documento lista individualmente todos os 28 testes que garantem a qualidade e segurança do sistema.

---

## 🔙 Backend (19 Testes de Integração)

### 📂 Autenticação (`auth.test.ts`)
1. **Registro de Usuário**: Valida a criação de novos usuários.
2. **E-mail Único**: Impede cadastros com e-mails já existentes.
3. **Login Válido**: Confirma acesso com credenciais corretas (JWT).
4. **Login Inválido**: Bloqueia acesso com senha ou e-mail errados.

### 📂 Categorias (`categories.test.ts`)
5. **Listagem de Categorias**: Verifica se usuários logados conseguem listar categorias.
6. **Proteção de Rota (RBAC)**: Impede que Colaboradores criem categorias.
7. **Criação Administrativa**: Permite que administradores criem novas categorias.

### 📂 Reembolsos (`reimbursements.test.ts`)
8. **Criação de Rascunho**: Valida o salvamento inicial de uma solicitação.
9. **Bloqueio de Categoria Inativa**: Impede o uso de categorias desativadas.
10. **Isolamento por Usuário**: Garante que um colaborador não acesse dados de outro.
11. **Anexo e Auditoria**: Valida o upload de arquivos e o log automático no histórico.
12. **Edição com Anexo**: Permite atualizar rascunhos de alto valor se já houver anexo.
13. **BLOQUEIO DE ENVIO > 1000**: Impede o envio para análise se o valor for > R$ 1000 e faltar anexo.
14. **SUCESSO DE ENVIO > 1000**: Permite o envio para análise se houver anexo.
15. **Proteção de Aprovação**: Impede que o próprio dono ou um colaborador aprove a solicitação.
16. **Validação de Rejeição**: Exige justificativa obrigatória ao rejeitar uma solicitação.
17. **Fluxo de Aprovação**: Valida que um Gestor consegue aprovar solicitações enviadas.
18. **Fluxo de Pagamento**: Valida que o Financeiro consegue pagar solicitações aprovadas.
19. **Cancelamento de Rascunho**: Permite que o colaborador cancele seu próprio rascunho.

---

## 🎨 Frontend (9 Testes de Interface)

### 📂 Login (`LoginPage.test.tsx`)
20. **Renderização de Campos**: Verifica se os inputs de login aparecem.
21. **Validação de E-mail**: Mostra erro se o e-mail estiver fora do formato.
22. **Validação de Senha**: Exibe erro se a senha for muito curta.

### 📂 Formulário (`ReimbursementForm.test.tsx`)
23. **Bloqueio de Data Futura**: Impede a seleção de datas posteriores ao dia de hoje.
24. **Flexibilidade de Anexo**: Confirma que o usuário pode salvar o rascunho sem anexo (regra de UX).

### 📂 Gestão de Categorias (`CategoriesPage.test.tsx`)
25. **Diferencial: Categoria com Limite**: Testa a criação de categorias com teto de valor.
26. **Categoria sem Limite**: Testa a criação de categorias padrão.

### 📂 Permissões (`Permissions.test.tsx`)
27. **Botão Oculto (Aprovar)**: Garante que Colaboradores não vejam o botão de aprovação.
28. **Botão Oculto (Pagar)**: Garante que Colaboradores não vejam o botão de pagamento.

---

**Comando para rodar tudo:**
- Backend: `npm test` (dentro da pasta backend)
- Frontend: `npm run test` (dentro da pasta frontend)
