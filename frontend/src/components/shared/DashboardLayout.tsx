import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  return (
    <Flex h="100vh" bg="gray.50">
      <Sidebar />
      <Box 
        ml="280px" 
        flex={1} 
        p={8} 
        overflowY="auto"
      >
        <Outlet />
      </Box>
    </Flex>
  );
};
