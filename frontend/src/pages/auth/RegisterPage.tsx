import { useState } from 'react';
import { Box, Flex, Heading, Text, Input, Stack, Link as ChakraLink } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import * as authService from '../../services/auth.service';
import { Field } from '../../components/ui/field';
import { UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { showSuccessAlert } from '../../components/ui/alerts';

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  perfil: z.enum(['ADMIN', 'GESTOR', 'FINANCEIRO', 'COLABORADOR'], {
    message: 'Selecione um perfil válido',
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { perfil: 'COLABORADOR' }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.register(data.nome, data.email, data.senha, data.perfil as any);
      await showSuccessAlert('Conta criada com sucesso', 'Faça login para continuar.');
      navigate('/login');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Erro ao criar conta. Verifique os dados.');
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
          style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.15) 0%, transparent 70%)' }}
        />
        
        <Box position="relative" zIndex={1}>
          <Flex align="center" gap="12px" mb="48px">
            <Box w="32px" h="32px" bg="var(--p-accent)" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
              <ShieldCheck color="white" size={20} />
            </Box>
            <Box>
              <Text color="white" fontWeight="800" fontSize="18px" letterSpacing="-0.02em" lineHeight="1.1">
                Pitang<br/>
                <Text as="span" color="var(--p-accent)" fontSize="12px" letterSpacing="0.05em">REIMBURSE</Text>
              </Text>
            </Box>
          </Flex>

          <Heading color="white" fontSize="32px" fontWeight="800" letterSpacing="-0.04em" lineHeight="1.1" mb="24px">
            Crie sua conta e comece agora
          </Heading>
          <Text color="var(--p-text-muted)" fontSize="15px" lineHeight="1.6" mb="40px">
            Junte-se à plataforma oficial de reembolsos da Pitang. Simples, rápido e transparente.
          </Text>

          <Box p="18px" borderRadius="18px" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)">
            <Stack gap="12px">
              {[
                'Cadastro instantâneo',
                'Escolha seu perfil de acesso',
                'Segurança de dados padrão Pitang'
              ].map(f => (
                <Flex key={f} align="center" gap="10px">
                  <CheckCircle2 color="var(--p-accent)" size={18} />
                  <Text color="var(--p-text-muted)" fontSize="14px">{f}</Text>
                </Flex>
              ))}
            </Stack>
          </Box>
        </Box>

        <Text color="var(--p-text-muted)" fontSize="12px" position="relative" zIndex={1}>
          © {new Date().getFullYear()} Pitang Agile IT
        </Text>
      </Flex>

      <Flex flex={1} align="center" justify="center" px={{ base: '18px', md: '28px' }} py="28px">
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
            <Heading fontSize="26px" fontWeight="800" letterSpacing="-0.03em" color="var(--s-text)" mb="6px">
              Cadastre-se
            </Heading>
            <Text color="var(--s-muted)" fontSize="14px">
              Preencha os campos abaixo para criar sua conta.
            </Text>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="18px">
              <Field label="Nome Completo" invalid={!!errors.nome} errorText={errors.nome?.message}>
                <Input 
                  {...register('nome')} 
                  placeholder="Seu nome" 
                  style={{ borderRadius: '14px', border: '1.5px solid var(--s-border)', background: 'white', padding: '14px 15px', boxShadow: 'var(--shadow-sm)' }}
                />
              </Field>

              <Field label="E-mail" invalid={!!errors.email} errorText={errors.email?.message}>
                <Input 
                  {...register('email')} 
                  placeholder="seu@email.com" 
                  style={{ borderRadius: '14px', border: '1.5px solid var(--s-border)', background: 'white', padding: '14px 15px', boxShadow: 'var(--shadow-sm)' }}
                />
              </Field>

              <Field label="Senha" invalid={!!errors.senha} errorText={errors.senha?.message}>
                <Input 
                  {...register('senha')} 
                  type="password" 
                  placeholder="••••••••" 
                  style={{ borderRadius: '14px', border: '1.5px solid var(--s-border)', background: 'white', padding: '14px 15px', boxShadow: 'var(--shadow-sm)' }}
                />
              </Field>

              <Field label="Perfil de Acesso" invalid={!!errors.perfil} errorText={errors.perfil?.message}>
                <select
                  {...register('perfil')}
                  style={{ 
                    width: '100%', padding: '14px 15px', borderRadius: '14px', 
                    border: '1.5px solid var(--s-border)', background: 'white',
                    fontSize: '14px', outline: 'none', boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <option value="COLABORADOR">Colaborador</option>
                  <option value="GESTOR">Gestor</option>
                  <option value="FINANCEIRO">Financeiro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </Field>

              {errorMsg && (
                <Box bg="rgba(200,16,46,0.08)" border="1px solid rgba(200,16,46,0.25)" borderRadius="14px" p="12px 14px">
                  <Text color="var(--p-accent)" fontSize="13px">{errorMsg}</Text>
                </Box>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px',
                  background: loading ? 'var(--p-accent-dark)' : 'var(--p-accent)',
                  color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer',
                  fontSize: '14px', marginTop: '8px', transition: 'all 0.2s',
                  boxShadow: '0 10px 28px var(--p-accent-glow)', opacity: loading ? 0.7 : 1,
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {loading ? 'Criando conta...' : (
                  <>
                    Criar Conta
                    <UserPlus size={18} />
                  </>
                )}
              </button>

              <Text textAlign="center" fontSize="14px" mt="8px" color="var(--s-muted)">
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  style={{ color: 'var(--p-accent)', fontWeight: '700', textDecoration: 'none' }}
                >
                  Faça login
                </Link>
              </Text>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
};
