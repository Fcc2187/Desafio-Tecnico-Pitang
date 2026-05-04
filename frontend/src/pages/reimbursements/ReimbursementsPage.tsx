import { useState } from 'react';
import { Box, Flex, Heading, Text, Table, Badge, Spinner, Center } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';
import * as userService from '../../services/users.service';
import { Plus, X, Receipt } from 'lucide-react';
import { ReimbursementForm } from './ReimbursementForm';
import { ReimbursementDetail } from './ReimbursementDetail';

const statusMap: Record<string, { label: string; color: string }> = {
  RASCUNHO: { label: 'Rascunho', color: 'gray' },
  ENVIADO: { label: 'Enviado', color: 'blue' },
  APROVADO: { label: 'Aprovado', color: 'green' },
  REJEITADO: { label: 'Rejeitado', color: 'red' },
  PAGO: { label: 'Pago', color: 'teal' },
  CANCELADO: { label: 'Cancelado', color: 'orange' },
};

export const ReimbursementsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [colaboradorFilter, setColaboradorFilter] = useState('');
  const [sortField, setSortField] = useState('criadoEm');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['reimbursements', page, statusFilter, categoriaFilter, colaboradorFilter, sortField, sortOrder],
    queryFn: () => reimbursementService.list(page, { 
      status: statusFilter, 
      categoriaId: categoriaFilter, 
      colaborador: colaboradorFilter,
      sortField,
      sortOrder
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: reimbursementService.listCategories,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userService.list,
  });

  const reimbursements = paginatedData?.data || [];
  const meta = paginatedData?.meta;

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(null);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleToggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  if (isLoading) return <Center h="400px"><Spinner color="var(--p-accent)" /></Center>;

  return (
    <Box>
      <Box
        mb="28px"
        p={{ base: '20px', md: '24px', lg: '28px' }}
        borderRadius="24px"
        bg="linear-gradient(135deg, rgba(16,21,35,0.98) 0%, rgba(26,31,46,0.96) 58%, rgba(200,16,46,0.9) 140%)"
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
              Gestão Financeira
            </Text>
            <Heading fontSize={{ base: '28px', md: '34px', xl: '40px' }} fontWeight="900" letterSpacing="-0.05em" lineHeight="1.02" color="#ffffff">
              Solicitações de Reembolso
            </Heading>
            <Text color="rgba(255,255,255,0.75)" fontSize="14px" mt="10px" maxW="700px">
              Gerencie os pedidos, filtre por contexto e acompanhe o status com menos ruído visual.
            </Text>
          </Box>
          <Flex gap={3} align="center" flexWrap="wrap" justify="flex-end">
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
              <Plus size={16} /> Nova Solicitação
            </button>
          </Flex>
        </Flex>
      </Box>

      <Box
        mb="18px"
        p={{ base: '16px', md: '18px', lg: '20px' }}
        borderRadius="20px"
        border="1px solid var(--s-border)"
        bg="rgba(255,255,255,0.92)"
        boxShadow="var(--shadow-md)"
      >
        <Box mb={{ base: '16px', md: 0 }}>
          <Text fontSize="11px" fontWeight="700" color="var(--p-accent)" letterSpacing="0.1em" textTransform="uppercase" mb="6px">
            Filtros e busca
          </Text>
          <Text fontSize="14px" color="var(--s-muted)">Combine critérios para encontrar solicitações rapidamente.</Text>
        </Box>
        <Flex gap={{ base: '12px', md: '16px' }} align="center" flexWrap="wrap" mt={{ base: '16px', md: 0 }}>
          <select
            value={categoriaFilter}
            onChange={(e) => { setCategoriaFilter(e.target.value); setPage(1); }}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              border: '1.5px solid #e5e7eb', background: 'white',
              fontSize: '14px', outline: 'none', color: '#475467',
              fontWeight: '500', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
              minWidth: '140px', flex: '1 1 140px'
            }}
          >
            <option value="">Categorias</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              border: '1.5px solid #e5e7eb', background: 'white',
              fontSize: '14px', outline: 'none', color: '#475467',
              fontWeight: '500', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
              minWidth: '140px', flex: '1 1 140px'
            }}
          >
            <option value="">Status</option>
            {Object.keys(statusMap).map(status => (
              <option key={status} value={status}>{statusMap[status].label}</option>
            ))}
          </select>
          <select
            value={colaboradorFilter}
            onChange={(e) => { setColaboradorFilter(e.target.value); setPage(1); }}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              border: '1.5px solid #e5e7eb', background: 'white',
              fontSize: '14px', outline: 'none', color: '#475467',
              fontWeight: '500', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
              minWidth: '180px', flex: '1.5 1 180px'
            }}
          >
            <option value="">Colaboradores</option>
            {users?.filter((u: any) => u.perfil === 'COLABORADOR').map((user: any) => (
              <option key={user.id} value={user.nome}>{user.nome}</option>
            ))}
          </select>
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
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>DESCRIÇÃO</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>CATEGORIA</Table.ColumnHeader>
              <Table.ColumnHeader 
                color="#475467" fontWeight="600" fontSize="12px" py={4} px={6} 
                cursor="pointer" onClick={() => handleToggleSort('valor')}
                _hover={{ bg: "gray.50" }}
              >
                VALOR {sortField === 'valor' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.ColumnHeader>
              <Table.ColumnHeader 
                color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}
                cursor="pointer" onClick={() => handleToggleSort('dataDespesa')}
                _hover={{ bg: "gray.50" }}
              >
                DATA {sortField === 'dataDespesa' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6}>STATUS</Table.ColumnHeader>
              <Table.ColumnHeader color="#475467" fontWeight="600" fontSize="12px" py={4} px={6} textAlign="right">AÇÕES</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reimbursements?.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} textAlign="center" py="84px">
                  <Flex direction="column" align="center" gap={3}>
                    <Box p={3} bg="rgba(15,23,42,0.05)" borderRadius="full">
                      <Receipt size={24} color="#98a2b3" />
                    </Box>
                    <Text color="#667085" fontSize="14px" fontWeight="600">Nenhuma solicitação encontrada</Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : (
              reimbursements?.map((item: any) => (
                <Table.Row 
                  key={item.id} 
                  bg="white"
                  _hover={{ bg: "rgba(200,16,46,0.03)" }} 
                  cursor="pointer"
                  onClick={() => setSelectedItem(item)}
                  transition="background 0.18s ease"
                >
                  <Table.Cell py={5} px={6}>
                    <Text fontWeight="600" fontSize="14px" color="#101828">{item.descricao}</Text>
                  </Table.Cell>
                  <Table.Cell py={5} px={6}>
                    <Text fontSize="14px" color="#475467">{item.categoria.nome}</Text>
                  </Table.Cell>
                  <Table.Cell py={5} px={6}>
                    <Text fontWeight="700" fontSize="14px" color="#101828">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell py={5} px={6}>
                    <Text fontSize="14px" color="#475467">{new Date(item.dataDespesa).toLocaleDateString('pt-BR')}</Text>
                  </Table.Cell>
                  <Table.Cell py={5} px={6}>
                    <Badge colorPalette={statusMap[item.status].color} variant="solid" borderRadius="999px" px={2.5} py={1} fontSize="10px" fontWeight="700">
                      {statusMap[item.status].label}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell py={5} px={6} textAlign="right">
                    <Text fontSize="13px" fontWeight="700" color="var(--p-accent)">Ver detalhes</Text>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
        
        {meta && meta.totalPages > 1 && (
          <Flex justify="space-between" align="center" p={4} borderTop="1px solid var(--s-border)" bg="rgba(248,250,252,0.9)">
            <Text fontSize="13px" color="#475467">
              Página <strong>{meta.page}</strong> de <strong>{meta.totalPages}</strong> (Total: {meta.total})
            </Text>
            <Flex gap={2}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                  background: page === 1 ? '#f2f4f7' : 'white',
                  color: page === 1 ? '#98a2b3' : '#344054',
                  border: '1px solid #d0d5dd', cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                  background: page === meta.totalPages ? '#f2f4f7' : 'white',
                  color: page === meta.totalPages ? '#98a2b3' : '#344054',
                  border: '1px solid #d0d5dd', cursor: page === meta.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Próxima
              </button>
            </Flex>
          </Flex>
        )}
      </Box>

      {(isFormOpen || selectedItem) && (
        <>
          <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0,0,0,0.4)" zIndex={1000} onClick={handleClose} />
          <Box position="fixed" top={0} right={0} w={{ base: '100vw', md: '540px' }} h="100vh" bg="rgba(255,255,255,0.98)" zIndex={1001} boxShadow="-20px 0 50px rgba(15,23,42,0.14)" p={{ base: '22px', md: '40px' }} overflowY="auto">
            <Flex justify="flex-end" mb="24px">
              <Box as="button" onClick={handleClose} p="8px" borderRadius="full" _hover={{ bg: "gray.100" }} border="none" bg="transparent" cursor="pointer">
                <X size={20} />
              </Box>
            </Flex>
            {isFormOpen ? (
              <ReimbursementForm onClose={handleClose} initialData={editingItem} />
            ) : (
              <ReimbursementDetail reimbursement={selectedItem} onClose={handleClose} onEdit={handleEdit} />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
