import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import { supabase } from '../../lib/supabase/client';
import { getAuthErrorMessage } from '../../lib/supabase/errors';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setSuccess('Cadastro realizado. Verifique seu e-mail para confirmar o acesso.');
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
        title="Criar conta"
        description="Cadastre-se para começar a organizar sua rotina comercial com segurança e rapidez."
        footer={
          <span>
            Já tem conta?{' '}
            <Link to="/auth/login" className="font-semibold text-brand-700 hover:text-brand-600">
              Fazer login
            </Link>
          </span>
        }
      >
        {error ? <Notice tone="danger">{error}</Notice> : null}
        {success ? <Notice tone="success">{success}</Notice> : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nome"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            required
          />

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo recomendado: 8 caracteres"
            minLength={8}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      </AuthCard>
    </main>
  );
}
