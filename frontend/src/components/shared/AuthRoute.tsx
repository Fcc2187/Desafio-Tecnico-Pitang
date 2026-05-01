import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Perfil } from '../../contexts/AuthContext';
import { Spinner, Center } from '@chakra-ui/react';

interface AuthRouteProps {
  allowedRoles?: Perfil[];
}

export const AuthRoute = ({ allowedRoles }: AuthRouteProps) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.perfil)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
