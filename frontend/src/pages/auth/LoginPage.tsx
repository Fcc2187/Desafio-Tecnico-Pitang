import { useState } from 'react';
import { Box, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { Field } from '../../components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await authService.login(data.email, data.senha);
      login(response.token, response.user);
      navigate('/');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh">
      <Flex
        display={{ base: 'none', lg: 'flex' }}
        flexDir="column"
        justify="space-between"
        w="480px"
        flexShrink={0}
        p="48px"
        position="relative"
        overflow="hidden"
        style={{
          background: 'linear-gradient(155deg, #1a1f2e 0%, #0d0d0d 60%, #1a0a10 100%)',
        }}
      >
        <Box
          position="absolute" top="-120px" right="-120px"
          w="400px" h="400px" borderRadius="full"
          style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.2) 0%, transparent 70%)' }}
        />
        <Box
          position="absolute" bottom="-80px" left="-80px"
          w="300px" h="300px" borderRadius="full"
          style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <Flex align="center" gap="12px" position="relative" zIndex={1}>
          <Box
            w="42px" h="42px" bg="var(--p-accent)" borderRadius="12px"
            display="flex" alignItems="center" justifyContent="center"
            style={{ boxShadow: '0 8px 24px var(--p-accent-glow)' }}
          >
            <Text color="white" fontWeight="900" fontSize="18px">P</Text>
          </Box>
          <Text color="white" fontWeight="800" fontSize="18px" letterSpacing="-0.03em">
            Pitang Reimburse
          </Text>
        </Flex>

        {/* Hero text */}
        <Box position="relative" zIndex={1}>
          <Box
            display="inline-flex"
            alignItems="center"
            gap="8px"
            px="12px" py="6px"
            borderRadius="99px"
            mb="24px"
            style={{
              background: 'rgba(200,16,46,0.15)',
              border: '1px solid rgba(200,16,46,0.3)',
            }}
          >
            <Receipt size={13} color="var(--p-accent)" />
            <Text color="var(--p-accent)" fontSize="12px" fontWeight="600">
              Sistema de Controle de Reembolsos
            </Text>
          </Box>
          <Heading
            color="white"
            fontWeight="800"
            fontSize="36px"
            lineHeight="1.15"
            letterSpacing="-0.03em"
            mb="16px"
          >
            Controle total dos seus reembolsos
          </Heading>
          <Text color="var(--p-text-muted)" fontSize="15px" lineHeight="1.7">
            Gerencie solicitações, acompanhe aprovações e processe pagamentos em uma plataforma segura e eficiente.
          </Text>

          {/* Feature badges */}
          <Stack gap="10px" mt="32px">
            {['Aprovação por fluxo de perfis', 'Histórico de auditoria completo', 'Gestão por categorias'].map(f => (
              <Flex key={f} align="center" gap="10px">
                <Box w="6px" h="6px" borderRadius="full" bg="var(--p-accent)" flexShrink={0} />
                <Text color="var(--p-text-muted)" fontSize="13px">{f}</Text>
              </Flex>
            ))}
          </Stack>
        </Box>

        <Text color="var(--p-text-muted)" fontSize="12px" position="relative" zIndex={1}>
          © {new Date().getFullYear()} Pitang Agile IT
        </Text>
      </Flex>

      <Flex
        flex={1}
        align="center"
        justify="center"
        bg="var(--s-bg)"
        p="32px"
      >
        <Box w="100%" maxW="400px">
          <Box mb="36px">
            <Heading
              fontSize="26px"
              fontWeight="800"
              letterSpacing="-0.03em"
              color="var(--s-text)"
              mb="6px"
            >
              Bem-vindo de volta
            </Heading>
            <Text color="var(--s-muted)" fontSize="14px">
              Entre com suas credenciais para acessar o painel.
            </Text>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="18px">
              <Field label="E-mail" invalid={!!errors.email} errorText={errors.email?.message}>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="seu@pitang.com"
                  size="lg"
                  style={{
                    background: 'white',
                    border: '1.5px solid var(--s-border)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    padding: '12px 14px',
                  }}
                />
              </Field>

              <Field label="Senha" invalid={!!errors.senha} errorText={errors.senha?.message}>
                <Input
                  type="password"
                  {...register('senha')}
                  placeholder="••••••••"
                  size="lg"
                  style={{
                    background: 'white',
                    border: '1.5px solid var(--s-border)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    padding: '12px 14px',
                  }}
                />
              </Field>

              {errorMsg && (
                <Box
                  bg="rgba(200,16,46,0.08)"
                  border="1px solid rgba(200,16,46,0.25)"
                  borderRadius="10px"
                  p="12px 14px"
                >
                  <Text color="var(--p-accent)" fontSize="13px">{errorMsg}</Text>
                </Box>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '10px',
                  background: loading ? 'var(--p-accent-dark)' : 'var(--p-accent)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginTop: '8px',
                  boxShadow: '0 8px 24px var(--p-accent-glow)',
                  opacity: loading ? 0.7 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Entrando...' : (
                  <>
                    Entrar
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
};
