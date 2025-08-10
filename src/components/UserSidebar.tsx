'use client';

import { useMemo, useState } from 'react';
import { 
  Crown,
  Shield,
  User,
  MoreVertical
} from 'lucide-react';
import { useVoiceStore } from '@/store/voiceStore';
import { useSupabaseAuth } from '@/lib/useAuth';

export default function UserSidebar() {
  const { users } = useVoiceStore();
  const onlineUsers = useMemo(() => users.filter(u => u.status !== 'offline'), [users]);

  // Auth
  const { user, loading, signIn, signUp, signOut } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setAuthError(null);
    const { data, error } = await signIn(email, password);
    if (error) setAuthError(error.message || 'Sign in failed');
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setAuthError(null);
    const { data, error } = await signUp(email, password);
    if (error) setAuthError(error.message || 'Sign up failed');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={12} className="text-discord-yellow" />;
      case 'moderator':
        return <Shield size={12} className="text-discord-green" />;
      default:
        return <User size={12} className="text-discord-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-discord-green';
      case 'idle':
        return 'bg-discord-yellow';
      case 'dnd':
        return 'bg-discord-red';
      default:
        return 'bg-discord-text-muted';
    }
  };

  return (
    <div className="w-60 bg-discord-darker flex flex-col px-6 user-panel">
      {/* Top: Auth area */}
      <div className="pt-4 pb-3">
        {loading ? (
          <div className="text-discord-text-muted text-sm">Checking auth...</div>
        ) : user ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-discord-accent flex items-center justify-center text-white text-sm font-semibold">
              {user.user_metadata?.full_name ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('') : (user.email || '').slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-discord-text text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</div>
              <div className="text-discord-text-muted text-xs">Signed in</div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm px-2 py-1 bg-transparent border border-discord-border rounded text-discord-text-muted hover:text-discord-text"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={isSigningUp ? handleSignUp : handleSignIn} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-discord-darkest text-discord-text text-sm px-3 py-2 rounded border-none focus:outline-none"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-discord-darkest text-discord-text text-sm px-3 py-2 rounded border-none focus:outline-none"
                required
              />
              {authError && <div className="text-red-400 text-xs">{authError}</div>}
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="text-sm px-2 py-1 bg-discord-accent text-white rounded hover:bg-discord-accent-hover"
                >
                  {isSigningUp ? 'Sign up' : 'Sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSigningUp((s) => !s)}
                  className="text-sm px-2 py-1 bg-transparent border border-discord-border rounded text-discord-text-muted hover:text-discord-text"
                >
                  {isSigningUp ? 'Have an account?' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-discord-border my-2" />

      {/* Members list */}
      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4">
        {/* Fixed spacer to ensure separation from top border regardless of hot-reload */}
        <div className="h-3" />
        <h3 className="text-discord-text-muted text-xs font-semibold uppercase tracking-wide mb-3">
          Members — {onlineUsers.length}
        </h3>
        
        <div>
          {onlineUsers.map((userItem) => (
            <div
              key={userItem.id}
              className="member-row flex items-center space-x-3 p-3 rounded-md cursor-pointer text-sm hover:bg-discord-light group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white text-xs font-semibold">
                  {userItem.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-discord-darkest ${getStatusColor(userItem.status)}`}></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-discord-text text-sm font-medium truncate">
                    {userItem.name}
                  </span>
                  {getRoleIcon(userItem.role)}
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 p-1.5 text-discord-text-muted hover:text-discord-text">
                <MoreVertical size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
