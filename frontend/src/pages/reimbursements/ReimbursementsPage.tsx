import { useState } from 'react';
import { Box, Flex, Heading, Text, Table, Badge, Spinner, Center } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';
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
      <Box mb="32px" pb="24px" borderBottom="1px solid var(--s-border)">
        <Flex justify="space-between" align="flex-end">
          <Box>
            <Text fontSize="11px" fontWeight="700" color="var(--p-accent)" letterSpacing="0.08em" textTransform="uppercase" mb="4px">
              Gestão Financeira
            </Text>
            <Heading fontSize="26px" fontWeight="800" letterSpacing="-0.03em" color="#111">
              Solicitações de Reembolso
            </Heading>
            <Text color="var(--s-muted)" fontSize="14px" mt="4px">Gerencie seus pedidos de reembolso e acompanhe o status.</Text>
          </Box>
          <Flex gap={3} align="center" flexWrap="wrap" justify="flex-end">
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={colaboradorFilter}
              onChange={(e) => { setColaboradorFilter(e.target.value); setPage(1); }}
              style={{
                padding: '10px 16px', borderRadius: '10px',
                border: '1.5px solid var(--s-border)', background: 'white',
                fontSize: '14px', outline: 'none', color: '#475467',
                width: '200px'
              }}
            />
            <select
              value={categoriaFilter}
              onChange={(e) => { setCategoriaFilter(e.target.value); setPage(1); }}
              style={{
                padding: '10px 16px', borderRadius: '10px',
                border: '1.5px solid var(--s-border)', background: 'white',
                fontSize: '14px', outline: 'none', color: '#475467',
                fontWeight: '500', cursor: 'pointer'
              }}
            >
              <option value="">Todas as categorias</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                padding: '10px 16px', borderRadius: '10px',
                border: '1.5px solid var(--s-border)', background: 'white',
                fontSize: '14px', outline: 'none', color: '#475467',
                fontWeight: '500', cursor: 'pointer'
              }}
            >
              <option value="">Todos os status</option>
              {Object.keys(statusMap).map(status => (
                <option key={status} value={status}>{statusMap[status].label}</option>
              ))}
            </select>
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
              <Plus size={16} /> Nova Solicitação
            </button>
          </Flex>
        </Flex>
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
                <Table.Cell colSpan={6} textAlign="center" py="80px">
                  <Flex direction="column" align="center" gap={3}>
                    <Box p={3} bg="gray.50" borderRadius="full">
                      <Receipt size={24} color="#98a2b3" />
                    </Box>
                    <Text color="#667085" fontSize="14px" fontWeight="500">Nenhuma solicitação encontrada</Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : (
              reimbursements?.map((item: any) => (
                <Table.Row 
                  key={item.id} 
                  bg="white"
                  _hover={{ bg: "#f9fafb" }} 
                  cursor="pointer"
                  onClick={() => setSelectedItem(item)}
                  transition="all 0.2s"
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
                    <Badge colorPalette={statusMap[item.status].color} variant="solid" borderRadius="6px" px={2} py={0.5} fontSize="11px">
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
          <Flex justify="space-between" align="center" p={4} borderTop="1px solid var(--s-border)" bg="#f9fafb">
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
          <Box position="fixed" top={0} right={0} w="540px" h="100vh" bg="white" zIndex={1001} boxShadow="-10px 0 30px rgba(0,0,0,0.1)" p="40px" overflowY="auto">
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
