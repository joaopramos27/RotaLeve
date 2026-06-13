import type { Client, ClientFormErrors, ClientFormValues } from './types';

export function createEmptyClientFormValues(): ClientFormValues {
  return {
    nome: '',
    telefone: '',
    cidade: '',
    endereco: '',
    regiaoId: '',
    novaRegiaoNome: '',
    observacoes: '',
    productIds: [],
  };
}

export function getBrazilianPhoneDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function formatBrazilianPhone(value: string) {
  const digits = getBrazilianPhoneDigits(value);

  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 4) {
    return `(${areaCode}) ${number}`;
  }

  if (digits.length <= 10) {
    return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }

  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

export function mapClientToFormValues(client: Client, productIds: string[]): ClientFormValues {
  return {
    nome: client.nome,
    telefone: formatBrazilianPhone(client.telefone ?? ''),
    cidade: client.cidade ?? '',
    endereco: client.endereco ?? '',
    regiaoId: client.regiao_id ?? '',
    novaRegiaoNome: '',
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
  const novaRegiaoNome = values.novaRegiaoNome.trim();
  const observacoes = values.observacoes.trim();
  const telefoneDigits = getBrazilianPhoneDigits(telefone);

  if (!nome) {
    errors.nome = 'Informe o nome do cliente.';
  } else if (nome.length < 2) {
    errors.nome = 'O nome precisa ter pelo menos 2 caracteres.';
  }

  if (telefone && ![10, 11].includes(telefoneDigits.length)) {
    errors.telefone = 'Informe DDD + telefone com 10 ou 11 digitos.';
  } else if (telefone.length > 30) {
    errors.telefone = 'O telefone deve ter no maximo 30 caracteres.';
  }

  if (cidade.length > 120) {
    errors.cidade = 'A cidade deve ter no maximo 120 caracteres.';
  }

  if (endereco.length > 240) {
    errors.endereco = 'O endereco deve ter no maximo 240 caracteres.';
  }

  if (novaRegiaoNome.length > 80) {
    errors.novaRegiaoNome = 'A nova regiao deve ter no maximo 80 caracteres.';
  }

  if (observacoes.length > 2000) {
    errors.observacoes = 'As observacoes devem ter no maximo 2000 caracteres.';
  }

  return errors;
}
