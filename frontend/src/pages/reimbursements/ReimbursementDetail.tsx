import { Box, Stack, Heading, Text, Flex, Badge, Separator, Textarea, Spinner, Center } from '@chakra-ui/react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import * as reimbursementService from '../../services/reimbursements.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Clock, CheckCircle, XCircle, DollarSign, Send, RotateCcw, User, FileText } from 'lucide-react';

interface ReimbursementDetailProps {
  reimbursement: any;
  onClose: () => void;
  onEdit: (item: any) => void;
}

const actionIcons: Record<string, any> = {
  CREATED: { icon: RotateCcw, color: 'gray.500', label: 'Criou a solicitação' },
  UPDATED: { icon: RotateCcw, color: 'blue.500', label: 'Atualizou os dados' },
  SUBMITTED: { icon: Send, color: 'blue.600', label: 'Enviou para análise' },
  APPROVED: { icon: CheckCircle, color: 'green.500', label: 'Aprovou a solicitação' },
  REJECTED: { icon: XCircle, color: 'red.500', label: 'Rejeitou a solicitação' },
  PAID: { icon: DollarSign, color: 'teal.500', label: 'Confirmou o pagamento' },
  CANCELED: { icon: XCircle, color: 'orange.500', label: 'Cancelou a solicitação' },
};

export const ReimbursementDetail = ({ reimbursement: initialItem, onClose, onEdit }: ReimbursementDetailProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [justificativa, setJustificativa] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ['reimbursement', initialItem.id],
    queryFn: () => reimbursementService.getById(initialItem.id),
  });

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
      queryClient.invalidateQueries({ queryKey: ['reimbursement', initialItem.id] });
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Erro ao processar ação');
    }
  });

  if (isLoading) return <Center py={10}><Spinner color="var(--p-accent)" /></Center>;
  if (!item) return <Text>Erro ao carregar detalhes.</Text>;

  const handleAction = (action: string) => {
    if (action === 'reject') {
      if (!showRejectInput) {
        setShowRejectInput(true);
        return;
      }
      if (!justificativa.trim()) {
        alert('A justificativa é obrigatória para rejeitar.');
        return;
      }
    }
    mutation.mutate({ action, data: { justificativa } });
  };

  const canSubmit = user?.perfil === 'COLABORADOR' && item.status === 'RASCUNHO';
  const canApprove = user?.perfil === 'GESTOR' && item.status === 'ENVIADO';
  const canPay = user?.perfil === 'FINANCEIRO' && item.status === 'APROVADO';
  const canCancel = (user?.perfil === 'COLABORADOR' && (item.status === 'RASCUNHO' || item.status === 'ENVIADO')) || user?.perfil === 'ADMIN';

  return (
    <Stack gap={6}>
      <Box>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Heading fontSize="20px" fontWeight="800" color="#111">{item.descricao}</Heading>
            <Text color="var(--s-muted)" fontSize="13px" mt="1">ID: {item.id.substring(0, 8).toUpperCase()}</Text>
          </Box>
          <Badge colorPalette={item.status === 'APROVADO' ? 'green' : 'blue'} variant="solid" px={3} py={1} borderRadius="lg">
            {item.status}
          </Badge>
        </Flex>
      </Box>

      <Separator />

      <Box bg="#f8f9fc" p="20px" borderRadius="14px" border="1px solid var(--s-border)">
        <Text fontWeight="800" fontSize="12px" color="var(--s-muted)" textTransform="uppercase" mb="16px" letterSpacing="0.05em">Detalhes da Solicitação</Text>
        <Stack gap="12px">
          <Flex justify="space-between">
            <Text color="#475467" fontSize="14px">Categoria</Text>
            <Text fontWeight="700" fontSize="14px" color="#101828">{item.categoria.nome}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="#475467" fontSize="14px">Valor Total</Text>
            <Text fontWeight="800" fontSize="16px" color="var(--p-accent)">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
            </Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="#475467" fontSize="14px">Data da Despesa</Text>
            <Text fontWeight="700" fontSize="14px" color="#101828">{new Date(item.dataDespesa).toLocaleDateString('pt-BR')}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="#475467" fontSize="14px">Solicitante</Text>
            <Flex align="center" gap={2}>
              <Box w="24px" h="24px" borderRadius="full" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                <User size={12} color="#667085" />
              </Box>
              <Text fontWeight="700" fontSize="14px" color="#101828">{item.solicitante.nome}</Text>
            </Flex>
          </Flex>
        </Stack>
      </Box>
      
      {item.attachments?.length > 0 && (
        <Box>
          <Text fontWeight="800" fontSize="12px" color="var(--s-muted)" textTransform="uppercase" mb="12px" letterSpacing="0.05em">Anexos ({item.attachments.length})</Text>
          <Stack gap={3}>
            {item.attachments.map((att: any) => (
              <Box 
                key={att.id}
                bg="white" p="12px" borderRadius="12px" border="1px solid" borderColor="var(--s-border)"
                transition="all 0.2s" _hover={{ borderColor: "var(--p-accent)", bg: "blue.50" }}
              >
                <Flex align="center" gap={3} justify="space-between">
                  <Flex align="center" gap={3}>
                    {att.tipoArquivo === 'image' || att.urlArquivo.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <Box 
                        w="44px" h="44px" borderRadius="8px" overflow="hidden" border="1px solid var(--s-border)"
                        bg="gray.100" flexShrink={0}
                      >
                        <img src={att.urlArquivo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ) : (
                      <Box p={3} bg="blue.100" borderRadius="8px" flexShrink={0}>
                        <FileText size={18} color="#2b6cb0" />
                      </Box>
                    )}
                    <Box overflow="hidden">
                      <Text fontSize="13px" fontWeight="700" color="#101828" isTruncated>{att.nomeArquivo}</Text>
                      <Text fontSize="11px" color="var(--s-muted)">Clique para abrir o arquivo original</Text>
                    </Box>
                  </Flex>
                  <a 
                    href={att.urlArquivo} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      textDecoration: 'none', background: 'var(--p-accent)', 
                      padding: '8px 14px', borderRadius: '8px', 
                      fontSize: '12px', fontWeight: '700', color: 'white', 
                      boxShadow: '0 4px 10px var(--p-accent-glow)' 
                    }}
                  >
                    Abrir
                  </a>
                </Flex>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Text fontWeight="800" fontSize="12px" color="var(--s-muted)" textTransform="uppercase" mb="20px" letterSpacing="0.05em">Histórico de Auditoria</Text>
        <Stack gap="0" position="relative">
          {item.history?.map((event: any, idx: number) => {
            const config = actionIcons[event.acao] || { icon: Clock, color: 'gray.400', label: event.acao };
            const Icon = config.icon;
            return (
              <Flex key={event.id} gap="16px" position="relative">
                {idx !== item.history.length - 1 && (
                  <Box position="absolute" left="11px" top="24px" bottom="0" w="2px" bg="var(--s-border)" />
                )}
                <Box w="24px" h="24px" borderRadius="full" bg="white" border="2px solid" borderColor={config.color} display="flex" alignItems="center" justifyContent="center" zIndex={1} flexShrink={0}>
                  <Icon size={12} color={config.color} />
                </Box>
                <Box pb="24px">
                  <Flex align="center" gap="8px" mb="2px">
                    <Text fontWeight="700" fontSize="14px" color="#101828">{event.usuario.nome}</Text>
                    <Badge size="sm" variant="subtle" colorPalette={config.color.split('.')[0]} fontSize="9px">{config.label}</Badge>
                    <Text fontSize="11px" color="var(--s-muted)">• {new Date(event.criadoEm).toLocaleString('pt-BR')}</Text>
                  </Flex>
                  <Text fontSize="13px" color="#475467">{event.observacao}</Text>
                </Box>
              </Flex>
            );
          })}
        </Stack>
      </Box>

      <Separator />

      <Stack gap={3}>
        {showRejectInput && (
          <Box>
            <Text mb={2} fontSize="14px" fontWeight="700" color="#111">Motivo da Rejeição <Text as="span" color="red.500">*</Text></Text>
            <Textarea 
              value={justificativa} 
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva o motivo detalhadamente..."
              size="md"
              style={{ borderRadius: '10px', border: '1.5px solid var(--s-border)' }}
            />
          </Box>
        )}

        <Flex gap={3} flexWrap="wrap">
          {canSubmit && (
            <Button variant="outline" color="blue.600" flex={1} onClick={() => onEdit(item)}>
              Editar Rascunho
            </Button>
          )}
          {canSubmit && (
            <Button bg="blue.600" color="white" flex={1} onClick={() => handleAction('submit')} loading={mutation.isPending}>
              <Send size={16} /> Enviar para Aprovação
            </Button>
          )}
          {canApprove && !showRejectInput && (
            <Button bg="#10a37f" color="white" flex={1} onClick={() => handleAction('approve')} loading={mutation.isPending}>
              <CheckCircle size={16} /> Aprovar
            </Button>
          )}
          {(canApprove || user?.perfil === 'ADMIN') && (
            <Button bg="var(--p-accent)" color="white" flex={showRejectInput ? 1 : 'none'} onClick={() => handleAction('reject')} loading={mutation.isPending}>
              <XCircle size={16} /> {showRejectInput ? 'Confirmar Rejeição' : 'Rejeitar'}
            </Button>
          )}
          {canPay && (
            <Button bg="teal.600" color="white" flex={1} onClick={() => handleAction('pay')} loading={mutation.isPending}>
              <DollarSign size={16} /> Confirmar Pagamento
            </Button>
          )}
          {canCancel && !showRejectInput && (
            <Button variant="outline" color="red.600" border="1px solid red.200" flex={1} onClick={() => handleAction('cancel')} loading={mutation.isPending}>
              Cancelar
            </Button>
          )}
        </Flex>
        
        {showRejectInput && (
          <Button variant="ghost" size="sm" color="gray.500" onClick={() => setShowRejectInput(false)}>Desistir</Button>
        )}
      </Stack>
    </Stack>
  );
};
