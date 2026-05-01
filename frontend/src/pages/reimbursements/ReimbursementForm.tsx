import { 
  Box, 
  Stack, 
  Input, 
  Textarea, 
  Heading, 
  Text, 
  Flex
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import * as reimbursementService from '../../services/reimbursements.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const reimbursementSchema = z.object({
  descricao: z.string().min(5, 'Descrição muito curta'),
  valor: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser maior que zero'),
  dataDespesa: z.string().min(1, 'Data é obrigatória'),
  categoriaId: z.string().min(1, 'Selecione uma categoria'),
});

type ReimbursementFormValues = z.infer<typeof reimbursementSchema>;

interface ReimbursementFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ReimbursementForm = ({ onClose, onSuccess }: ReimbursementFormProps) => {
  const queryClient = useQueryClient();
  
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: reimbursementService.listCategories,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReimbursementFormValues>({
    resolver: zodResolver(reimbursementSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => reimbursementService.create({
      ...data,
      valor: Number(data.valor)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      onSuccess();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Erro ao salvar');
    }
  });

  const onSubmit = (data: ReimbursementFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="md">Nova Solicitação</Heading>
        <Text color="gray.600" fontSize="sm">Preencha os dados da despesa abaixo.</Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field label="Categoria" invalid={!!errors.categoriaId} errorText={errors.categoriaId?.message}>
            <select 
              {...register('categoriaId')} 
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '6px', 
                border: '1px solid #E2E8F0',
                outline: 'none'
              }}
            >
              <option value="">Selecione...</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </Field>

          <Field label="Descrição" invalid={!!errors.descricao} errorText={errors.descricao?.message}>
            <Textarea 
              {...register('descricao')} 
              placeholder="Ex: Almoço com cliente" 
              rows={3}
            />
          </Field>

          <Flex gap={4}>
            <Box flex={1}>
              <Field label="Valor (R$)" invalid={!!errors.valor} errorText={errors.valor?.message}>
                <Input type="number" step="0.01" {...register('valor')} placeholder="0,00" />
              </Field>
            </Box>
            <Box flex={1}>
              <Field label="Data da Despesa" invalid={!!errors.dataDespesa} errorText={errors.dataDespesa?.message}>
                <Input type="date" {...register('dataDespesa')} />
              </Field>
            </Box>
          </Flex>

          <Flex gap={3} pt={4}>
            <Button variant="ghost" onClick={onClose} flex={1}>Cancelar</Button>
            <Button 
              bg="teal.500" 
              color="white" 
              _hover={{ bg: 'teal.600' }} 
              type="submit" 
              flex={2}
              loading={mutation.isPending}
            >
              Salvar Rascunho
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
