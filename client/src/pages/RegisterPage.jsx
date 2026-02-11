import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FolderKanban size={36} className="auth-logo" />
          <h1 className="auth-title">TeamFlow</h1>
          <p className="auth-subtitle">Créez votre compte</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input
                className="input input-with-icon"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                className="input input-with-icon"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                className="input input-with-icon"
                type="password"
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
