import { 
  Box, 
  Flex, 
  Stack, 
  Text, 
  VStack,
  Button as ChakraButton
} from '@chakra-ui/react';
import { 
  LayoutDashboard, 
  Receipt, 
  Tags, 
  Users, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, type Perfil } from '../../contexts/AuthContext';

interface NavItemProps {
  icon: any;
  label: string;
  to: string;
  isActive?: boolean;
}

const NavItem = ({ icon: IconComponent, label, to, isActive }: NavItemProps) => (
  <Link to={to} style={{ width: '100%' }}>
    <Flex
      align="center"
      px={4}
      py={3}
      cursor="pointer"
      bg={isActive ? 'teal.50' : 'transparent'}
      color={isActive ? 'teal.600' : 'gray.600'}
      _hover={{
        bg: 'teal.50',
        color: 'teal.600',
      }}
      transition="all 0.2s"
      borderRadius="md"
      role="group"
    >
      <IconComponent size={20} style={{ marginRight: '12px' }} />
      <Text fontWeight={isActive ? 'bold' : 'medium'}>{label}</Text>
      {isActive && <Box ml="auto"><ChevronRight size={16} /></Box>}
    </Flex>
  </Link>
);

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['ADMIN', 'GESTOR', 'FINANCEIRO', 'COLABORADOR'] },
    { label: 'Solicitações', to: '/reimbursements', icon: Receipt, roles: ['ADMIN', 'GESTOR', 'FINANCEIRO', 'COLABORADOR'] },
    { label: 'Categorias', to: '/categories', icon: Tags, roles: ['ADMIN'] },
    { label: 'Usuários', to: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.perfil as Perfil)
  );

  return (
    <Box
      as="nav"
      pos="fixed"
      left="0"
      h="100vh"
      w="280px"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      py={8}
      px={4}
    >
      <VStack h="full" align="stretch" gap={8}>
        <Box px={4} mb={4}>
          <Heading size="md" color="teal.600">Pitang Reimburse</Heading>
        </Box>

        <Stack gap={2} flex={1}>
          {filteredItems.map((item) => (
            <NavItem
              key={item.to}
              label={item.label}
              to={item.to}
              icon={item.icon}
              isActive={location.pathname === item.to}
            />
          ))}
        </Stack>

        <Box borderTop="1px solid" borderColor="gray.200" pt={6} px={2}>
          <Flex align="center" mb={4}>
            <Box ml={2}>
              <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{user?.nome}</Text>
              <Text fontSize="xs" color="gray.500">{user?.perfil}</Text>
            </Box>
          </Flex>
          <ChakraButton
            variant="ghost"
            colorScheme="red"
            w="full"
            justifyContent="start"
            onClick={logout}
            leftIcon={<LogOut size={18} />}
          >
            Sair
          </ChakraButton>
        </Box>
      </VStack>
    </Box>
  );
};

// Precisamos do Heading que esqueci no import acima
import { Heading } from '@chakra-ui/react';
