# Detalhamento de Testes Automatizados (48 Casos)

Este documento lista individualmente todos os **48 testes** que garantem a qualidade e segurança do sistema Pitang Reimburse.

---

## 🔙 Backend (30 Testes de Integração)

A suíte de testes do backend utiliza **Jest** e **Supertest**, realizando chamadas reais à API em um banco de dados de teste isolado.

### 📂 Autenticação (`auth.test.ts`)
1. **Registro de Usuário**: Valida a criação de novos usuários via `/auth/register`.
2. **E-mail Único**: Impede cadastros duplicados.
3. **Login Válido**: Confirma geração de JWT correto.
4. **Login Inválido**: Bloqueia acesso com credenciais incorretas.

### 📂 Gestão de Usuários (`users.test.ts`)
5. **Listagem Administrativa**: Garante que o ADMIN visualize todos os usuários.
6. **Bloqueio de Listagem**: Impede que perfis não autorizados listem usuários.
7. **Alteração de Perfil**: Permite que o ADMIN mude o papel de usuários (ex: COLABORADOR -> GESTOR).
8. **Erro 404**: Retorna erro ao tentar manipular usuários inexistentes.

### 📂 Categorias (`categories.test.ts`)
9. **Listagem Pública**: Verifica se usuários autenticados listam as categorias ativas.
10. **Proteção RBAC**: Impede que Colaboradores criem categorias.
11. **Criação Admin**: Permite que ADMIN crie novas categorias.
12. **Edição Admin**: Permite que ADMIN altere nomes e limites.
13. **Soft Delete**: Valida que a exclusão apenas inativa a categoria (`deletadoEm != null`).

### 📂 Reembolsos e Negócio (`reimbursements.test.ts`)
14. **Criação de Rascunho**: Valida o salvamento inicial com dados básicos.
15. **Bloqueio de Inativas**: Impede o uso de categorias desativadas em novos pedidos.
16. **Isolamento de Dados**: Garante que um usuário não veja rascunhos de outros.
17. **Anexo e Auditoria**: Valida o upload real e a geração automática de logs no histórico.
18. **Edição Permitida**: Permite atualizar rascunhos se as regras de anexo forem cumpridas.
19. **Trava de Valor (>1000)**: Impede envio sem anexo para valores altos.
20. **Sucesso de Valor (>1000)**: Permite envio com anexo para valores altos.
21. **Trava de Auto-Aprovação**: Impede que o dono aprove o próprio pedido.
22. **Justificativa Obrigatória**: Exige texto ao rejeitar uma solicitação.
23. **Fluxo de Aprovação**: Valida a mudança de status por parte do Gestor.
24. **Fluxo de Pagamento**: Valida a conclusão do processo pelo Financeiro.
25. **Cancelamento**: Permite que o dono cancele um pedido em status permitido.
26. **Dashboard Stats**: Valida a precisão dos somatórios e contagens do painel.
27. **Rota de Histórico**: Testa o endpoint `/reimbursements/:id/history`.

### 📂 Segurança Global (`errors.test.ts`)
28. **404 Not Found**: Valida tratamento de rotas inexistentes.
29. **401 Unauthorized**: Bloqueia acessos sem Token.
30. **403 Forbidden**: Bloqueia acessos com Token mas sem permissão de Perfil.

---

## 🎨 Frontend (18 Testes de Interface e Lógica)

A suíte do frontend utiliza **Vitest** e **React Testing Library** (RTL).

### 📂 Autenticação
31. **LoginPage - Renderização**: Verifica se os campos de Login aparecem.
32. **LoginPage - Validação**: Testa erros do Zod para e-mails inválidos.
33. **LoginPage - Senha**: Testa validação de comprimento de senha.
34. **AuthContext - Login**: Valida o estado global após login.
35. **AuthContext - Logout**: Valida a limpeza de dados após sair.
36. **AuthRoute - Proteção**: Garante redirecionamento de usuários deslogados.

### 📂 Formulário de Reembolso
37. **Data Futura**: Impede a seleção de datas posteriores a hoje.
38. **Regra de Anexo (R$1k)**: Valida feedback visual sobre necessidade de anexo.
39. **Mock de Upload**: Simula a seleção de arquivos e envio para a API.

### 📂 Gestão de Categorias
40. **Criação com Limite**: Valida o formulário de categoria com teto de valor.
41. **Criação sem Limite**: Valida o comportamento padrão sem limite.

### 📂 Fluxo de Detalhes e Ações
42. **ReimbursementFlow - Submissão**: Testa se clicar em "Enviar" no detalhe chama a API.
43. **Aprovação/Rejeição**: Valida a interação do Gestor no modal de detalhes.
44. **Histórico Visual**: Garante que a trilha de auditoria apareça no detalhe.

### 📂 UX e Estilização
45. **SweetAlert2 - Sucesso**: Verifica se o alerta estilizado aparece após ações.
46. **SweetAlert2 - Erro**: Verifica se o alerta de erro aparece em falhas da API.
47. **Diálogos de Confirmação**: Testa se o popup de confirmação impede ações acidentais.
48. **Feedback de Loading**: Garante que botões fiquem desabilitados durante o processamento.

---

## ✅ Resultado Final: **48 Testes Passando (100%)**

**Comandos para execução:**
```bash
cd backend && npm test

cd frontend && npm run test
```
