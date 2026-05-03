import { Box, Flex, Heading, Text, SimpleGrid, Spinner, Center, Badge, Stack } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle, DollarSign, TrendingUp, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as reimbursementService from '../../services/reimbursements.service';

interface StatCardProps {
  label: string;
  value: string;
  helpText: string;
  icon: any;
  accentColor: string;
}

const StatCard = ({ label, value, helpText, icon: Icon, accentColor }: StatCardProps) => (
  <Box
    bg="var(--s-card)"
    p="24px"
    borderRadius="14px"
    border="1px solid var(--s-border)"
    position="relative"
    overflow="hidden"
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    transition="all 0.2s"
    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
  >
    <Box
      position="absolute" top={0} left={0}
      w="4px" h="100%" bg={accentColor}
      borderRadius="4px 0 0 4px"
    />
    <Flex justify="space-between" align="flex-start" mb="16px">
      <Box>
        <Text fontSize="12px" fontWeight="600" color="var(--s-muted)" letterSpacing="0.04em" textTransform="uppercase" mb="6px">
          {label}
        </Text>
        <Text fontSize="28px" fontWeight="800" letterSpacing="-0.03em" color="var(--s-text)" lineHeight={1}>
          {value}
        </Text>
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

  const { stats, recentActivities } = data || { stats: { pendentes: 0, aprovadasMes: 0, totalPago: 0 }, recentActivities: [] };

  return (
    <Box>
      {/* Page Header */}
      <Box
        mb="32px"
        pb="24px"
        borderBottom="1px solid var(--s-border)"
      >
        <Flex justify="space-between" align="flex-end">
          <Box>
            <Text fontSize="12px" fontWeight="600" color="var(--p-accent)" letterSpacing="0.06em" textTransform="uppercase" mb="6px">
              Dashboard
            </Text>
            <Heading
              fontSize="26px"
              fontWeight="800"
              letterSpacing="-0.03em"
              color="var(--s-text)"
            >
              Olá, {user?.nome?.split(' ')[0]} 👋
            </Heading>
            <Text color="var(--s-muted)" fontSize="14px" mt="4px">
              Acompanhe o status das suas solicitações de reembolso.
            </Text>
          </Box>
          <Box
            px="14px" py="8px"
            borderRadius="99px"
            bg="var(--s-card)"
            border="1px solid var(--s-border)"
            display="flex"
            alignItems="center"
            gap="6px"
          >
            <Box w="7px" h="7px" borderRadius="full" bg="var(--p-green)" />
            <Text fontSize="12px" color="var(--s-muted)">Sistema Online</Text>
          </Box>
        </Flex>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="16px" mb="28px">
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
        />
        <StatCard
          label="Total Pago"
          value={formatCurrency(stats.totalPago)}
          helpText="Creditado em conta"
          icon={DollarSign}
          accentColor="var(--p-blue)"
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
        bg="var(--s-card)"
        borderRadius="14px"
        border="1px solid var(--s-border)"
        overflow="hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <Box px="24px" py="18px" borderBottom="1px solid var(--s-border)">
          <Text fontWeight="700" fontSize="15px" color="var(--s-text)">Atividades Recentes</Text>
        </Box>
        
        {recentActivities.length > 0 ? (
          <Stack gap={0}>
            {recentActivities.map((activity: any) => (
              <Box 
                key={activity.id} 
                px="24px" py="16px" 
                borderBottom="1px solid var(--s-border)"
                _last={{ borderBottom: 'none' }}
                _hover={{ bg: 'gray.50' }}
                transition="background 0.2s"
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap={3}>
                    <Box p={2} bg="gray.100" borderRadius="8px">
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
                  <Badge variant="subtle" colorPalette="blue" fontSize="10px">
                    {activity.acao}
                  </Badge>
                </Flex>
              </Box>
            ))}
          </Stack>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="60px"
            px="24px"
          >
            <Box
              w="52px" h="52px" borderRadius="14px"
              bg="var(--s-bg)"
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
