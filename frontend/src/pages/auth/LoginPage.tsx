import { useState } from 'react';
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Input, 
  Stack, 
  Text
} from '@chakra-ui/react';
import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.senha);
      login(response.token, response.user);
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Container maxW="md" py={12} px={6}>
        <Stack gap={8}>
          <Stack align="center">
            <Heading fontSize="4xl" color="teal.600">Pitang Reimburse</Heading>
            <Text fontSize="lg" color="gray.600">
              Gerencie seus reembolsos de forma simples
            </Text>
          </Stack>
          
          <Box
            rounded="lg"
            bg="white"
            boxShadow="lg"
            p={8}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={4}>
                <Field
                  label="Email"
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                >
                  <Input 
                    type="email" 
                    {...register('email')} 
                    placeholder="exemplo@pitang.com"
                  />
                </Field>
                
                <Field
                  label="Senha"
                  invalid={!!errors.senha}
                  errorText={errors.senha?.message}
                >
                  <Input 
                    type="password" 
                    {...register('senha')} 
                    placeholder="******"
                  />
                </Field>
                
                <Stack gap={10}>
                  <Button
                    bg="teal.500"
                    color="white"
                    _hover={{
                      bg: 'teal.600',
                    }}
                    type="submit"
                    loading={loading}
                  >
                    Entrar
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </Flex>
  );
};
