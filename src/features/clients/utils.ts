import type { Client, ClientFormErrors, ClientFormValues } from './types';

export function createEmptyClientFormValues(): ClientFormValues {
  return {
    nome: '',
    telefone: '',
    cidade: '',
    endereco: '',
    regiaoId: '',
    observacoes: '',
    productIds: [],
  };
}

export function mapClientToFormValues(client: Client, productIds: string[]): ClientFormValues {
  return {
    nome: client.nome,
    telefone: client.telefone ?? '',
    cidade: client.cidade ?? '',
    endereco: client.endereco ?? '',
    regiaoId: client.regiao_id ?? '',
    observacoes: client.observacoes ?? '',
    productIds,
  };
}

export function validateClientForm(values: ClientFormValues): ClientFormErrors {
  const errors: ClientFormErrors = {};

  const nome = values.nome.trim();
  const telefone = values.telefone.trim();
  const cidade = values.cidade.trim();
  const endereco = values.endereco.trim();
  const observacoes = values.observacoes.trim();

  if (!nome) {
    errors.nome = 'Informe o nome do cliente.';
  } else if (nome.length < 2) {
    errors.nome = 'O nome precisa ter pelo menos 2 caracteres.';
  }

  if (telefone.length > 30) {
    errors.telefone = 'O telefone deve ter no maximo 30 caracteres.';
  }

  if (cidade.length > 120) {
    errors.cidade = 'A cidade deve ter no maximo 120 caracteres.';
  }

  if (endereco.length > 240) {
    errors.endereco = 'O endereco deve ter no maximo 240 caracteres.';
  }

  if (observacoes.length > 2000) {
    errors.observacoes = 'As observacoes devem ter no maximo 2000 caracteres.';
  }

  return errors;
}
