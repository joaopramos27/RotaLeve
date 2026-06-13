import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import { supabase } from '../../lib/supabase/client';
import { getAuthErrorMessage } from '../../lib/supabase/errors';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess('Enviamos um link de recuperação para o seu e-mail.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />

      <AuthCard
        title="Recuperar senha"
        description="Informe seu e-mail para receber o link seguro de redefinição de acesso."
        footer={
          <span>
            Lembrou a senha?{' '}
            <Link to="/auth/login" className="font-semibold text-brand-300 hover:text-brand-200">
              Voltar ao login
            </Link>
          </span>
        }
      >
        {error ? <Notice tone="danger">{error}</Notice> : null}
        {success ? <Notice tone="success">{success}</Notice> : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@empresa.com"
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
        </form>
      </AuthCard>
    </main>
  );
}
