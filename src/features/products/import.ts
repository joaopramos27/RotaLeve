import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ProductImportPreviewRow, ProductImportRow } from './types';

type RawImportRow = Record<string, unknown>;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function parsePriceValue(value: unknown) {
  const text = toText(value);
  if (!text) {
    return Number.NaN;
  }

  const normalized = text.replace(/\./g, '').replace(',', '.');
  return Number(normalized);
}

function normalizeRow(raw: RawImportRow): ProductImportRow {
  return {
    nome: toText(raw.nome),
    descricao: toText(raw.descricao),
    preco: toText(raw.preco),
  };
}

function validateRow(row: ProductImportRow, rowNumber: number): ProductImportPreviewRow {
  const errors: string[] = [];

  if (!row.nome) {
    errors.push('Nome obrigatorio.');
  } else if (row.nome.length < 2) {
    errors.push('Nome precisa ter pelo menos 2 caracteres.');
  }

  if (row.descricao.length > 1000) {
    errors.push('Descricao deve ter no maximo 1000 caracteres.');
  }

  const price = parsePriceValue(row.preco);
  if (!row.preco) {
    errors.push('Preco obrigatorio.');
  } else if (Number.isNaN(price) || price < 0) {
    errors.push('Preco invalido.');
  }

  return {
    rowNumber,
    row,
    price,
    valid: errors.length === 0,
    errors,
  };
}

function readCsvRows(file: File) {
  return new Promise<RawImportRow[]>((resolve, reject) => {
    Papa.parse<RawImportRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: normalizeHeader,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(result.errors[0]?.message ?? 'Falha ao ler o CSV.'));
          return;
        }

        resolve((result.data ?? []).filter((row) => Object.keys(row).length > 0));
      },
      error: (error) => reject(error),
    });
  });
}

async function readXlsxRows(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('A planilha esta vazia.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    defval: '',
    raw: false,
    header: 1,
  });

  if (rows.length === 0) {
    return [];
  }

  const [headers, ...dataRows] = rows as [unknown[], ...unknown[][]];
  const normalizedHeaders = headers.map((header) => normalizeHeader(String(header)));

  return dataRows
    .filter((row) => row.some((value) => toText(value) !== ''))
    .map((row) => {
      const mapped: RawImportRow = {};

      normalizedHeaders.forEach((header, index) => {
        mapped[header] = row[index] ?? '';
      });

      return mapped;
    });
}

export async function parseProductImportFile(file: File) {
  const lowerName = file.name.toLowerCase();
  let rawRows: RawImportRow[] = [];

  if (lowerName.endsWith('.csv')) {
    rawRows = await readCsvRows(file);
  } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    rawRows = await readXlsxRows(file);
  } else {
    throw new Error('Envie um arquivo CSV ou XLSX.');
  }

  const rows = rawRows.map((rawRow, index) => validateRow(normalizeRow(rawRow), index + 1));

  return {
    fileName: file.name,
    totalRows: rows.length,
    validRows: rows.filter((row) => row.valid),
    invalidRows: rows.filter((row) => !row.valid),
    rows,
  };
}
