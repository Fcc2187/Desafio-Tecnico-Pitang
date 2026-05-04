import { useMemo, useState } from 'react';
import { Box, Flex, Table, Text, Spinner, Center, Input, Stack, Heading, SimpleGrid } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';
import { Plus, X, Tag, Edit3, ShieldCheck, Layers3, Search, Trash2 } from 'lucide-react';
import { Field } from '../../components/ui/field';
import { Switch } from '../../components/ui/switch';
import { showErrorAlert, showSuccessAlert } from '../../components/ui/alerts';

export const CategoriesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: reimbursementService.listCategories,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const { id: dataId, ...rest } = data;
      const id = dataId || editingCategory?.id;
      const payload = { ...rest, limiteValor: rest.limiteValor !== undefined ? (rest.limiteValor ? Number(rest.limiteValor) : null) : undefined };
      
      if (id) {
        return reimbursementService.updateCategory(id, payload);
      }
      return reimbursementService.createCategory(payload.nome, payload.limiteValor);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSuccessAlert('Categoria salva', 'As alterações foram aplicadas com sucesso.');
      handleClose();
    },
    onError: (error: any) => {
      showErrorAlert('Erro ao salvar categoria', error.response?.data?.message || 'Tente novamente em instantes.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reimbursementService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSuccessAlert('Categoria excluída', 'A categoria foi removida com sucesso');
    },
    onError: (error: any) => {
      showErrorAlert('Erro ao excluir', error.response?.data?.message || 'Não foi possível excluir a categoria.');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente excluir esta categoria? Esta ação é irreversível.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setNewCategoryName(cat.nome);
    setNewCategoryLimit(cat.limiteValor || '');
    setIsFormOpen(true);
  };

  const handleToggleStatus = (cat: any) => {
    mutation.mutate({ id: cat.id, ativo: !cat.ativo });
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryLimit('');
  };

  const categoryStats = useMemo(() => {
    const total = categories?.length ?? 0;
    const active = categories?.filter((cat: any) => cat.ativo).length ?? 0;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat: any) => 
      cat.nome.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [categories, searchFilter]);

  if (isLoading) return <Center h="400px"><Spinner color="var(--p-accent)" /></Center>;

  return (
    <Box>
      <Box
        mb="28px"
        p={{ base: '20px', md: '24px', lg: '28px' }}
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
              Categorias de Despesa
            </Heading>
            <Text color="rgba(255,255,255,0.75)" fontSize="14px" mt="10px" maxW="700px">
              Gerencie, ative e inative categorias em uma interface mais clara e compacta.
            </Text>
          </Box>
          <button
            onClick={() => setIsFormOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '14px',
              background: 'white', color: '#111827',
              border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '800',
              boxShadow: '0 12px 24px rgba(15,23,42,0.12)',
              fontFamily: 'inherit',
            }}
          >
            <Plus size={16} /> Nova Categoria
          </button>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="16px" mb="18px">
        {[
          { label: 'Total', value: categoryStats.total, icon: Layers3, accent: 'var(--p-accent)' },
          { label: 'Ativas', value: categoryStats.active, icon: ShieldCheck, accent: 'var(--p-green)' },
          { label: 'Inativas', value: categoryStats.inactive, icon: Tag, accent: 'var(--p-orange)' },
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
        <Flex justify="space-between" align={{ base: 'stretch', md: 'flex-end' }} gap="16px" flexWrap="wrap">
          <Box>
            <Text fontSize="11px" fontWeight="700" color="var(--p-accent)" letterSpacing="0.1em" textTransform="uppercase" mb="6px">
              Leitura rápida
            </Text>
            <Text fontSize="14px" color="var(--s-muted)">A tabela abaixo mostra o estado das categorias com navegação visual mais direta.</Text>
          </Box>
          <Box position="relative" w={{ base: '100%', md: '250px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <Input
              placeholder="Filtrar categorias..."
              size="lg"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              w="100%"
              style={{ paddingLeft: '38px', borderRadius: '14px', border: '1.5px solid var(--s-border)', boxShadow: 'var(--shadow-sm)' }}
            />
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
        w="100%"
        boxShadow="var(--shadow-md)"
      >
        <Table.Root variant="line" size="md" minW={{ base: '760px', md: '100%' }}>
          <Table.Header bg="rgba(248,250,252,0.9)">
            <Table.Row>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>NOME DA CATEGORIA</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>STATUS</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6} textAlign="right">AÇÕES</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredCategories.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={3} textAlign="center" py="40px">
                  <Text color="#94a3b8" fontSize="14px">Nenhuma categoria encontrada</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredCategories?.map((cat: any) => (
              <Table.Row key={cat.id} bg="white" _hover={{ bg: "rgba(200,16,46,0.03)" }} transition="background 0.18s ease">
                <Table.Cell py={4} px={6}>
                  <Flex align="center" gap={3}>
                    <Box p={2.5} bg={cat.ativo ? "rgba(16,163,127,0.1)" : "rgba(15,23,42,0.05)"} borderRadius="10px">
                      <Tag size={14} color={cat.ativo ? "#10a37f" : "#94a3b8"} />
                    </Box>
                    <Box>
                      <Text fontWeight="700" fontSize="14px" color={cat.ativo ? "#101828" : "gray.400"}>{cat.nome}</Text>
                      {cat.limiteValor != null && (
                        <Text fontSize="11px" color="var(--s-muted)">Limite: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.limiteValor)}</Text>
                      )}
                    </Box>
                  </Flex>
                </Table.Cell>
                <Table.Cell py={4} px={6}>
                  <Flex align="center" gap={2}>
                    <Box w="6px" h="6px" borderRadius="full" bg={cat.ativo ? "#10a37f" : "gray.400"} />
                    <Text fontSize="12px" fontWeight="700" color={cat.ativo ? "#10a37f" : "gray.500"}>
                      {cat.ativo ? 'Ativo' : 'Inativo'}
                    </Text>
                  </Flex>
                </Table.Cell>
                <Table.Cell py={4} px={6} textAlign="right">
                  <Flex gap={4} justify="flex-end" align="center">
                    <Box 
                      as="button" color="var(--s-muted)" cursor="pointer" 
                      onClick={() => handleEdit(cat)} _hover={{ color: "var(--p-accent)" }}
                      bg="transparent" border="none"
                    >
                      <Edit3 size={16} />
                    </Box>
                    <Box 
                      as="button" color="var(--s-muted)" cursor="pointer" 
                      onClick={() => handleDelete(cat.id)} _hover={{ color: "red.500" }}
                      bg="transparent" border="none"
                    >
                      <Trash2 size={16} />
                    </Box>
                    <Flex align="center" gap={2}>
                       <Text fontSize="xs" fontWeight="600" color="gray.400">Inativar</Text>
                       <Switch 
                         colorPalette="red" size="sm" 
                         checked={cat.ativo} 
                         onChange={() => handleToggleStatus(cat)} 
                       />
                    </Flex>
                  </Flex>
                </Table.Cell>
              </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {isFormOpen && (
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
                <Heading fontSize="22px" fontWeight="900" letterSpacing="-0.04em" color="#111" mb="6px">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </Heading>
                <Text fontSize="14px" color="var(--s-muted)">
                  {editingCategory ? 'Atualize o nome desta categoria.' : 'Defina o nome da nova categoria de reembolso.'}
                </Text>
              </Box>
              <Field label="Nome">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Refeições, Hospedagem..."
                  size="lg"
                  style={{ borderRadius: '14px', border: '1.5px solid var(--s-border)', fontSize: '14px', boxShadow: 'var(--shadow-sm)', padding: '14px 15px' }}
                />
              </Field>
              <Field label="Limite de Valor (Opcional)" helperText="Deixe em branco para ilimitado">
                <Input
                  value={newCategoryLimit}
                  onChange={(e) => setNewCategoryLimit(e.target.value)}
                  placeholder="Ex: 1000.00"
                  type="number"
                  step="0.01"
                  size="lg"
                  style={{ borderRadius: '14px', border: '1.5px solid var(--s-border)', fontSize: '14px', boxShadow: 'var(--shadow-sm)', padding: '14px 15px' }}
                />
              </Field>
              <button
                onClick={() => mutation.mutate({ nome: newCategoryName, limiteValor: newCategoryLimit })}
                disabled={!newCategoryName.trim() || mutation.isPending}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px',
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
