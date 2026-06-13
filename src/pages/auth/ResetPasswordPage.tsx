import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Notice } from '../../components/Notice';
import { useAuth } from '../../auth/AuthContext';
import { supabase } from '../../lib/supabase/client';
import { getAuthErrorMessage } from '../../lib/supabase/errors';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setError('');
      return;
    }

    if (!user) {
      setError('Abra o link enviado por e-mail para autenticar a sessão de recuperação.');
    }
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Senha atualizada com sucesso. Você será redirecionado para o dashboard.');
      await supabase.auth.refreshSession();
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
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
        title="Redefinir senha"
        description="Escolha uma nova senha para retomar o acesso ao RotaLeve."
        footer={
          <span>
            <Link to="/auth/login" className="font-semibold text-brand-300 hover:text-brand-200">
              Ir para o login
            </Link>
          </span>
        }
      >
        {error ? <Notice tone="danger">{error}</Notice> : null}
        {success ? <Notice tone="success">{success}</Notice> : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite a nova senha"
            minLength={8}
            required
          />

          <Input
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repita a nova senha"
            minLength={8}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Atualizando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </AuthCard>
    </main>
  );
}
