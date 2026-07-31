import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const METHODS = [
  {
    id: "mpesa",
    name: "M-Pesa",
    prefixes: ["84", "85"],
    swatch: "#E30613",
  },
  {
    id: "emola",
    name: "e-Mola",
    prefixes: ["86", "87"],
    swatch: "#F0A438",
  },
];

const FEATURES = [
  "Todas as matérias e exercícios",
  "Explicação ilimitada",
  "Nota prevista actualizada",
  "Caderno de erros completo",
];

export default function Payment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState(null);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const selectedMethod = METHODS.find((m) => m.id === method);

  const phoneDigits = phone.replace(/\D/g, "");
  const detectedMethod = useMemo(() => {
    if (phoneDigits.length < 2) return null;
    return METHODS.find((m) => m.prefixes.includes(phoneDigits.slice(0, 2))) || null;
  }, [phoneDigits]);

  const mismatch = method && detectedMethod && detectedMethod.id !== method;
  const isValid = method && phoneDigits.length === 9 && !mismatch;

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setStatus("submitting");

    // A cobrança real acontece no backend: o frontend nunca fala directamente
    // com a API da M-Pesa/e-Mola (exige credenciais e assinatura do lado do servidor).
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: method,
          phone: `258${phoneDigits}`,
          plan: "premium-mensal",
        }),
      });
      if (!res.ok) throw new Error("checkout failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="pay-page">
      <header className="pay-header">
        <button className="pay-back" type="button" aria-label="Voltar" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span>Actualizar plano</span>
      </header>

      <div className="pay-plan">
        <div className="pay-plan-top">
          <span className="pay-plan-tag">Plano Premium</span>
          <span className="pay-plan-price-inline">150 MT<small>/mês</small></span>
        </div>
        <ul className="pay-plan-list">
          {FEATURES.map((f) => (
            <li key={f}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {status === "success" ? (
        <div className="pay-success">
          <div className="pay-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>Pedido enviado</h2>
          <p>Confirma o pagamento de 150&nbsp;MT no teu telefone para activares o Premium.</p>
        </div>
      ) : (
        <form className="pay-form" onSubmit={handleSubmit}>
          <span className="pay-field-label">Como queres pagar</span>
          <div className="pay-methods">
            {METHODS.map((m) => (
              <button
                type="button"
                key={m.id}
                className={`pay-method${method === m.id ? " selected" : ""}`}
                onClick={() => setMethod(m.id)}
              >
                <span className="pay-method-dot" style={{ background: m.swatch }} />
                {m.name}
              </button>
            ))}
          </div>

          <label className="pay-field-label" htmlFor="phone">Número de telefone</label>
          <div className="pay-phone-field">
            <span className="pay-prefix">+258</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="84 123 4567"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={9}
            />
            <svg className="pay-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" />
            </svg>
          </div>

          {mismatch && (
            <p className="pay-hint error">
              Este número parece ser {detectedMethod.name}. Escolhe {detectedMethod.name} acima.
            </p>
          )}
          {status === "error" && (
            <p className="pay-hint error">Não foi possível iniciar o pagamento. Tenta novamente.</p>
          )}

          <button className="pay-submit" type="submit" disabled={!isValid || status === "submitting"}>
            {status === "submitting"
              ? "A enviar pedido..."
              : selectedMethod
              ? `Pagar com ${selectedMethod.name}`
              : "Pagar 150 MT"}
          </button>

          <p className="pay-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" />
            </svg>
            A confirmação é feita directamente pela {selectedMethod ? selectedMethod.name : "tua operadora"}. Nunca partilhamos o teu PIN.
          </p>

          <div className="pay-trust">
            <div className="pay-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Ligação encriptada
            </div>
            <div className="pay-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 12l1.8 1.8L15 10" />
              </svg>
              Canal oficial das operadoras
            </div>
            <div className="pay-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              Não guardamos dados do cartão
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
