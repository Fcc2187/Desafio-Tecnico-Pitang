import { Box, Stack, Heading, Text, Flex, Badge, Separator, Textarea, Spinner, Center, SimpleGrid } from '@chakra-ui/react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import * as reimbursementService from '../../services/reimbursements.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Clock, CheckCircle, XCircle, DollarSign, Send, RotateCcw, User, FileText } from 'lucide-react';
import { showErrorAlert, showWarningAlert, showSuccessAlert, showConfirmAlert } from '../../components/ui/alerts';

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      queryClient.invalidateQueries({ queryKey: ['reimbursement', initialItem.id] });
      
      const messages: Record<string, string> = {
        submit: 'Solicitação enviada com sucesso!',
        approve: 'Solicitação aprovada!',
        reject: 'Solicitação rejeitada.',
        pay: 'Pagamento confirmado!',
        cancel: 'Solicitação cancelada.',
      };

      showSuccessAlert('Concluído', messages[variables.action] || 'Ação realizada com sucesso.');
      onClose();
    },
    onError: (error: any) => {
      showErrorAlert('Erro ao processar ação', error.response?.data?.message || 'Tente novamente em instantes.');
    }
  });

  if (isLoading) return <Center py={10}><Spinner color="var(--p-accent)" /></Center>;
  if (!item) return <Text>Erro ao carregar detalhes.</Text>;

  const handleAction = async (action: string) => {
    const confirmationMessages: Record<string, { title: string, text: string }> = {
      submit: { title: 'Enviar Solicitação?', text: 'Deseja enviar este rascunho para análise do gestor?' },
      approve: { title: 'Aprovar Reembolso?', text: 'Deseja confirmar a aprovação desta solicitação?' },
      reject: { title: 'Rejeitar Reembolso?', text: 'Deseja realmente rejeitar esta solicitação?' },
      pay: { title: 'Confirmar Pagamento?', text: 'Deseja marcar esta solicitação como paga agora?' },
      cancel: { title: 'Cancelar Solicitação?', text: 'Deseja realmente cancelar este reembolso?' },
    };

    if (action === 'reject') {
      if (!showRejectInput) {
        setShowRejectInput(true);
        return;
      }
      if (!justificativa.trim()) {
        showWarningAlert('Justificativa obrigatória', 'Informe o motivo antes de rejeitar a solicitação.');
        return;
      }
    }

    const confirm = confirmationMessages[action];
    if (confirm) {
      const result = await showConfirmAlert(confirm.title, confirm.text);
      if (!result.isConfirmed) return;
    }

    mutation.mutate({ action, data: { justificativa } });
  };

  const canSubmit = user?.perfil === 'COLABORADOR' && item.status === 'RASCUNHO';
  const canApprove = user?.perfil === 'GESTOR' && item.status === 'ENVIADO';
  const canPay = user?.perfil === 'FINANCEIRO' && item.status === 'APROVADO';
  const canCancel = (user?.perfil === 'COLABORADOR' && (item.status === 'RASCUNHO' || item.status === 'ENVIADO')) || user?.perfil === 'ADMIN';

  return (
    <Stack gap={5}>
      <Box
        p={{ base: '16px', md: '18px' }}
        borderRadius="20px"
        bg="linear-gradient(135deg, rgba(16,21,35,0.98) 0%, rgba(26,31,46,0.96) 56%, rgba(200,16,46,0.92) 140%)"
        color="white"
        border="1px solid rgba(255,255,255,0.06)"
        boxShadow="var(--shadow-lg)"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" inset={0} opacity={0.45} style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 26%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 24%)' }} />
        <Flex justify="space-between" align="flex-start" gap="12px" position="relative" zIndex={1} flexDirection={{ base: 'column', sm: 'row' }}>
          <Box>
            <Text fontSize="11px" fontWeight="700" color="#f9b3bf" letterSpacing="0.1em" textTransform="uppercase" mb="8px">
              Detalhes da solicitação
            </Text>
            <Heading fontSize={{ base: '18px', md: '20px' }} fontWeight="900" letterSpacing="-0.04em" lineHeight="1.05" color="#ffffff">
              {item.descricao}
            </Heading>
            <Text color="rgba(255,255,255,0.72)" fontSize="12px" mt="3px">ID: {item.id.substring(0, 8).toUpperCase()}</Text>
          </Box>
          <Badge colorPalette={item.status === 'APROVADO' ? 'green' : 'blue'} variant="solid" px={3} py={1} borderRadius="999px" fontSize="10px" fontWeight="700">
            {item.status}
          </Badge>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
        {[
          { label: 'Categoria', value: item.categoria.nome },
          { label: 'Solicitante', value: item.solicitante.nome, icon: User },
          { label: 'Valor Total', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor) },
          { label: 'Data da Despesa', value: new Date(item.dataDespesa).toLocaleDateString('pt-BR') },
        ].map((field) => (
          <Box key={field.label} p="16px" borderRadius="16px" bg="rgba(248,250,252,0.92)" border="1px solid var(--s-border)">
            <Text fontSize="10px" fontWeight="700" color="var(--s-muted)" letterSpacing="0.08em" textTransform="uppercase" mb="6px">
              {field.label}
            </Text>
            <Flex align="center" gap={2}>
              {'icon' in field && field.icon && (
                <Box w="24px" h="24px" borderRadius="full" bg="rgba(15,23,42,0.05)" display="grid" placeItems="center">
                  <field.icon size={12} color="#667085" />
                </Box>
              )}
              <Text fontWeight={field.label === 'Valor Total' ? '900' : '700'} fontSize={field.label === 'Valor Total' ? '16px' : '14px'} color={field.label === 'Valor Total' ? 'var(--p-accent)' : '#101828'}>
                {field.value}
              </Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg="rgba(248,250,252,0.92)" p="18px" borderRadius="16px" border="1px solid var(--s-border)">
        <Text fontWeight="800" fontSize="11px" color="var(--s-muted)" textTransform="uppercase" mb="14px" letterSpacing="0.08em">Resumo</Text>
        <Text fontSize="14px" color="#475467" lineHeight="1.65">
          Solicitação atualmente em status <strong>{item.status}</strong>, com histórico e anexos apresentados abaixo em formato de auditoria.
        </Text>
      </Box>
      
      {item.attachments?.length > 0 && (
        <Box>
          <Text fontWeight="800" fontSize="11px" color="var(--s-muted)" textTransform="uppercase" mb="12px" letterSpacing="0.08em">Anexos ({item.attachments.length})</Text>
          <Stack gap={3}>
            {item.attachments.map((att: any) => (
              <Box 
                key={att.id}
                bg="rgba(255,255,255,0.92)" p="12px" borderRadius="14px" border="1px solid" borderColor="var(--s-border)"
                transition="all 0.2s" _hover={{ borderColor: "var(--p-accent)", bg: "rgba(200,16,46,0.03)" }}
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
                      <Box p={3} bg="rgba(37,99,235,0.1)" borderRadius="10px" flexShrink={0}>
                        <FileText size={18} color="#2b6cb0" />
                      </Box>
                    )}
                    <Box overflow="hidden">
                      <Text fontSize="13px" fontWeight="700" color="#101828" truncate>{att.nomeArquivo}</Text>
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
        <Text fontWeight="800" fontSize="11px" color="var(--s-muted)" textTransform="uppercase" mb="20px" letterSpacing="0.08em">Histórico de Auditoria</Text>
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
              style={{ borderRadius: '14px', border: '1.5px solid var(--s-border)', boxShadow: 'var(--shadow-sm)' }}
            />
          </Box>
        )}

        <Flex gap={3} flexWrap="wrap" direction={{ base: 'column', sm: 'row' }}>
          {canSubmit && (
            <Button variant="outline" color="blue.600" flex="1 0 auto" whiteSpace="nowrap" width={{ base: '100%', sm: 'auto' }} onClick={() => onEdit(item)}>
              Editar Rascunho
            </Button>
          )}
          {canSubmit && (
            <Button bg="blue.600" color="white" flex="1.5 0 auto" whiteSpace="nowrap" width={{ base: '100%', sm: 'auto' }} onClick={() => handleAction('submit')} loading={mutation.isPending}>
              <Send size={16} /> Enviar para Aprovação
            </Button>
          )}
          {canApprove && !showRejectInput && (
            <Button bg="#10a37f" color="white" flex="1 0 auto" whiteSpace="nowrap" width={{ base: '100%', sm: 'auto' }} onClick={() => handleAction('approve')} loading={mutation.isPending}>
              <CheckCircle size={16} /> Aprovar
            </Button>
          )}
          {(canApprove || user?.perfil === 'ADMIN') && (
            <Button bg="var(--p-accent)" color="white" flex={showRejectInput ? "1 0 auto" : "none"} whiteSpace="nowrap" width={{ base: '100%', sm: 'auto' }} onClick={() => handleAction('reject')} loading={mutation.isPending}>
              <XCircle size={16} /> {showRejectInput ? 'Confirmar Rejeição' : 'Rejeitar'}
            </Button>
          )}
          {canPay && (
            <Button bg="teal.600" color="white" flex="1 0 auto" whiteSpace="nowrap" width={{ base: '100%', sm: 'auto' }} onClick={() => handleAction('pay')} loading={mutation.isPending}>
              <DollarSign size={16} /> Confirmar Pagamento
            </Button>
          )}
          {canCancel && !showRejectInput && (
            <Button variant="outline" color="red.600" border="1px solid red.200" flex="1 0 auto" whiteSpace="nowrap" width={{ base: '100%', sm: 'auto' }} onClick={() => handleAction('cancel')} loading={mutation.isPending}>
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
