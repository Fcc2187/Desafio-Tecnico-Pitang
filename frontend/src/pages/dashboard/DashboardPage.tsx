import { Box, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ label, value, helpText }: { label: string, value: string, helpText: string }) => (
  <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
    <Text fontSize="sm" color="gray.500" fontWeight="medium">{label}</Text>
    <Heading size="lg" my={1}>{value}</Heading>
    <Text fontSize="xs" color="gray.400">{helpText}</Text>
  </Box>
);

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Heading mb={1}>Olá, {user?.nome} 👋</Heading>
      <Text color="gray.600" mb={8}>Bem-vindo ao seu painel de controle de reembolsos.</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
        <StatCard 
          label="Solicitações Pendentes" 
          value="0" 
          helpText="Aguardando análise" 
        />
        <StatCard 
          label="Total Aprovado" 
          value="R$ 0,00" 
          helpText="Neste mês" 
        />
        <StatCard 
          label="Total Pago" 
          value="R$ 0,00" 
          helpText="Creditado em conta" 
        />
      </SimpleGrid>
      
      <Box bg="white" p={6} borderRadius="lg" border="1px solid" borderColor="gray.200">
        <Heading size="md" mb={4}>Atividades Recentes</Heading>
        <Text color="gray.500">Nenhuma atividade recente para exibir.</Text>
      </Box>
    </Box>
  );
};
