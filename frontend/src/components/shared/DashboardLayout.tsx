import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  return (
    <Flex minH="100vh" bg="var(--app-bg)" direction={{ base: 'column', lg: 'row' }}>
      <Sidebar />
      <Box 
        ml={{ base: 0, lg: 'var(--sidebar-w)' }}
        flex={1} 
        p={{ base: '18px', md: '24px', xl: '36px 40px' }}
        overflowY="auto"
        minH="100vh"
        position="relative"
        overflowX="hidden"
      >
        <Box
          maxW="1440px"
          mx="auto"
          w="100%"
          minH={{ base: 'calc(100vh - 24px)', lg: 'calc(100vh - 72px)' }}
          position="relative"
          zIndex={1}
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};
