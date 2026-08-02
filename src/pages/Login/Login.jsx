import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>;
}
function ErrorIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function passwordScore(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score++;
  if (value.length >= 8 && /[0-9]/.test(value) && /[A-Z]/.test(value) && /[^a-zA-Z0-9]/.test(value)) score++;
  return score;
}

/** Um campo de formulário com label flutuante e feedback de validação inline. */
function Field({ id, label, type, value, onChange, onBlur, touched, valid, hasToggle, showPassword, onToggle, hint, autoComplete, extra }) {
  const state = value === '' ? '' : valid ? 'valid' : 'error';
  return (
    <div className={`field ${hasToggle ? 'has-toggle' : ''} ${state}`.trim()}>
      <input
        id={id}
        type={hasToggle && showPassword ? 'text' : type}
        placeholder=" "
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <label htmlFor={id}>{label}</label>
      <span className="status-icon ok"><CheckIcon /></span>
      <span className="status-icon err"><ErrorIcon /></span>
      {hasToggle && (
        <button type="button" className="toggle-pass" aria-label="Mostrar palavra-passe" onClick={onToggle} style={{ color: showPassword ? 'var(--accent)' : 'var(--ink-soft)' }}>
          <span style={{ display: 'contents' }}>
            <EyeIcon />
          </span>
        </button>
      )}
      {extra}
      <div className="hint">{hint}</div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar, registar } = useAuth();
  const destino = location.state?.de || '/dashboard';
  const [activeTab, setActiveTab] = useState('login');
  const [authError, setAuthError] = useState(null);

  // --- login state ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const loginEmailValid = validateEmail(loginEmail);
  const loginPasswordValid = loginPassword.length >= 6;
  const loginFormValid = loginEmailValid && loginPasswordValid;

  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (!loginFormValid || loginLoading) return;
    setAuthError(null);
    setLoginLoading(true);
    try {
      await entrar(loginEmail, loginPassword);
      navigate(destino, { replace: true });
    } catch (e) {
      setAuthError(e.message || 'Não foi possível entrar. Tenta novamente.');
    } finally {
      setLoginLoading(false);
    }
  }

  // --- register state ---
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regShowPass, setRegShowPass] = useState(false);
  const [confirmShowPass, setConfirmShowPass] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const nameValid = name.trim().length >= 2;
  const regEmailValid = validateEmail(regEmail);
  const regPasswordValid = regPassword.length >= 8;
  const confirmValid = confirmPassword.length > 0 && confirmPassword === regPassword;
  const registerFormValid = nameValid && regEmailValid && regPasswordValid && confirmValid;

  const strength = passwordScore(regPassword);
  const passHint = regPassword === ''
    ? 'Mínimo de 8 caracteres, com número'
    : strength >= 3 ? 'Palavra-passe forte' : strength === 2 ? 'Palavra-passe razoável' : 'Mínimo de 8 caracteres, com número';

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    if (!registerFormValid || regLoading) return;
    setAuthError(null);
    setRegLoading(true);
    try {
      await registar(name, regEmail, regPassword);
      navigate(destino, { replace: true });
    } catch (e) {
      setAuthError(e.message || 'Não foi possível criar a conta. Tenta novamente.');
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="app">
      <nav className="tabs" data-active={activeTab}>
        <button type="button" className={activeTab === 'login' ? 'active' : ''} onClick={() => setActiveTab('login')}>Login</button>
        <button type="button" className={activeTab === 'register' ? 'active' : ''} onClick={() => setActiveTab('register')}>Register</button>
        <div className="tab-pill" />
      </nav>

      <div className="card">
        <h1>{activeTab === 'login' ? 'Entrar na sua conta' : 'Criar a sua conta'}</h1>

        {authError && <p className="auth-error" role="alert">{authError}</p>}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <Field
              id="l-email-input"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              valid={loginEmailValid}
              hint="Introduza um e-mail válido"
            />
            <Field
              id="l-pass-input"
              label="Palavra-passe"
              type="password"
              autoComplete="current-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              valid={loginPasswordValid}
              hasToggle
              showPassword={loginShowPass}
              onToggle={() => setLoginShowPass((v) => !v)}
              hint="Mínimo de 6 caracteres"
            />

            <div className="row-between">
              <label className="remember"><input type="checkbox" />Lembrar-me</label>
              <a href="#" className="link">Esqueceu a senha?</a>
            </div>

            <button type="submit" className={`submit ${loginLoading ? 'loading' : ''}`} disabled={!loginFormValid || loginLoading}>
              <span className="spinner" />
              <span className="submit-label">Entrar</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <Field
              id="r-name-input"
              label="Nome completo"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              valid={nameValid}
              hint="Introduza o seu nome"
            />
            <Field
              id="r-email-input"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              valid={regEmailValid}
              hint="Introduza um e-mail válido"
            />
            <Field
              id="r-pass-input"
              label="Palavra-passe"
              type="password"
              autoComplete="new-password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              valid={regPasswordValid}
              hasToggle
              showPassword={regShowPass}
              onToggle={() => setRegShowPass((v) => !v)}
              hint={passHint}
              extra={
                <div className="strength" data-level={strength}>
                  <i /><i /><i />
                </div>
              }
            />
            <Field
              id="r-confirm-input"
              label="Confirmar palavra-passe"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              valid={confirmValid}
              hasToggle
              showPassword={confirmShowPass}
              onToggle={() => setConfirmShowPass((v) => !v)}
              hint="As palavras-passe devem coincidir"
            />

            <button type="submit" className={`submit ${regLoading ? 'loading' : ''}`} disabled={!registerFormValid || regLoading}>
              <span className="spinner" />
              <span className="submit-label">Criar conta</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
