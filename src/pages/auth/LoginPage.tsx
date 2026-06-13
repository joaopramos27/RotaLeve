import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import { supabase } from '../../lib/supabase/client';
import { getAuthErrorMessage } from '../../lib/supabase/errors';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      const state = location.state as { from?: { pathname?: string } } | null;
      const from = state?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
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
        title="Entrar no RotaLeve"
        description="Acesse sua conta para gerenciar clientes, produtos, vendas e rotas em poucos toques."
        footer={
          <span>
            Não tem conta?{' '}
            <Link to="/auth/register" className="font-semibold text-brand-300 hover:text-brand-200">
              Criar cadastro
            </Link>
          </span>
        }
      >
        {error ? <Notice tone="danger">{error}</Notice> : null}

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

          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sua senha"
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <Link to="/auth/forgot-password" className="font-medium text-slate-300 hover:text-white">
            Esqueci minha senha
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}
