import { 
  Box, 
  Heading, 
  Table, 
  Badge, 
  Text, 
  Spinner, 
  Center
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const perfilColorMap: Record<string, string> = {
  ADMIN: 'purple',
  GESTOR: 'blue',
  FINANCEIRO: 'orange',
  COLABORADOR: 'gray',
};

export const UsersPage = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  if (isLoading) {
    return <Center h="400px"><Spinner color="teal.500" /></Center>;
  }

  if (error) {
    return <Center h="400px"><Text color="red.500">Acesso negado ou erro ao carregar usuários.</Text></Center>;
  }

  return (
    <Box>
      <Box mb={8}>
        <Heading size="lg">Usuários do Sistema</Heading>
        <Text color="gray.600">Visualize todos os usuários e seus perfis de acesso.</Text>
      </Box>

      <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>Nome</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Perfil</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users?.map((u: any) => (
              <Table.Row key={u.id}>
                <Table.Cell fontWeight="medium">{u.nome}</Table.Cell>
                <Table.Cell>{u.email}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={perfilColorMap[u.perfil]} variant="solid">
                    {u.perfil}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Text color="green.500" fontSize="sm" fontWeight="bold">ATIVO</Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};
