import { useState } from 'react';
import { 
  Box, 
  Heading, 
  Flex, 
  Table, 
  Badge, 
  Text, 
  Spinner, 
  Center,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';
import { Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ReimbursementForm } from './ReimbursementForm';
import { ReimbursementDetail } from './ReimbursementDetail';

const statusMap: Record<string, { color: string, label: string }> = {
  RASCUNHO: { color: 'gray', label: 'Rascunho' },
  ENVIADO: { color: 'blue', label: 'Enviado' },
  APROVADO: { color: 'green', label: 'Aprovado' },
  REJEITADO: { color: 'red', label: 'Rejeitado' },
  PAGO: { color: 'teal', label: 'Pago' },
  CANCELADO: { color: 'orange', label: 'Cancelado' },
};

export const ReimbursementsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { data: reimbursements, isLoading, error } = useQuery({
    queryKey: ['reimbursements'],
    queryFn: reimbursementService.list,
  });

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <Text color="red.500">Erro ao carregar solicitações.</Text>
      </Center>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Solicitações de Reembolso</Heading>
          <Text color="gray.600">Gerencie e acompanhe seus pedidos de reembolso.</Text>
        </Box>
        <Button 
          bg="teal.500" 
          color="white" 
          _hover={{ bg: 'teal.600' }}
          onClick={() => setIsFormOpen(true)}
        >
          <Plus size={18} style={{ marginRight: '8px' }} /> Nova Solicitação
        </Button>
      </Flex>

      <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>Descrição</Table.ColumnHeader>
              <Table.ColumnHeader>Categoria</Table.ColumnHeader>
              <Table.ColumnHeader>Valor</Table.ColumnHeader>
              <Table.ColumnHeader>Data</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Ações</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reimbursements?.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} textAlign="center" py={10}>
                  <Text color="gray.500">Nenhuma solicitação encontrada.</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              reimbursements?.map((item) => (
                <Table.Row 
                  key={item.id} 
                  _hover={{ bg: 'gray.25' }} 
                  cursor="pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <Table.Cell fontWeight="medium">{item.descricao}</Table.Cell>
                  <Table.Cell>{item.categoria.nome}</Table.Cell>
                  <Table.Cell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(item.dataDespesa).toLocaleDateString('pt-BR')}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={statusMap[item.status].color} variant="solid">
                      {statusMap[item.status].label}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button variant="ghost" size="sm" color="teal.600">Ver Detalhes</Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {(isFormOpen || selectedItem) && (
        <>
          <Box 
            position="fixed" 
            top={0} 
            left={0} 
            w="100vw" 
            h="100vh" 
            bg="blackAlpha.600" 
            zIndex={1000} 
            onClick={() => { setIsFormOpen(false); setSelectedItem(null); }}
          />
          
          <Box 
            position="fixed" 
            top={0} 
            right={0} 
            w="500px" 
            h="100vh" 
            bg="white" 
            zIndex={1001} 
            boxShadow="2xl"
            p={8}
            overflowY="auto"
          >
            <Flex justify="flex-end" mb={4}>
              <Box cursor="pointer" onClick={() => { setIsFormOpen(false); setSelectedItem(null); }} p={2} _hover={{ bg: 'gray.100' }} borderRadius="full">
                <X size={20} />
              </Box>
            </Flex>
            
            {isFormOpen ? (
              <ReimbursementForm 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={() => setIsFormOpen(false)} 
              />
            ) : (
              <ReimbursementDetail 
                reimbursement={selectedItem} 
                onClose={() => setSelectedItem(null)} 
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
