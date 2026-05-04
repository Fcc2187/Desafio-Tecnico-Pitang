import { useState } from 'react';
import { Box, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { Field } from '../../components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';
import { showErrorAlert, showSuccessAlert } from '../../components/ui/alerts';


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
      await showSuccessAlert('Login realizado com sucesso', 'Bem-vindo de volta ao painel.');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Credenciais inválidas. Tente novamente.';
      setErrorMsg(message);
      await showErrorAlert('Falha no login', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="var(--app-bg)">
      <Flex
        display={{ base: 'none', lg: 'flex' }}
        flexDir="column"
        justify="space-between"
        w="520px"
        flexShrink={0}
        p="56px"
        position="relative"
        overflow="hidden"
        style={{
          background: 'linear-gradient(155deg, #101523 0%, #0d0d0d 56%, #1a0a10 100%)',
          boxShadow: '20px 0 50px rgba(15, 23, 42, 0.18)',
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

          <Box mt="32px" p="18px" borderRadius="18px" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)">
            <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" color="var(--p-text-muted)" mb="12px">
              O que você encontra aqui
            </Text>
            <Stack gap="10px">
              {['Aprovação por fluxo de perfis', 'Histórico de auditoria completo', 'Gestão por categorias'].map(f => (
                <Flex key={f} align="center" gap="10px">
                  <Box w="7px" h="7px" borderRadius="full" bg="var(--p-accent)" flexShrink={0} boxShadow="0 0 0 4px rgba(200,16,46,0.12)" />
                  <Text color="var(--p-text-muted)" fontSize="13px">{f}</Text>
                </Flex>
              ))}
            </Stack>
          </Box>
        </Box>

        <Text color="var(--p-text-muted)" fontSize="12px" position="relative" zIndex={1}>
          © {new Date().getFullYear()} Pitang Agile IT
        </Text>
      </Flex>

      <Flex
        flex={1}
        align="center"
        justify="center"
        px={{ base: '18px', md: '28px' }}
        py="28px"
      >
        <Box w="100%" maxW="460px">
          <Box
            mb="28px"
            p={{ base: '22px', md: '28px' }}
            borderRadius="24px"
            bg="rgba(255,255,255,0.92)"
            border="1px solid var(--s-border)"
            boxShadow="var(--shadow-lg)"
            backdropFilter="blur(14px)"
          >
            <Heading
              fontSize="28px"
              fontWeight="900"
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
            <Stack gap="18px" p={{ base: '0', md: '2px' }}>
              <Field label="E-mail" invalid={!!errors.email} errorText={errors.email?.message}>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="seu@pitang.com"
                  size="lg"
                  style={{
                    background: 'white',
                    border: '1.5px solid var(--s-border)',
                    borderRadius: '14px',
                    fontSize: '14px',
                    padding: '14px 15px',
                    boxShadow: 'var(--shadow-sm)',
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
                    borderRadius: '14px',
                    fontSize: '14px',
                    padding: '14px 15px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />
              </Field>

              {errorMsg && (
                <Box
                  bg="rgba(200,16,46,0.08)"
                  border="1px solid rgba(200,16,46,0.25)"
                  borderRadius="14px"
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
                  padding: '14px 20px',
                  borderRadius: '14px',
                  background: loading ? 'var(--p-accent-dark)' : 'var(--p-accent)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginTop: '8px',
                  boxShadow: '0 10px 28px var(--p-accent-glow)',
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

              <Text textAlign="center" fontSize="14px" mt="8px" color="var(--s-muted)">
                Ainda não tem uma conta?{' '}
                <Link 
                  to="/register" 
                  style={{ color: 'var(--p-accent)', fontWeight: '700', textDecoration: 'none' }}
                >
                  Criar conta
                </Link>
              </Text>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
};
