import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { 
  LayoutDashboard, Receipt, Tags, Users, LogOut, ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, type Perfil } from '../../contexts/AuthContext';

interface NavItemProps {
  icon: any;
  label: string;
  to: string;
  isActive?: boolean;
}

const NavItem = ({ icon: Icon, label, to, isActive }: NavItemProps) => (
  <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>
    <Flex
      align="center"
      px="14px"
      py="10px"
      gap="10px"
      borderRadius="10px"
      cursor="pointer"
      position="relative"
      bg={isActive ? 'rgba(200,16,46,0.15)' : 'transparent'}
      color={isActive ? '#fff' : 'var(--p-text-muted)'}
      fontWeight={isActive ? '600' : '400'}
      transition="all 0.18s"
      _hover={{ bg: 'rgba(255,255,255,0.06)', color: '#fff' }}
      style={{ fontSize: '14px', letterSpacing: '0.01em' }}
    >
      {isActive && (
        <Box
          position="absolute"
          left="0"
          top="50%"
          transform="translateY(-50%)"
          w="3px"
          h="60%"
          bg="var(--p-accent)"
          borderRadius="0 3px 3px 0"
        />
      )}
      <Box color={isActive ? 'var(--p-accent)' : 'inherit'} flexShrink={0}>
        <Icon size={17} />
      </Box>
      <Text flex={1}>{label}</Text>
      {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
    </Flex>
  </Link>
);

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard',     to: '/',               icon: LayoutDashboard, roles: ['ADMIN','GESTOR','FINANCEIRO','COLABORADOR'] },
    { label: 'Solicitações',  to: '/reimbursements', icon: Receipt,         roles: ['ADMIN','GESTOR','FINANCEIRO','COLABORADOR'] },
    { label: 'Categorias',    to: '/categories',     icon: Tags,            roles: ['ADMIN'] },
    { label: 'Usuários',      to: '/users',          icon: Users,           roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(i => user && i.roles.includes(user.perfil as Perfil));
  const initials = user?.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w="var(--sidebar-w)"
      bg="var(--p-graphite)"
      borderRight="1px solid"
      borderColor="var(--p-border)"
      display="flex"
      flexDirection="column"
      zIndex={100}
      style={{
        backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(200,16,46,0.08) 0%, transparent 60%)',
      }}
    >
      <Box px="20px" py="22px" borderBottom="1px solid" borderColor="var(--p-border)">
        <Flex align="center" gap="10px">
          <Box
            w="34px" h="34px"
            bg="var(--p-accent)"
            borderRadius="9px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            style={{ boxShadow: '0 6px 20px var(--p-accent-glow)' }}
          >
            <Text color="white" fontWeight="900" fontSize="14px" lineHeight={1}>P</Text>
          </Box>
          <Box>
            <Text color="white" fontWeight="700" fontSize="14px" letterSpacing="-0.02em" lineHeight={1}>
              Pitang Reimburse
            </Text>
            <Text color="var(--p-text-muted)" fontSize="11px" mt="2px">Sistema de Reembolsos</Text>
          </Box>
        </Flex>
      </Box>

      <Box flex={1} overflowY="auto" px="12px" py="16px">
        <Text
          color="var(--p-text-muted)"
          fontSize="10px"
          fontWeight="600"
          letterSpacing="0.08em"
          textTransform="uppercase"
          px="14px"
          mb="8px"
        >
          Menu
        </Text>
        <Stack gap="2px">
          {filteredItems.map(item => (
            <NavItem
              key={item.to}
              label={item.label}
              to={item.to}
              icon={item.icon}
              isActive={location.pathname === item.to}
            />
          ))}
        </Stack>
      </Box>

      <Box px="12px" py="16px" borderTop="1px solid" borderColor="var(--p-border)">
        <Flex
          align="center"
          gap="10px"
          px="10px"
          py="10px"
          borderRadius="10px"
          mb="8px"
          bg="rgba(255,255,255,0.04)"
        >
          <Box
            w="32px" h="32px" borderRadius="8px"
            bg="var(--p-accent)"
            display="flex" alignItems="center" justifyContent="center"
            flexShrink={0}
          >
            <Text color="white" fontSize="11px" fontWeight="700">{initials}</Text>
          </Box>
          <Box flex={1} overflow="hidden">
            <Text color="white" fontSize="12px" fontWeight="600" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.nome}
            </Text>
            <Text color="var(--p-text-muted)" fontSize="11px">{user?.perfil}</Text>
          </Box>
        </Flex>

        <Flex
          as="button"
          align="center"
          gap="8px"
          w="100%"
          px="14px"
          py="9px"
          borderRadius="9px"
          cursor="pointer"
          color="var(--p-text-muted)"
          transition="all 0.18s"
          onClick={logout}
          bg="transparent"
          border="none"
          _hover={{ bg: 'rgba(200,16,46,0.12)', color: '#ef4444' }}
          style={{ fontSize: '13px', fontWeight: '500' }}
        >
          <LogOut size={15} />
          Sair da conta
        </Flex>
      </Box>
    </Box>
  );
};
