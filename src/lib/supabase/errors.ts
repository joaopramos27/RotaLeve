export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}
