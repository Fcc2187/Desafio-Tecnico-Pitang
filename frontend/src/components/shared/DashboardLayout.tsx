import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  return (
    <Flex minH="100vh" bg="var(--s-bg)">
      <Sidebar />
      <Box 
        ml="var(--sidebar-w)"
        flex={1} 
        p="32px 36px"
        overflowY="auto"
        minH="100vh"
      >
        <Outlet />
      </Box>
    </Flex>
  );
};
