import { Box, Flex, Table, Badge, Text, Spinner, Center, Heading } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const perfilColorMap: Record<string, { color: string; bg: string }> = {
  ADMIN:       { color: '#7f56d9', bg: '#f9f5ff' },
  GESTOR:      { color: '#0086c9', bg: '#f0f9ff' },
  FINANCEIRO:  { color: '#b54708', bg: '#fffaf5' },
  COLABORADOR: { color: '#475467', bg: '#f9fafb' },
};

export const UsersPage = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  if (isLoading) return <Center h="400px"><Spinner color="var(--p-accent)" /></Center>;
  if (error) return <Center h="400px"><Text color="red.500" fontSize="14px">Erro ao carregar lista de usuários.</Text></Center>;

  return (
    <Box>
      <Box mb="32px" pb="24px" borderBottom="1px solid var(--s-border)">
        <Text fontSize="11px" fontWeight="700" color="var(--p-accent)" letterSpacing="0.08em" textTransform="uppercase" mb="4px">
          Administração
        </Text>
        <Heading fontSize="26px" fontWeight="800" letterSpacing="-0.03em" color="#111">
          Usuários do Sistema
        </Heading>
        <Text color="var(--s-muted)" fontSize="14px" mt="4px">
          Listagem geral de colaboradores e permissões. Total de <strong>{users?.length || 0}</strong> usuários.
        </Text>
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
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader color="#ffffff" fontWeight="600" fontSize="12px" py={4} px={6}>USUÁRIO</Table.ColumnHeader>
              <Table.ColumnHeader color="#ffffff" fontWeight="600" fontSize="12px" py={4} px={6}>PERFIL</Table.ColumnHeader>
              <Table.ColumnHeader color="#ffffff" fontWeight="600" fontSize="12px" py={4} px={6} textAlign="right">STATUS</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users?.map((u: any) => {
              const theme = perfilColorMap[u.perfil] || perfilColorMap.COLABORADOR;
              const initials = u.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <Table.Row key={u.id} bg="white" _hover={{ bg: "#f9fafb" }} transition="all 0.2s">
                  <Table.Cell py={4} px={6}>
                    <Flex align="center" gap={3}>
                      <Box
                        w="40px" h="40px" borderRadius="10px"
                        display="flex" alignItems="center" justifyContent="center"
                        style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.color}20` }}
                      >
                        <Text fontSize="14px" fontWeight="700">{initials}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="600" fontSize="14px" color="#101828">{u.nome}</Text>
                        <Text fontSize="12px" color="#475467">{u.email}</Text>
                      </Box>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell py={4} px={6}>
                    <Badge 
                      style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.color}30` }}
                      px={2.5} py={0.5} borderRadius="99px" fontSize="11px" fontWeight="700"
                    >
                      {u.perfil}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell py={4} px={6} textAlign="right">
                    <Flex align="center" gap={2} justify="flex-end">
                      <Box w="6px" h="6px" borderRadius="full" bg="#10a37f" />
                      <Text fontSize="12px" fontWeight="700" color="#10a37f">Ativo</Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};
