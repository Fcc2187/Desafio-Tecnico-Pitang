import { Box, Flex, Heading, Text, SimpleGrid, Spinner, Center, Badge, Stack } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle, DollarSign, TrendingUp, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';
import axios from 'axios';

interface StatCardProps {
  label: string;
  value: string;
  helpText: string;
  icon: any;
  accentColor: string;
  convertedValues?: { usd: string; eur: string };
}

const actionColorMap: Record<string, string> = {
  CREATED: 'gray',
  UPDATED: 'blue',
  SUBMITTED: 'blue',
  APPROVED: 'green',
  REJECTED: 'red',
  PAID: 'teal',
  CANCELED: 'orange',
};

const StatCard = ({ label, value, helpText, icon: Icon, accentColor, convertedValues }: StatCardProps) => (
  <Box
    bg="rgba(255,255,255,0.92)"
    p="24px"
    borderRadius="18px"
    border="1px solid var(--s-border)"
    position="relative"
    overflow="hidden"
    boxShadow="var(--shadow-md)"
    transition="transform 0.18s ease, box-shadow 0.18s ease"
    _hover={{ transform: 'translateY(-3px)', boxShadow: 'var(--shadow-lg)' }}
  >
    <Box
      position="absolute" top={0} left={0}
      w="4px" h="100%" bg={accentColor}
      borderRadius="4px 0 0 4px"
    />
    <Flex justify="space-between" align="flex-start" mb="16px">
      <Box>
        <Text fontSize="11px" fontWeight="700" color="var(--s-muted)" letterSpacing="0.09em" textTransform="uppercase" mb="6px">
          {label}
        </Text>
        <Text fontSize="30px" fontWeight="900" letterSpacing="-0.04em" color="var(--s-text)" lineHeight={1}>
          {value}
        </Text>
        
        {convertedValues && (
          <Flex gap={2} mt={3}>
            <Badge variant="subtle" colorPalette="blue" fontSize="13px" fontWeight="bold" borderRadius="6px">
              $ {convertedValues.usd}
            </Badge>
            <Badge variant="subtle" colorPalette="purple" fontSize="13px" fontWeight="bold" borderRadius="6px">
              € {convertedValues.eur}
            </Badge>
          </Flex>
        )}
      </Box>
      <Box
        w="40px" h="40px" borderRadius="10px"
        display="flex" alignItems="center" justifyContent="center"
        style={{ background: `${accentColor}15` }}
      >
        <Icon size={20} color={accentColor} />
      </Box>
    </Flex>
      <Text fontSize="12px" color="var(--s-muted)">{helpText}</Text>
  </Box>
);

export const DashboardPage = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reimbursementService.getStats,
  });

  const { data: rates } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const resp = await axios.get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
      return {
        usd: parseFloat(resp.data.USDBRL.bid),
        eur: parseFloat(resp.data.EURBRL.bid),
      };
    },
    staleTime: 1000 * 60 * 30, // 30 min
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner color="var(--p-accent)" size="xl" />
      </Center>
    );
  }

  const convertValue = (brlValue: number) => {
    if (!rates) return undefined;
    return {
      usd: (brlValue / rates.usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      eur: (brlValue / rates.eur).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  };


  const { stats, recentActivities } = data || { stats: { pendentes: 0, aprovadasMes: 0, totalPago: 0 }, recentActivities: [] };

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
        <Flex justify="space-between" align={{ base: 'flex-start', lg: 'flex-end' }} gap="18px" flexWrap="wrap" position="relative" zIndex={1}>
          <Box maxW="760px">
            <Text fontSize="11px" fontWeight="700" color="#f9b3bf" letterSpacing="0.1em" textTransform="uppercase" mb="8px">
              Dashboard
            </Text>
            <Heading
              fontSize={{ base: '28px', md: '34px', xl: '40px' }}
              fontWeight="900"
              letterSpacing="-0.05em"
              lineHeight="1.02"
              color="#ffffff"
            >
              Olá, {user?.nome?.split(' ')[0]}.
              <Text as="span" display="block" color="#fff1f3">
                Acompanhe seus reembolsos pelo nosso sistema.
              </Text>
            </Heading>
            <Text color="rgba(255,255,255,0.75)" fontSize="14px" mt="10px" maxW="680px">
              Uma visão executiva com valores financeiros, atividades recentes e o fluxo operacional em andamento.
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="18px" mb="28px">
        <StatCard
          label="Pendentes"
          value={String(stats.pendentes)}
          helpText="Aguardando análise"
          icon={Clock}
          accentColor="#f7b733"
        />
        <StatCard
          label="Aprovadas"
          value={formatCurrency(stats.aprovadasMes)}
          helpText="Este mês"
          icon={CheckCircle}
          accentColor="var(--p-green)"
          convertedValues={convertValue(stats.aprovadasMes)}
        />
        <StatCard
          label="Total Pago"
          value={formatCurrency(stats.totalPago)}
          helpText="Creditado em conta"
          icon={DollarSign}
          accentColor="var(--p-blue)"
          convertedValues={convertValue(stats.totalPago)}
        />
        <StatCard
          label="Crescimento"
          value="—"
          helpText="Vs. mês anterior"
          icon={TrendingUp}
          accentColor="var(--p-accent)"
        />
      </SimpleGrid>

      {/* Activity Feed */}
      <Box
        bg="rgba(255,255,255,0.92)"
        borderRadius="18px"
        border="1px solid var(--s-border)"
        overflow="hidden"
        boxShadow="var(--shadow-md)"
      >
        <Flex px="24px" py="18px" borderBottom="1px solid var(--s-border)" justify="space-between" align="center" gap="12px" flexWrap="wrap">
          <Box>
            <Text fontWeight="800" fontSize="15px" color="var(--s-text)">Atividades Recentes</Text>
            <Text fontSize="12px" color="var(--s-muted)" mt="2px">Últimas movimentações do sistema</Text>
          </Box>
          <Badge variant="subtle" colorPalette="red" borderRadius="999px" px={3} py={1} fontSize="10px" fontWeight="700">
            Atualização contínua
          </Badge>
        </Flex>
        
        {recentActivities.length > 0 ? (
          <Stack gap={0} p="8px">
            {recentActivities.map((activity: any) => (
              <Box 
                key={activity.id} 
                px="16px" py="14px" 
                borderRadius="14px"
                borderBottom="1px solid var(--s-border)"
                _last={{ borderBottom: 'none' }}
                _hover={{ bg: 'rgba(200,16,46,0.04)' }}
                transition="background 0.18s ease"
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap={3}>
                    <Box p={2} bg="rgba(15,23,42,0.05)" borderRadius="10px">
                      <History size={16} color="var(--s-muted)" />
                    </Box>
                    <Box>
                      <Text fontSize="14px" fontWeight="600" color="var(--s-text)">
                        {activity.solicitacao.descricao}
                      </Text>
                      <Text fontSize="12px" color="var(--s-muted)">
                        {activity.usuario.nome} • {new Date(activity.criadoEm).toLocaleString('pt-BR')}
                      </Text>
                    </Box>
                  </Flex>
                  <Badge variant="solid" colorPalette={actionColorMap[activity.acao] || 'blue'} borderRadius="999px" px={2.5} py={1} fontSize="10px" fontWeight="700">
                    {activity.acao}
                  </Badge>
                </Flex>
              </Box>
            ))}
          </Stack>
        ) : (
          <Flex direction="column" align="center" justify="center" py="60px" px="24px">
            <Box
              w="52px" h="52px" borderRadius="14px"
              bg="rgba(15,23,42,0.04)"
              border="1px solid var(--s-border)"
              display="flex" alignItems="center" justifyContent="center"
              mb="14px"
            >
              <Clock size={22} color="var(--s-muted)" />
            </Box>
            <Text fontWeight="600" color="var(--s-text)" fontSize="14px" mb="4px">
              Nenhuma atividade recente
            </Text>
            <Text color="var(--s-muted)" fontSize="13px" textAlign="center" maxW="280px">
              Crie sua primeira solicitação de reembolso para ver o histórico aqui.
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};
