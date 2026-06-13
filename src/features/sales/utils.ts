import type { Sale, SaleFormErrors, SaleFormValues } from './types';

export function createEmptySaleFormValues(): SaleFormValues {
  const today = new Date();
  const isoDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return {
    clienteId: '',
    valor: '',
    dataVenda: isoDate,
    proximaVisita: '',
  };
}

export function mapSaleToFormValues(sale: Sale): SaleFormValues {
  return {
    clienteId: sale.cliente_id,
    valor: String(sale.valor),
    dataVenda: sale.data_venda,
    proximaVisita: sale.proxima_visita ?? '',
  };
}

export function validateSaleForm(values: SaleFormValues): SaleFormErrors {
  const errors: SaleFormErrors = {};
  const valor = Number(values.valor.replace(/\./g, '').replace(',', '.'));

  if (!values.clienteId) {
    errors.clienteId = 'Selecione um cliente.';
  }

  if (!values.dataVenda) {
    errors.dataVenda = 'Informe a data da venda.';
  }

  if (!values.valor.trim()) {
    errors.valor = 'Informe o valor vendido.';
  } else if (Number.isNaN(valor) || valor < 0) {
    errors.valor = 'Informe um valor valido.';
  }

  if (values.proximaVisita && Number.isNaN(new Date(values.proximaVisita).getTime())) {
    errors.proximaVisita = 'Informe uma data valida para a proxima visita.';
  }

  return errors;
}

export function parseSaleValue(value: string) {
  return Number(value.replace(/\./g, '').replace(',', '.'));
}

export function formatSaleDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
