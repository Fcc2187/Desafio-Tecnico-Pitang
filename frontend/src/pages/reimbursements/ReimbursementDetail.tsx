import { Box, Stack, Heading, Text, Flex, Badge, Separator, Textarea } from '@chakra-ui/react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import * as reimbursementService from '../../services/reimbursements.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface ReimbursementDetailProps {
  reimbursement: any;
  onClose: () => void;
}

export const ReimbursementDetail = ({ reimbursement: item, onClose }: ReimbursementDetailProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [justificativa, setJustificativa] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ action, data }: { action: string, data?: any }) => {
      switch (action) {
        case 'submit': return reimbursementService.submit(item.id);
        case 'approve': return reimbursementService.approve(item.id);
        case 'reject': return reimbursementService.reject(item.id, data.justificativa);
        case 'pay': return reimbursementService.pay(item.id);
        case 'cancel': return reimbursementService.cancel(item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Erro ao processar ação');
    }
  });

  const handleAction = (action: string) => {
    if (action === 'reject' && !showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    mutation.mutate({ action, data: { justificativa } });
  };

  const canEdit = user?.perfil === 'COLABORADOR' && item.status === 'RASCUNHO';
  const canSubmit = user?.perfil === 'COLABORADOR' && item.status === 'RASCUNHO';
  const canApprove = user?.perfil === 'GESTOR' && item.status === 'ENVIADO';
  const canPay = user?.perfil === 'FINANCEIRO' && item.status === 'APROVADO';
  const canCancel = (user?.perfil === 'COLABORADOR' && (item.status === 'RASCUNHO' || item.status === 'ENVIADO')) || user?.perfil === 'ADMIN';

  return (
    <Stack gap={6}>
      <Box>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Heading size="md">{item.descricao}</Heading>
            <Text color="gray.500" fontSize="sm">ID: {item.id.substring(0, 8)}...</Text>
          </Box>
          <Badge colorPalette={item.status === 'APROVADO' ? 'green' : 'blue'} variant="solid">
            {item.status}
          </Badge>
        </Flex>
      </Box>

      <Separator />

      <Stack gap={4}>
        <Box>
          <Text fontWeight="bold" fontSize="xs" color="gray.500" textTransform="uppercase">Detalhes da Despesa</Text>
          <Flex justify="space-between" mt={2}>
            <Text color="gray.600">Categoria:</Text>
            <Text fontWeight="medium">{item.categoria.nome}</Text>
          </Flex>
          <Flex justify="space-between" mt={1}>
            <Text color="gray.600">Valor:</Text>
            <Text fontWeight="bold" color="teal.600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
            </Text>
          </Flex>
          <Flex justify="space-between" mt={1}>
            <Text color="gray.600">Data da Despesa:</Text>
            <Text fontWeight="medium">{new Date(item.dataDespesa).toLocaleDateString('pt-BR')}</Text>
          </Flex>
          <Flex justify="space-between" mt={1}>
            <Text color="gray.600">Solicitante:</Text>
            <Text fontWeight="medium">{item.solicitante.nome}</Text>
          </Flex>
        </Box>

        {item.justificativaRejeicao && (
          <Box bg="red.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="red.500">
            <Text fontWeight="bold" fontSize="xs" color="red.700">JUSTIFICATIVA DA REJEIÇÃO</Text>
            <Text fontSize="sm" color="red.600">{item.justificativaRejeicao}</Text>
          </Box>
        )}
      </Stack>

      <Separator />

      <Stack gap={3}>
        {showRejectInput && (
          <Box>
            <Text mb={2} fontSize="sm" fontWeight="medium">Justificativa da Rejeição:</Text>
            <Textarea 
              value={justificativa} 
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Explique o motivo da rejeição..."
              size="sm"
            />
          </Box>
        )}

        <Flex gap={3} flexWrap="wrap">
          {canSubmit && (
            <Button bg="blue.500" color="white" flex={1} onClick={() => handleAction('submit')} loading={mutation.isPending}>
              Enviar para Aprovação
            </Button>
          )}
          {canApprove && !showRejectInput && (
            <Button bg="green.500" color="white" flex={1} onClick={() => handleAction('approve')} loading={mutation.isPending}>
              Aprovar
            </Button>
          )}
          {(canApprove || user?.perfil === 'ADMIN') && (
            <Button bg="red.500" color="white" flex={1} onClick={() => handleAction('reject')} loading={mutation.isPending}>
              {showRejectInput ? 'Confirmar Rejeição' : 'Rejeitar'}
            </Button>
          )}
          {canPay && (
            <Button bg="teal.500" color="white" flex={1} onClick={() => handleAction('pay')} loading={mutation.isPending}>
              Marcar como Pago
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" color="red.500" flex={1} onClick={() => handleAction('cancel')} loading={mutation.isPending}>
              Cancelar Solicitação
            </Button>
          )}
        </Flex>
        
        {showRejectInput && (
          <Button variant="ghost" size="sm" onClick={() => setShowRejectInput(false)}>Voltar</Button>
        )}
      </Stack>
    </Stack>
  );
};
