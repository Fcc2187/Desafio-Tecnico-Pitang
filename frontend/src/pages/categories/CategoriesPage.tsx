import { useState } from 'react';
import { 
  Box, 
  Heading, 
  Flex, 
  Table, 
  Text, 
  Spinner, 
  Center,
  Input,
  Stack
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';
import { Plus, X, Tag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';

export const CategoriesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: reimbursementService.listCategories,
  });

  const mutation = useMutation({
    mutationFn: (nome: string) => reimbursementService.createCategory(nome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsFormOpen(false);
      setNewCategoryName('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Erro ao criar categoria');
    }
  });

  if (isLoading) {
    return <Center h="400px"><Spinner color="teal.500" /></Center>;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Categorias de Despesa</Heading>
          <Text color="gray.600">Gerencie as categorias disponíveis para reembolso.</Text>
        </Box>
        <Button bg="teal.500" color="white" onClick={() => setIsFormOpen(true)}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Nova Categoria
        </Button>
      </Flex>

      <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden" maxW="800px">
        <Table.Root>
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>Nome da Categoria</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Ações</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {categories?.map((cat: any) => (
              <Table.Row key={cat.id}>
                <Table.Cell fontWeight="medium">
                  <Flex align="center" gap={2}>
                    <Tag size={16} color="#319795" />
                    {cat.nome}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text color="green.500" fontSize="sm" fontWeight="bold">ATIVO</Text>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button variant="ghost" size="sm" disabled>Editar</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Manual Drawer para Nova Categoria */}
      {isFormOpen && (
        <>
          <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.600" zIndex={1000} onClick={() => setIsFormOpen(false)} />
          <Box position="fixed" top={0} right={0} w="400px" h="100vh" bg="white" zIndex={1001} boxShadow="2xl" p={8}>
            <Flex justify="flex-end" mb={4}>
              <Box cursor="pointer" onClick={() => setIsFormOpen(false)} p={2} _hover={{ bg: 'gray.100' }} borderRadius="full"><X size={20} /></Box>
            </Flex>
            <Stack gap={6}>
              <Heading size="md">Nova Categoria</Heading>
              <Field label="Nome da Categoria">
                <Input 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  placeholder="Ex: Viagens, Alimentação..." 
                />
              </Field>
              <Button 
                bg="teal.500" 
                color="white" 
                onClick={() => mutation.mutate(newCategoryName)}
                loading={mutation.isPending}
                disabled={!newCategoryName.trim()}
              >
                Criar Categoria
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};
