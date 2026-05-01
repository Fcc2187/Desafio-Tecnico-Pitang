import { useState } from 'react';
import { Box, Flex, Table, Text, Spinner, Center, Input, Stack, Heading } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';
import { Plus, X, Tag } from 'lucide-react';
import { Field } from '../../components/ui/field';

export const CategoriesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
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

  if (isLoading) return <Center h="400px"><Spinner color="var(--p-accent)" /></Center>;

  return (
    <Box>
      <Box mb="32px" pb="24px" borderBottom="1px solid var(--s-border)">
        <Flex justify="space-between" align="flex-end">
          <Box>
            <Text fontSize="11px" fontWeight="700" color="var(--p-accent)" letterSpacing="0.08em" textTransform="uppercase" mb="4px">
              Administração
            </Text>
            <Heading fontSize="26px" fontWeight="800" letterSpacing="-0.03em" color="#111">
              Categorias de Despesa
            </Heading>
            <Text color="var(--s-muted)" fontSize="14px" mt="4px">Gerencie as categorias disponíveis para reembolso.</Text>
          </Box>
          <button
            onClick={() => setIsFormOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '10px',
              background: 'var(--p-accent)', color: 'white',
              border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
              boxShadow: '0 4px 14px var(--p-accent-glow)',
              fontFamily: 'inherit',
            }}
          >
            <Plus size={16} /> Nova Categoria
          </button>
        </Flex>
      </Box>

      <Box
        bg="white"
        borderRadius="16px"
        border="1px solid"
        borderColor="var(--s-border)"
        overflow="hidden"
        maxW="800px"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
      >
        <Table.Root variant="line" size="md">
          <Table.Header bg="#f9fafb">
            <Table.Row>
              <Table.ColumnHeader color="#ffffff" fontWeight="600" fontSize="12px" py={4} px={6}>NOME DA CATEGORIA</Table.ColumnHeader>
              <Table.ColumnHeader color="#ffffff" fontWeight="600" fontSize="12px" py={4} px={6} textAlign="right">STATUS</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {categories?.map((cat: any) => (
              <Table.Row key={cat.id} bg="white" _hover={{ bg: "#f9fafb" }} transition="all 0.2s">
                <Table.Cell py={4} px={6}>
                  <Flex align="center" gap={3}>
                    <Box p={2} bg="rgba(200,16,46,0.08)" borderRadius="8px">
                      <Tag size={14} color="var(--p-accent)" />
                    </Box>
                    <Text fontWeight="600" fontSize="14px" color="#101828">{cat.nome}</Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell py={4} px={6} textAlign="right">
                  <Flex align="center" gap={2} justify="flex-end">
                    <Box w="6px" h="6px" borderRadius="full" bg="#10a37f" />
                    <Text fontSize="12px" fontWeight="700" color="#10a37f">Ativo</Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {isFormOpen && (
        <>
          <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0,0,0,0.4)" zIndex={1000} onClick={() => setIsFormOpen(false)} />
          <Box position="fixed" top={0} right={0} w="440px" h="100vh" bg="white" zIndex={1001} boxShadow="-10px 0 30px rgba(0,0,0,0.1)" p="40px">
            <Flex justify="flex-end" mb="24px">
              <Box as="button" onClick={() => setIsFormOpen(false)} p="8px" borderRadius="full" _hover={{ bg: "gray.100" }} border="none" bg="transparent" cursor="pointer">
                <X size={20} />
              </Box>
            </Flex>
            <Stack gap="24px">
              <Box>
                <Heading fontSize="22px" fontWeight="800" color="#111" mb="6px">Nova Categoria</Heading>
                <Text fontSize="14px" color="var(--s-muted)">Defina o nome da nova categoria de reembolso.</Text>
              </Box>
              <Field label="Nome">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Refeições, Hospedagem..."
                  size="lg"
                  style={{ borderRadius: '10px', border: '1.5px solid var(--s-border)', fontSize: '14px' }}
                />
              </Field>
              <button
                onClick={() => mutation.mutate(newCategoryName)}
                disabled={!newCategoryName.trim() || mutation.isPending}
                style={{
                  width: '100%', padding: '14px', borderRadius: '10px',
                  background: !newCategoryName.trim() ? '#e4e7ec' : 'var(--p-accent)',
                  color: !newCategoryName.trim() ? '#98a2b3' : 'white',
                  border: 'none', cursor: !newCategoryName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
                  transition: 'all 0.2s', boxShadow: newCategoryName.trim() ? '0 4px 14px var(--p-accent-glow)' : 'none'
                }}
              >
                {mutation.isPending ? 'Salvando...' : 'Salvar Categoria'}
              </button>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};
