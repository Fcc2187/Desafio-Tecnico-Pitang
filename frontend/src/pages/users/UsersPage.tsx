import { useState } from 'react';
import { Box, Flex, Table, Text, Spinner, Center, Input, Stack, Heading, Badge } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userService from '../../services/users.service';
import { User, Edit3, X} from 'lucide-react';
import { Field } from '../../components/ui/field';

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
      handleClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Erro ao atualizar usuário');
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

  if (isLoading) return <Center h="400px"><Spinner color="var(--p-accent)" /></Center>;

  return (
    <Box>
      <Box mb="32px" pb="24px" borderBottom="1px solid var(--s-border)">
        <Box>
          <Text fontSize="11px" fontWeight="700" color="var(--p-accent)" letterSpacing="0.08em" textTransform="uppercase" mb="4px">
            Administração
          </Text>
          <Heading fontSize="26px" fontWeight="800" letterSpacing="-0.03em" color="#111">
            Gestão de Usuários
          </Heading>
          <Text color="var(--s-muted)" fontSize="14px" mt="4px">Visualize e altere as permissões dos colaboradores do sistema.</Text>
        </Box>
      </Box>

      <Box
        bg="white"
        borderRadius="16px"
        border="1px solid"
        borderColor="var(--s-border)"
        overflow="hidden"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
      >
        <Table.Root variant="line" size="md">
          <Table.Header bg="#f9fafb">
            <Table.Row>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>NOME / EMAIL</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>PERFIL ATUAL</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>CADASTRADO EM</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6} textAlign="right">AÇÕES</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users?.map((u: any) => (
              <Table.Row key={u.id} bg="white" _hover={{ bg: "#f9fafb" }} transition="all 0.2s">
                <Table.Cell py={4} px={6}>
                  <Flex align="center" gap={3}>
                    <Box p={2} bg="rgba(0,0,0,0.04)" borderRadius="8px">
                      <User size={14} color="#667085" />
                    </Box>
                    <Box>
                      <Text fontWeight="600" fontSize="14px" color="#101828">{u.nome}</Text>
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
                    variant="subtle"
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
          <Box position="fixed" top={0} right={0} w="440px" h="100vh" bg="white" zIndex={1001} boxShadow="-10px 0 30px rgba(0,0,0,0.1)" p="40px">
            <Flex justify="flex-end" mb="24px">
              <Box as="button" onClick={handleClose} p="8px" borderRadius="full" _hover={{ bg: "gray.100" }} border="none" bg="transparent" cursor="pointer">
                <X size={20} />
              </Box>
            </Flex>
            <Stack gap="24px">
              <Box>
                <Heading fontSize="22px" fontWeight="800" color="#111" mb="6px">Editar Permissões</Heading>
                <Text fontSize="14px" color="var(--s-muted)">Alterando dados de <strong>{editingUser.nome}</strong></Text>
              </Box>
              
              <Field label="Nome">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  size="lg"
                  style={{ borderRadius: '10px', border: '1.5px solid var(--s-border)', fontSize: '14px' }}
                />
              </Field>

              <Field label="Perfil de Acesso">
                <select 
                  value={newPerfil}
                  onChange={(e) => setNewPerfil(e.target.value)}
                  style={{ 
                    width: '100%', padding: '12px', borderRadius: '10px', 
                    border: '1.5px solid var(--s-border)', background: 'white', fontSize: '14px'
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
                  width: '100%', padding: '14px', borderRadius: '10px',
                  background: 'var(--p-accent)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
                  transition: 'all 0.2s', boxShadow: '0 4px 14px var(--p-accent-glow)'
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
