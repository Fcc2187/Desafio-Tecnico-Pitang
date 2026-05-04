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
import { FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import { showErrorAlert, showSuccessAlert } from '../../components/ui/alerts';

const reimbursementSchema = z.object({
  descricao: z.string().min(5, 'Descrição muito curta'),
  valor: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser maior que zero'),
  dataDespesa: z.string().min(1, 'Data é obrigatória').refine(date => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(date) <= today;
  }, 'A data não pode ser no futuro'),
  categoriaId: z.string().min(1, 'Selecione uma categoria'),
});

type ReimbursementFormValues = z.infer<typeof reimbursementSchema>;

interface ReimbursementFormProps {
  onClose: () => void;
  initialData?: any;
}

export const ReimbursementForm = ({ onClose, initialData }: ReimbursementFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: reimbursementService.listCategories,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReimbursementFormValues>({
    resolver: zodResolver(reimbursementSchema),
    defaultValues: isEditing ? {
      descricao: initialData.descricao,
      valor: String(initialData.valor),
      dataDespesa: new Date(initialData.dataDespesa).toISOString().split('T')[0],
      categoriaId: initialData.categoriaId,
    } : undefined
  });

  const currentValor = watch('valor');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // 1. Validar anexo se valor > 1000
      if (Number(data.valor) > 1000 && !selectedFile && !initialData?.attachments?.length) {
        throw new Error('Comprovante obrigatório para valores acima de R$ 1.000,00');
      }

      const payload = { 
        descricao: data.descricao,
        valor: Number(data.valor),
        dataDespesa: new Date(data.dataDespesa).toISOString(),
        categoriaId: data.categoriaId,
      };

      const reimbursement = isEditing 
        ? await reimbursementService.update(initialData.id, payload)
        : await reimbursementService.create(payload);
      
      if (selectedFile) {
        await reimbursementService.uploadAttachment(reimbursement.id, selectedFile);
      }

      return reimbursement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ['reimbursement', initialData.id] });
      showSuccessAlert(
        isEditing ? 'Solicitação atualizada' : 'Solicitação criada',
        isEditing ? 'As alterações foram salvas com sucesso.' : 'O rascunho foi salvo com sucesso.'
      );
      onClose();
    },
    onError: (error: any) => {
      showErrorAlert('Erro ao salvar solicitação', error.message || error.response?.data?.message || 'Tente novamente em instantes.');
    }
  });

  const onSubmit = (data: ReimbursementFormValues) => {
    mutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setFileError('Arquivo muito grande (máx 5MB)');
        return;
      }
      setSelectedFile(file);
      setFileError(null);
    }
  };

  return (
    <Stack gap={6}>
      <Box>
        <Heading fontSize="22px" fontWeight="800" color="#111">
          {isEditing ? 'Editar Solicitação' : 'Nova Solicitação'}
        </Heading>
        <Text color="var(--s-muted)" fontSize="14px">
          Preencha os dados e anexe o comprovante original.
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
            label={Number(currentValor) > 1000 ? "Comprovante (Obrigatório)" : "Comprovante (Opcional)"}
            invalid={!!fileError} 
            errorText={fileError || ''}
            helperText="Selecione uma imagem ou PDF do recibo."
          >
            <Box 
              position="relative" 
              p={4} border="2px dashed" borderColor={fileError ? "red.300" : "var(--s-border)"} 
              borderRadius="12px" bg="gray.50" _hover={{ bg: "gray.100" }} transition="all 0.2s"
            >
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*,application/pdf"
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
              <Flex direction="column" align="center" gap={2}>
                {selectedFile ? (
                   <>
                     <FileText size={24} color="var(--p-accent)" />
                     <Text fontSize="13px" fontWeight="600" color="#111">{selectedFile.name}</Text>
                     <Text fontSize="11px" color="gray.500">Clique para trocar o arquivo</Text>
                   </>
                ) : (
                  <>
                    <Upload size={24} color="gray.400" />
                    <Text fontSize="13px" fontWeight="600" color="gray.600">Clique para selecionar</Text>
                    <Text fontSize="11px" color="gray.500">PDF, PNG ou JPG (máx. 5MB)</Text>
                  </>
                )}
              </Flex>
            </Box>
          </Field>

          {isEditing && initialData.attachments?.length > 0 && !selectedFile && (
            <Text fontSize="11px" color="blue.600" fontWeight="600">
              ✓ Já existe um comprovante anexado. Selecione um novo apenas se quiser substituir.
            </Text>
          )}

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
