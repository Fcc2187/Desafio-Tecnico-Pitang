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
import { Link as LinkIcon } from 'lucide-react';

const reimbursementSchema = z.object({
  descricao: z.string().min(5, 'Descrição muito curta'),
  valor: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser maior que zero'),
  dataDespesa: z.string().min(1, 'Data é obrigatória').refine(date => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(date) <= today;
  }, 'A data não pode ser no futuro'),
  categoriaId: z.string().min(1, 'Selecione uma categoria'),
  anexoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (Number(data.valor) > 1000 && !data.anexoUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Comprovante obrigatório para valores acima de R$ 1.000,00',
      path: ['anexoUrl'],
    });
  }
});

type ReimbursementFormValues = z.infer<typeof reimbursementSchema>;

interface ReimbursementFormProps {
  onClose: () => void;
  initialData?: any;
}

export const ReimbursementForm = ({ onClose, initialData }: ReimbursementFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  
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
    defaultValues: isEditing ? {
      descricao: initialData.descricao,
      valor: String(initialData.valor),
      dataDespesa: new Date(initialData.dataDespesa).toISOString().split('T')[0],
      categoriaId: initialData.categoriaId,
      anexoUrl: initialData.attachments?.[0]?.urlArquivo || '',
    } : undefined
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const attachments = data.anexoUrl ? [{
        nomeArquivo: 'Comprovante',
        urlArquivo: data.anexoUrl,
        tipoArquivo: 'image'
      }] : [];

      const payload = { 
        descricao: data.descricao,
        valor: Number(data.valor),
        dataDespesa: new Date(data.dataDespesa).toISOString(),
        categoriaId: data.categoriaId,
        attachments 
      };

      return isEditing 
        ? reimbursementService.update(initialData.id, payload)
        : reimbursementService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ['reimbursement', initialData.id] });
      onClose();
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
        <Heading fontSize="22px" fontWeight="800" color="#111">
          {isEditing ? 'Editar Solicitação' : 'Nova Solicitação'}
        </Heading>
        <Text color="var(--s-muted)" fontSize="14px">
          {isEditing ? 'Atualize os dados e o comprovante.' : 'Preencha os dados da despesa abaixo.'}
        </Text>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field label="Categoria" invalid={!!errors.categoriaId} errorText={errors.categoriaId?.message}>
            <select 
              {...register('categoriaId')} 
              style={{ 
                width: '100%', padding: '10px', borderRadius: '10px', 
                border: '1.5px solid var(--s-border)', outline: 'none', background: 'white'
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
              style={{ borderRadius: '10px', border: '1.5px solid var(--s-border)', background: 'white' }}
            />
          </Field>

          <Flex gap={4}>
            <Box flex={1}>
              <Field label="Valor (R$)" invalid={!!errors.valor} errorText={errors.valor?.message}>
                <Input 
                  type="number" step="0.01" {...register('valor')} placeholder="0,00" 
                  style={{ borderRadius: '10px', border: '1.5px solid var(--s-border)', background: 'white' }}
                />
              </Field>
            </Box>
            <Box flex={1}>
              <Field label="Data da Despesa" invalid={!!errors.dataDespesa} errorText={errors.dataDespesa?.message}>
                <Input 
                  type="date" {...register('dataDespesa')} 
                  style={{ borderRadius: '10px', border: '1.5px solid var(--s-border)', background: 'white' }}
                />
              </Field>
            </Box>
          </Flex>

          <Field 
            label="Link do Comprovante (Opcional)" 
            invalid={!!errors.anexoUrl} 
            errorText={errors.anexoUrl?.message}
            helperText="Cole aqui a URL da imagem ou PDF do recibo."
          >
            <Flex align="center" gap={2}>
               <Box p={2} bg="gray.100" borderRadius="8px"><LinkIcon size={16} /></Box>
               <Input 
                 {...register('anexoUrl')} 
                 placeholder="https://..." 
                 style={{ borderRadius: '10px', border: '1.5px solid var(--s-border)', background: 'white' }}
               />
            </Flex>
          </Field>

          <Flex gap={3} pt={4}>
            <Button variant="ghost" onClick={onClose} flex={1}>Cancelar</Button>
            <Button 
              bg="var(--p-accent)" 
              color="white" 
              type="submit" 
              flex={2}
              loading={mutation.isPending}
              style={{ borderRadius: '10px', fontWeight: '600', boxShadow: '0 4px 14px var(--p-accent-glow)' }}
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Rascunho'}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
