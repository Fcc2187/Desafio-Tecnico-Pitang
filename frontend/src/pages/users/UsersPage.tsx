import { useMemo, useState } from 'react';
import { Box, Flex, Table, Text, Spinner, Center, Input, Stack, Heading, Badge, SimpleGrid } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userService from '../../services/users.service';
import { User, Edit3, X, ShieldCheck, Users2, UserCog } from 'lucide-react';
import { Field } from '../../components/ui/field';
import { showErrorAlert, showSuccessAlert } from '../../components/ui/alerts';

export const UsersPage = () => {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [newPerfil, setNewPerfil] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.list,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => userService.update(editingUser.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccessAlert('Usuário atualizado', 'As permissões foram salvas com sucesso.');
      handleClose();
    },
    onError: (error: any) => {
      showErrorAlert('Erro ao atualizar usuário', error.response?.data?.message || 'Tente novamente em instantes.');
    }
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setNewName(user.nome);
    setNewPerfil(user.perfil);
  };

  const handleClose = () => {
    setEditingUser(null);
    setNewName('');
    setNewPerfil('');
  };

  const userStats = useMemo(() => {
    const total = users?.length ?? 0;
    const admins = users?.filter((u: any) => u.perfil === 'ADMIN').length ?? 0;
    const collaborators = total - admins;
    return { total, admins, collaborators };
  }, [users]);

  if (isLoading) return <Center h="400px"><Spinner color="var(--p-accent)" /></Center>;

  return (
    <Box>
      <Box
        mb="28px"
        p={{ base: '18px', md: '24px', lg: '28px' }}
        borderRadius="24px"
        bg="linear-gradient(135deg, rgba(16,21,35,0.98) 0%, rgba(26,31,46,0.96) 56%, rgba(200,16,46,0.92) 140%)"
        color="white"
        border="1px solid rgba(255,255,255,0.06)"
        boxShadow="var(--shadow-lg)"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" inset={0} opacity={0.45} style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 26%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 24%)' }} />
        <Flex justify="space-between" align="flex-end" gap="18px" flexWrap="wrap" position="relative" zIndex={1}>
          <Box maxW="760px">
            <Text fontSize="11px" fontWeight="700" color="#f9b3bf" letterSpacing="0.1em" textTransform="uppercase" mb="8px">
              Administração
            </Text>
            <Heading fontSize={{ base: '28px', md: '34px', xl: '40px' }} fontWeight="900" letterSpacing="-0.05em" lineHeight="1.02" color="#ffffff">
              Gestão de Usuários
            </Heading>
            <Text color="rgba(255,255,255,0.75)" fontSize="14px" mt="10px" maxW="700px">
              Visualize perfis e edite permissões em uma tela mais elegante e objetiva.
            </Text>
          </Box>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="16px" mb="18px">
        {[
          { label: 'Total', value: userStats.total, icon: Users2, accent: 'var(--p-accent)' },
          { label: 'Administradores', value: userStats.admins, icon: ShieldCheck, accent: 'var(--p-green)' },
          { label: 'Demais perfis', value: userStats.collaborators, icon: UserCog, accent: 'var(--p-blue)' },
        ].map((item) => (
          <Box key={item.label} bg="rgba(255,255,255,0.92)" border="1px solid var(--s-border)" borderRadius="18px" p="18px" boxShadow="var(--shadow-md)">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="11px" fontWeight="700" color="var(--s-muted)" letterSpacing="0.08em" textTransform="uppercase" mb="6px">
                  {item.label}
                </Text>
                <Text fontSize="28px" fontWeight="900" color="var(--s-text)" letterSpacing="-0.04em" lineHeight={1}>
                  {item.value}
                </Text>
              </Box>
              <Box w="42px" h="42px" borderRadius="14px" display="grid" placeItems="center" bg={`${item.accent}15`}>
                <item.icon size={18} color={item.accent} />
              </Box>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      <Box
        mb="18px"
        p={{ base: '16px', md: '18px', lg: '20px' }}
        borderRadius="20px"
        border="1px solid var(--s-border)"
        bg="rgba(255,255,255,0.92)"
        boxShadow="var(--shadow-md)"
      >
        <Flex justify="space-between" align="flex-end" gap="16px" flexWrap="wrap">
          <Box>
            <Text fontSize="11px" fontWeight="700" color="var(--p-accent)" letterSpacing="0.1em" textTransform="uppercase" mb="6px">
              Leitura rápida
            </Text>
            <Text fontSize="14px" color="var(--s-muted)">Os dados estão organizados em uma tabela mais limpa com prioridade visual por perfil.</Text>
          </Box>
        </Flex>
      </Box>

      <Box
        bg="rgba(255,255,255,0.92)"
        borderRadius="20px"
        border="1px solid"
        borderColor="var(--s-border)"
        overflowX="auto"
        overflowY="hidden"
        boxShadow="var(--shadow-md)"
      >
        <Table.Root variant="line" size="md" minW={{ base: '760px', md: '100%' }}>
          <Table.Header bg="rgba(248,250,252,0.9)">
            <Table.Row>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>NOME / EMAIL</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>PERFIL ATUAL</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>CADASTRADO EM</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6} textAlign="right">AÇÕES</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users?.map((u: any) => (
              <Table.Row key={u.id} bg="white" _hover={{ bg: "rgba(200,16,46,0.03)" }} transition="background 0.18s ease">
                <Table.Cell py={4} px={6}>
                  <Flex align="center" gap={3}>
                    <Box p={2.5} bg="rgba(15,23,42,0.05)" borderRadius="10px">
                      <User size={14} color="#667085" />
                    </Box>
                    <Box>
                      <Text fontWeight="700" fontSize="14px" color="#101828">{u.nome}</Text>
                      <Text fontSize="12px" color="gray.500">{u.email}</Text>
                    </Box>
                  </Flex>
                </Table.Cell>
                <Table.Cell py={4} px={6}>
                  <Badge 
                    colorPalette={
                      u.perfil === 'ADMIN' ? 'purple' : 
                      u.perfil === 'GESTOR' ? 'orange' : 
                      u.perfil === 'FINANCEIRO' ? 'green' : 'blue'
                    } 
                    variant="solid"
                    borderRadius="999px"
                    px={2.5}
                    py={1}
                    fontSize="10px"
                    fontWeight="700"
                  >
                    {u.perfil}
                  </Badge>
                </Table.Cell>
                <Table.Cell py={4} px={6}>
                  <Text fontSize="13px" color="gray.600">{new Date(u.criadoEm).toLocaleDateString('pt-BR')}</Text>
                </Table.Cell>
                <Table.Cell py={4} px={6} textAlign="right">
                  <Box 
                    as="button" color="var(--s-muted)" cursor="pointer" 
                    onClick={() => handleEdit(u)} _hover={{ color: "var(--p-accent)" }}
                    bg="transparent" border="none"
                  >
                    <Edit3 size={16} />
                  </Box>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {editingUser && (
        <>
          <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0,0,0,0.4)" zIndex={1000} onClick={handleClose} />
          <Box position="fixed" top={0} right={0} w={{ base: '100vw', md: '440px' }} h="100vh" bg="rgba(255,255,255,0.98)" zIndex={1001} boxShadow="-20px 0 50px rgba(15,23,42,0.14)" p={{ base: '22px', md: '40px' }}>
            <Flex justify="flex-end" mb="24px">
              <Box as="button" onClick={handleClose} p="8px" borderRadius="full" _hover={{ bg: "gray.100" }} border="none" bg="transparent" cursor="pointer">
                <X size={20} />
              </Box>
            </Flex>
            <Stack gap="24px">
              <Box>
                <Heading fontSize="22px" fontWeight="900" letterSpacing="-0.04em" color="#111" mb="6px">Editar Permissões</Heading>
                <Text fontSize="14px" color="var(--s-muted)">Alterando dados de <strong>{editingUser.nome}</strong></Text>
              </Box>
              
              <Field label="Nome">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  size="lg"
                  style={{ borderRadius: '14px', border: '1.5px solid var(--s-border)', fontSize: '14px', boxShadow: 'var(--shadow-sm)', padding: '14px 15px' }}
                />
              </Field>

              <Field label="Perfil de Acesso">
                <select 
                  value={newPerfil}
                  onChange={(e) => setNewPerfil(e.target.value)}
                  style={{ 
                    width: '100%', padding: '14px 15px', borderRadius: '14px', 
                    border: '1.5px solid var(--s-border)', background: 'white', fontSize: '14px', boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <option value="COLABORADOR">COLABORADOR</option>
                  <option value="GESTOR">GESTOR</option>
                  <option value="FINANCEIRO">FINANCEIRO</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </Field>

              <button
                onClick={() => mutation.mutate({ nome: newName, perfil: newPerfil })}
                disabled={mutation.isPending}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px',
                  background: 'var(--p-accent)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
                  transition: 'all 0.2s', boxShadow: '0 10px 24px var(--p-accent-glow)'
                }}
              >
                {mutation.isPending ? 'Salvando...' : 'Atualizar Usuário'}
              </button>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};
