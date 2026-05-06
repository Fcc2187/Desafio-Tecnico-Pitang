# Detalhamento de Testes Automatizados (43 Casos)

Este documento lista individualmente todos os 43 testes que garantem a qualidade e segurança do sistema.

---

## 🔙 Backend (30 Testes de Integração)

(Mesmos testes descritos anteriormente, totalizando 30)

---

## 🎨 Frontend (13 Testes de Interface e Lógica)

### 📂 Login (`LoginPage.test.tsx`)
31. **Renderização de Campos**: Verifica se os inputs de login aparecem.
32. **Validação de E-mail**: Mostra erro se o e-mail estiver fora do formato.
33. **Validação de Senha**: Exibe erro se a senha for muito curta.

### 📂 Formulário (`ReimbursementForm.test.tsx`)
34. **Bloqueio de Data Futura**: Impede a seleção de datas posteriores ao dia de hoje.
35. **Flexibilidade de Anexo**: Confirma que o usuário pode salvar o rascunho sem anexo (regra de UX).

### 📂 Gestão de Categorias (`CategoriesPage.test.tsx`)
36. **Diferencial: Categoria com Limite**: Testa a criação de categorias com teto de valor.
37. **Categoria sem Limite**: Testa a criação de categorias padrão.

### 📂 Permissões (`Permissions.test.tsx`)
38. **Botão Oculto (Aprovar)**: Garante que Colaboradores não vejam o botão de aprovação.
39. **Botão Oculto (Pagar)**: Garante que Colaboradores não vejam o botão de pagamento.

### 📂 Autenticação e Rotas (`AuthContext / AuthRoute`) [NOVO]
40. **Hook useAuth**: Valida a lógica de login, logout e persistência no localStorage.
41. **Redirecionamento AuthRoute**: Garante que usuários deslogados sejam enviados para o Login e usuários logados sem permissão sejam barrados.

### 📂 Fluxos e Erros [NOVO]
42. **Fluxo de Submissão**: Valida que o preenchimento e clique em "Enviar" chama a API corretamente e fecha o formulário.
43. **Tratamento de Erro 500**: Verifica se a interface exibe um alerta (SweetAlert2) quando a API falha.

---

**Comando para rodar tudo:**
- Backend: `npm test` (dentro da pasta backend)
- Frontend: `npm run test` (dentro da pasta frontend)


**Comando para rodar tudo:**
- Backend: `npm test` (dentro da pasta backend)
- Frontend: `npm run test` (dentro da pasta frontend)
