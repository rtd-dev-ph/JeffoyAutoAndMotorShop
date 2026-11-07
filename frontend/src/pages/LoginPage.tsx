import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { DEMO_MODE } from '@/lib/config';

export function LoginPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth!.login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Login</h2>
        {DEMO_MODE && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
            <p className="font-medium">Demo mode (no backend)</p>
            <p className="mt-1">Owner: <code>admin</code> / <code>Admin123!</code></p>
            <p>Cashier: <code>jeffoy</code> / <code>Jeffoy123!</code></p>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm font-medium">Username</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
