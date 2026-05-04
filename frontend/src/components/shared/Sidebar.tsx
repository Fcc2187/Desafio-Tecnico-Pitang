import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { ChevronRight, LayoutDashboard, LogOut, Receipt, Tags, Users, type LucideIcon } from 'lucide-react';
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
      py="11px"
      gap="12px"
      borderRadius="14px"
      cursor="pointer"
      position="relative"
      bg={isActive ? 'rgba(200,16,46,0.16)' : 'transparent'}
      color={isActive ? '#ffffff' : 'var(--p-text-muted)'}
      fontWeight={isActive ? '700' : '500'}
      transition="transform 0.18s ease, background 0.18s ease, color 0.18s ease"
      _hover={{
        bg: isActive ? 'rgba(200,16,46,0.18)' : 'rgba(255,255,255,0.06)',
        color: '#ffffff',
        transform: 'translateX(2px)',
      }}
      style={{ fontSize: '14px', letterSpacing: '0.01em' }}
    >
      {isActive && (
        <Box
          position="absolute"
          left="0"
          top="50%"
          transform="translateY(-50%)"
          w="3px"
          h="62%"
          bg="var(--p-accent)"
          borderRadius="0 3px 3px 0"
        />
      )}
      <Box
        color={isActive ? 'var(--p-accent)' : 'inherit'}
        flexShrink={0}
        w="28px"
        h="28px"
        borderRadius="10px"
        display="grid"
        placeItems="center"
        bg={isActive ? 'rgba(200,16,46,0.1)' : 'rgba(255,255,255,0.03)'}
      >
        <Icon size={16} />
      </Box>
      <Text flex={1}>{label}</Text>
      {isActive && <ChevronRight size={14} style={{ opacity: 0.72 }} />}
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

  const filteredItems = menuItems.filter((item) => user && item.roles.includes(user.perfil as Perfil));
  const initials = user?.nome?.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <Box
      as="nav"
      position={{ base: 'sticky', lg: 'fixed' }}
      left={0}
      top={0}
      w={{ base: '100%', lg: 'var(--sidebar-w)' }}
      h={{ base: 'auto', lg: '100vh' }}
      bg="linear-gradient(180deg, #101523 0%, #111827 48%, #0b1020 100%)"
      bgColor="#101523"
      borderRight={{ base: 'none', lg: '1px solid' }}
      borderBottom={{ base: '1px solid', lg: 'none' }}
      borderColor="rgba(255,255,255,0.05)"
      display="flex"
      flexDirection="column"
      zIndex={100}
      style={{
        boxShadow: '18px 0 52px rgba(15, 23, 42, 0.2)',
        backgroundImage:
          'radial-gradient(ellipse at 20% 0%, rgba(200,16,46,0.1) 0%, transparent 58%), radial-gradient(ellipse at 100% 8%, rgba(255,255,255,0.03) 0%, transparent 32%)',
        backgroundColor: '#101523',
      }}
    >
      <Box px="16px" py="16px" borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)">
        <Flex align={{ base: 'flex-start', sm: 'center' }} justify="space-between" gap="10px" direction={{ base: 'column', sm: 'row' }}>
          <Flex align="center" gap="10px" minW={0}>
            <Box
              w="38px"
              h="38px"
              bg="var(--p-accent)"
              borderRadius="12px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              style={{ boxShadow: '0 10px 24px var(--p-accent-glow)' }}
            >
              <Text color="white" fontWeight="900" fontSize="15px" lineHeight={1}>
                P
              </Text>
            </Box>
            <Box minW={0}>
              <Text color="white" fontWeight="800" fontSize="15px" letterSpacing="-0.03em" lineHeight={1}>
                Pitang Reimburse
              </Text>
              <Text color="var(--p-text-muted)" fontSize="11px" mt="3px">
                Sistema de Reembolsos
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Box>

      <Box flex={1} overflowX={{ base: 'auto', lg: 'hidden' }} overflowY="auto" px="12px" py="16px">
        <Text
          color="#b6c0de"
          fontSize="10px"
          fontWeight="600"
          letterSpacing="0.08em"
          textTransform="uppercase"
          px="14px"
          mb="8px"
          display={{ base: 'none', md: 'block' }}
        >
          Menu
        </Text>
        <Stack gap="2px" direction={{ base: 'row', lg: 'column' }} minW={{ base: 'max-content', lg: 'auto' }}>
          {filteredItems.map((item) => (
            <Box key={item.to} minW={{ base: '150px', lg: 'auto' }}>
              <NavItem label={item.label} to={item.to} icon={item.icon} isActive={location.pathname === item.to} />
            </Box>
          ))}
        </Stack>
      </Box>

      <Box px="12px" py="16px" borderTop="1px solid" borderColor="rgba(255,255,255,0.06)" display={{ base: 'none', md: 'block' }}>
        <Flex
          align="center"
          gap="10px"
          px="12px"
          py="12px"
          borderRadius="16px"
          mb="10px"
          bg="rgba(255,255,255,0.04)"
          border="1px solid rgba(255,255,255,0.06)"
        >
          <Box
            w="34px"
            h="34px"
            borderRadius="10px"
            bg="var(--p-accent)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            style={{ boxShadow: '0 8px 18px rgba(200,16,46,0.22)' }}
          >
            <Text color="white" fontSize="11px" fontWeight="800">
              {initials}
            </Text>
          </Box>
          <Box flex={1} overflow="hidden">
            <Text
              color="white"
              fontSize="12px"
              fontWeight="700"
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {user?.nome}
            </Text>
            <Text color="var(--p-text-muted)" fontSize="11px">
              {user?.perfil}
            </Text>
          </Box>
        </Flex>

        <Flex
          as="button"
          align="center"
          gap="8px"
          w="100%"
          px="14px"
          py="10px"
          borderRadius="12px"
          cursor="pointer"
          color="var(--p-text-muted)"
          transition="all 0.18s"
          onClick={logout}
          bg="rgba(255,255,255,0.025)"
          border="1px solid rgba(255,255,255,0.05)"
          _hover={{ bg: 'rgba(200,16,46,0.14)', color: '#ffffff', borderColor: 'rgba(200,16,46,0.22)' }}
          style={{ fontSize: '13px', fontWeight: '600' }}
        >
          <LogOut size={15} />
          Sair da conta
        </Flex>
      </Box>
    </Box>
  );
};
