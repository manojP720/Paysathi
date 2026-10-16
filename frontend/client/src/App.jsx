
import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/v1/pay-guard/analyze";
const AI_API_URL = "http://127.0.0.1:5000/predict";

const ICONS = {
  scan: "M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16",
  mobile: "M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2",
  bank: "M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  chat: "M4 5h16v11H9l-5 4z",
  target: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z",
  heart: "M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z",
  kit: "M4 8h16v12H4zM9 8V5h6v3M12 12v4M10 14h4",
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  robot: "M12 2v3M9 2h6M5 8h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2zM8 12h.01M16 12h.01M9 16h6",
  back: "M15 5l-7 7 7 7",
  bell: "M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0",
  close: "M6 6l12 12M18 6L6 18",
  spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  chevron: "M9 5l7 7-7 7",
  alert: "M12 8v5M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  check: "M5 12.5l4.5 4.5L19 7.5",
};

function Icon({ name, size = 24 }) {
  return (
    <svg className="ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const tools = [
  { icon: "shield", title: "Pay Guard", desc: "Check a payment for warning signs", tone: "mint" },
  { icon: "chat", title: "Message Explainer", desc: "Understand suspicious messages", tone: "blue" },
  { icon: "target", title: "Scam Gym", desc: "Practice spotting scams", tone: "orange" },
  { icon: "heart", title: "Saathi AI", desc: "Get step-by-step safety help", tone: "violet" },
  { icon: "kit", title: "After Kit", desc: "What to do after a suspected scam", tone: "mint" },
];

const SAMPLE_SCAM = {
  payee_name: "Rahul Verma",
  payee_id: "rahul.kyc@okaxis",
  amount: "4999",
  purpose_text: "Someone called saying my account will be blocked today unless I pay a KYC verification fee urgently.",
  is_new_payee: true,
  on_phone_call: true,
};

export default function App() {
  const [language, setLanguage] = useState("en");
  const [page, setPage] = useState("home");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [messageResult, setMessageResult] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [form, setForm] = useState({
    payee_name: "",
    payee_id: "",
    amount: "",
    purpose_text: "",
    is_new_payee: true,
    on_phone_call: false,
  });

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function analyzePayment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      language,
      payee_name: form.payee_name.trim(),
      payee_id: form.payee_id.trim(),
      amount: Number(form.amount),
      purpose_text: form.purpose_text.trim(),
      request_type: "pay",
      is_new_payee: form.is_new_payee,
      recipient_type: "person",
      on_phone_call: form.on_phone_call,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : `The server returned error ${response.status}.`;
        throw new Error(detail);
      }

      setResult(data);
      setPage("result");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to PaySaathi backend. Check that the backend server is running on port 8000."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function openTool(title) {
    if (title === "Pay Guard") {
      setError("");
      setResult(null);
      setPage("payguard");
      window.scrollTo({ top: 0 });
    } else if (title === "Saathi AI") {
      setChatOpen(true);
    } else if (title === "Message Explainer") {
      setPage("explainer");
      setNotice("");
      window.scrollTo({ top: 0 });
    } else if (title === "Scam Gym") {
      setNotice("Scam Gym demo is coming next. Use Message Explainer to check suspicious text now.");
      setPage("home");
      window.scrollTo({ top: 0 });
    } else if (title === "After Kit") {
      setNotice("If you suspect a scam: stop the payment, contact your bank using its official number, and report cyber fraud at 1930 in India.");
      setPage("home");
      window.scrollTo({ top: 0 });
    } else {
      setNotice(`${title} is part of the PaySaathi safety toolkit.`);
      setPage("home");
      window.scrollTo({ top: 0 });
    }
  }

  // AI-powered Message Explainer: calls the trained Flask model.
  async function analyzeMessage() {
    const text = messageText.trim();

    if (!text) {
      setMessageResult({
        level: "amber",
        title: "Paste a message first",
        details: "Add the SMS, WhatsApp message, or payment request you want to review.",
      });
      return;
    }

    setMessageLoading(true);
    setMessageResult(null);

    try {
      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `AI service returned ${response.status}.`);
      }

      if (!["scam", "genuine"].includes(data.prediction)) {
        throw new Error("The AI service returned an unexpected prediction.");
      }

      const isScam = data.prediction === "scam";
      const scamScore = Number(data.scam_score);
      const scoreText = Number.isFinite(scamScore)
        ? `${scamScore.toFixed(1)}%`
        : "unavailable";

      setMessageResult({
        level: isScam ? "red" : "green",
        title: isScam ? "Possible scam detected" : "Possibly genuine message",
        details: isScam
          ? `The trained model classified this message as a possible scam. Model scam score: ${scoreText}. Verify independently before acting.`
          : `The trained model classified this message as possibly genuine. Model scam score: ${scoreText}. This does not prove the message is safe.`,
      });
    } catch (err) {
      setMessageResult({
        level: "amber",
        title: "AI service unavailable",
        details:
          err instanceof TypeError
            ? "Cannot connect to the AI service. Check that Flask is running at http://127.0.0.1:5000 and that CORS is enabled."
            : err.message || "Please try again.",
      });
    } finally {
      setMessageLoading(false);
    }
  }

  function sendChat(event) {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question) return;

    const lower = question.toLowerCase();
    let answer =
      "Pause before paying. Never share your UPI PIN or OTP, and verify the request using the bank or service's official contact details.";

    if (/(message|sms|whatsapp|link)/.test(lower)) {
      answer = "Open Message Explainer and paste the full message. The trained model can flag possible SMS spam, but it cannot guarantee a message is safe.";
    } else if (/(payment|pay|upi|transfer)/.test(lower)) {
      answer = "Use Pay Guard to review the payment context. If someone is pressuring you, stop and verify with the receiver through a separate trusted channel.";
    } else if (/(scam|fraud|cheat|money gone|lost money)/.test(lower)) {
      answer = "If money may have been lost in India, contact your bank immediately and call cyber fraud helpline 1930. Keep transaction IDs and screenshots. Do not pay anyone promising guaranteed recovery.";
    }

    setChatMessages((old) => [
      ...old,
      { from: "user", text: question },
      { from: "assistant", text: answer },
    ]);
    setChatInput("");
  }

  function renderHome() {
    return (
      <>
        <header className="hero">
          <div className="hero-row">
            <div className="avatar">S</div>
            <div className="hero-who">
              <b>PaySaathi</b>
              <small>Easy pay, safe pay</small>
            </div>
            <select
              className="lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिन्दी</option>
            </select>
            <button className="round-btn" onClick={() => setNotice("No new notifications.")} aria-label="Notifications">
              <Icon name="bell" size={20} />
            </button>
          </div>
        </header>

        <button className="search" onClick={() => openTool("Pay Guard")}>
          <Icon name="shield" size={20} />
          <span>Demo · Try PaySaathi safety tools</span>
        </button>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message">
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        <section className="card">
          <h3>Money Transfers</h3>
          <div className="grid4">
            <button className="tile" onClick={() => openTool("Pay Guard")}>
              <span className="ic"><Icon name="scan" /></span>Scan &amp; Pay
            </button>
            <button className="tile" onClick={() => openTool("Pay Guard")}>
              <span className="ic"><Icon name="mobile" /></span>To Mobile
            </button>
            <button className="tile" onClick={() => openTool("Pay Guard")}>
              <span className="ic"><Icon name="bank" /></span>Bank Transfer
            </button>
            <button className="tile" onClick={() => openTool("Pay Guard")}>
              <span className="ic"><Icon name="shield" /></span>Pay Guard
            </button>
          </div>
          <p className="fineprint">Demo only. No money is transferred and no QR is scanned.</p>
        </section>

        <section className="card">
          <h3>Safety Services</h3>
          {tools.map((tool) => (
            <button className="row" key={tool.title} onClick={() => openTool(tool.title)}>
              <span className={`ic small ${tool.tone}`}><Icon name={tool.icon} size={22} /></span>
              <span className="row-mid">
                <b>{tool.title}</b>
                <small>{tool.desc}</small>
              </span>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        </section>

        <section className="banner">
          <span className="banner-ic"><Icon name="alert" size={22} /></span>
          <div>
            <b>Never share your UPI PIN or OTP</b>
            <p>You never need to enter a PIN to receive money. Pause if anyone pressures you.</p>
          </div>
        </section>
      </>
    );
  }

  function renderPayGuard() {
    return (
      <>
        <div className="bar">
          <button onClick={() => setPage("home")} aria-label="Back"><Icon name="back" /></button>
          <h2>Pay Guard</h2>
        </div>

        <form className="screen-body" onSubmit={analyzePayment}>
          <div className="info-note">
            This is a safety assessment, not a real payment. Never enter your UPI PIN or OTP here.
          </div>

          <div className="card flat">
            <div className="card-head">
              <h3>Payment details</h3>
              <button type="button" className="link" onClick={() => setForm(SAMPLE_SCAM)}>
                Try sample scam
              </button>
            </div>

            <label className="field">
              <span>Receiver’s name *</span>
              <input name="payee_name" value={form.payee_name} onChange={updateField} placeholder="e.g. Ravi Kumar" required maxLength={100} />
            </label>
            <label className="field">
              <span>UPI ID or receiver reference</span>
              <input name="payee_id" value={form.payee_id} onChange={updateField} placeholder="e.g. name@upi" maxLength={150} />
            </label>
            <label className="field">
              <span>Amount (₹) *</span>
              <input name="amount" type="number" inputMode="decimal" value={form.amount} onChange={updateField} placeholder="Enter amount" min="1" max="100000000" step="0.01" required />
            </label>
            <label className="field">
              <span>Why are you making this payment? *</span>
              <textarea name="purpose_text" value={form.purpose_text} onChange={updateField} placeholder="Example: Someone called asking me to pay a fee to keep my account active..." rows={4} maxLength={2000} required />
            </label>
          </div>

          <div className="card flat">
            <h3>Have you noticed any pressure?</h3>
            <label className="check">
              <input type="checkbox" name="is_new_payee" checked={form.is_new_payee} onChange={updateField} />
              <span><b>New or unfamiliar receiver</b><small>I have not paid this person before.</small></span>
            </label>
            <label className="check">
              <input type="checkbox" name="on_phone_call" checked={form.on_phone_call} onChange={updateField} />
              <span><b>Someone is on a call with me about this payment</b><small>They may be guiding or pressuring me to pay.</small></span>
            </label>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <b>Unable to check this payment</b>
              <p>{error}</p>
            </div>
          )}

          <button className="cta" type="submit" disabled={loading}>
            {loading ? "Checking warning signs..." : "Check payment safety"}
          </button>
          <p className="fineprint center">PaySaathi does not send money, contact your bank, or block payments.</p>
        </form>
      </>
    );
  }

  function renderMessageExplainer() {
    const copy = language === "kn" ? {
      title: "ಸಂದೇಶ ಪರಿಶೀಲನೆ",
      intro: "ಸಂದೇಹಾಸ್ಪದ SMS ಅಥವಾ WhatsApp ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ.",
      placeholder: "ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ…",
      button: "ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ",
      back: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
      warning: "AI ಫಲಿತಾಂಶವು ಅಂದಾಜು ಮಾತ್ರ; ಸುರಕ್ಷಿತವೆಂಬ ಖಾತರಿ ಅಲ್ಲ.",
    } : language === "hi" ? {
      title: "मैसेज समझें",
      intro: "संदिग्ध SMS या WhatsApp संदेश यहाँ पेस्ट करें।",
      placeholder: "संदेश यहाँ पेस्ट करें…",
      button: "मैसेज जाँचें",
      back: "होम पर वापस जाएँ",
      warning: "AI परिणाम केवल अनुमान है; सुरक्षा की गारंटी नहीं।",
    } : {
      title: "Message Explainer",
      intro: "Paste a suspicious SMS, WhatsApp message, or payment request to analyze it with our trained model.",
      placeholder: "Paste the full message here…",
      button: "Check message",
      back: "Back to home",
      warning: "Experimental AI prediction only. It cannot prove a message is safe or fraudulent.",
    };

    return (
      <>
        <div className="bar">
          <button onClick={() => setPage("home")} aria-label="Back"><Icon name="back" /></button>
          <h2>{copy.title}</h2>
        </div>

        <div className="screen-body">
          <div className="info-note">{copy.intro}</div>

          <section className="card flat">
            <label className="field">
              <span>{language === "kn" ? "ಸಂದೇಶ" : language === "hi" ? "संदेश" : "Message text"}</span>
              <textarea
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  setMessageResult(null);
                }}
                placeholder={copy.placeholder}
                rows={7}
                maxLength={5000}
              />
            </label>

            <button className="cta" onClick={analyzeMessage} disabled={messageLoading}>
              {messageLoading ? "Analyzing with AI..." : copy.button}
            </button>
          </section>

          {messageResult && (
            <section className={`card message-result result-${messageResult.level}`} role="status">
              <span className={`pill pill-${messageResult.level === "green" ? "green" : messageResult.level === "red" ? "red" : "amber"}`}>
                {messageResult.level.toUpperCase()} REVIEW
              </span>
              <h3>{messageResult.title}</h3>
              <p>{messageResult.details}</p>
            </section>
          )}

          <p className="fineprint center">{copy.warning}</p>
          <button className="cta ghost" onClick={() => setPage("home")}>{copy.back}</button>
        </div>
      </>
    );
  }

  function renderResult() {
    const verdict = String(result?.verdict ?? result?.risk_verdict ?? "").toUpperCase();
    const valid = ["GREEN", "AMBER", "RED"].includes(verdict);

    const info = {
      GREEN: {
        title: "No known warning signs matched",
        description: "The current checks did not identify a known warning pattern. This does not prove the receiver is safe.",
        icon: "check",
      },
      AMBER: {
        title: "Pause and double-check",
        description: "Some warning signs may need closer attention. Verify the request independently before deciding.",
        icon: "alert",
      },
      RED: {
        title: "Stop and review the warning signs",
        description: "The assessment identified serious warning signs. Do not rush or follow instructions from someone pressuring you.",
        icon: "alert",
      },
    }[verdict];

    const warnings = Array.isArray(result?.warnings)
      ? result.warnings
      : Array.isArray(result?.reasons)
        ? result.reasons
        : [];

    return (
      <>
        <div className={`bar ${valid ? "bar-" + verdict.toLowerCase() : ""}`}>
          <button onClick={() => setPage("payguard")} aria-label="Back"><Icon name="back" /></button>
          <h2>Pay Guard result</h2>
        </div>

        <div className="screen-body">
          {valid ? (
            <div className="card result">
              <div className={`result-symbol result-${verdict.toLowerCase()}`}>
                <Icon name={info.icon} size={38} />
              </div>
              <span className={`pill pill-${verdict.toLowerCase()}`}>{verdict} RISK CHECK</span>
              <h1>{info.title}</h1>
              <p className="muted">{info.description}</p>

              {warnings.length > 0 && (
                <div className="warnings">
                  <h3>Warning signs to review</h3>
                  {warnings.map((item, index) => (
                    <article className="warning" key={item.code ?? index}>
                      <span><Icon name="alert" size={16} /></span>
                      <div>
                        <b>{item.title ?? item.code ?? `Warning ${index + 1}`}</b>
                        {item.detail && <p>{item.detail}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="remember">
                <b>Remember</b>
                <p>Never share your UPI PIN or OTP. If you feel pressured, pause and independently verify the request.</p>
              </div>
            </div>
          ) : (
            <div className="card result">
              <div className="result-symbol result-amber"><Icon name="alert" size={38} /></div>
              <h1>We received a response.</h1>
              <p className="muted">The API response did not contain a recognised GREEN, AMBER, or RED verdict field. No risk level has been invented.</p>
              <details className="details">
                <summary>Inspect the API response</summary>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          )}

          <button className="cta" onClick={() => setPage("payguard")}>Check another payment</button>
          <button className="cta ghost" onClick={() => setPage("home")}>Back to home</button>
          <p className="fineprint center">Simulation only. A risk result is guidance, not a guarantee of safety or proof of fraud.</p>
        </div>
      </>
    );
  }

  return (
    <main className="app-shell">
      <div className="content">
        {page === "home" && renderHome()}
        {page === "payguard" && renderPayGuard()}
        {page === "result" && renderResult()}
        {page === "explainer" && renderMessageExplainer()}
      </div>

      <nav className="bottom-nav" aria-label="Main navigation">
        <button className={page === "home" ? "on" : ""} onClick={() => setPage("home")}>
          <span className="home-icons"><Icon name="robot" size={15} /><Icon name="home" size={22} /></span>
          Home
        </button>
        <button className={page === "payguard" || page === "result" ? "on" : ""} onClick={() => openTool("Pay Guard")}>
          <Icon name="shield" size={22} />Pay Guard
        </button>
        <button className={page === "explainer" ? "on" : ""} onClick={() => openTool("Message Explainer")}>
          <Icon name="chat" size={22} />Messages
        </button>
        <button onClick={() => setChatOpen(true)}>
          <Icon name="spark" size={22} />Saathi AI
        </button>
      </nav>

      <button className="ai-fab" onClick={() => setChatOpen((open) => !open)} aria-label={chatOpen ? "Close Saathi assistant" : "Open Saathi assistant"}>
        <Icon name={chatOpen ? "close" : "spark"} size={24} />
      </button>

      {chatOpen && (
        <section className="chat-panel" aria-label="Saathi AI assistant">
          <div className="chat-header">
            <div><b>Saathi Assistant</b><small>Safety help</small></div>
            <button onClick={() => setChatOpen(false)} aria-label="Close chat"><Icon name="close" size={20} /></button>
          </div>

          <div className="chat-body">
            <p className="chat-bubble">Namaste! I can help you find PaySaathi safety tools. Never share your UPI PIN or OTP.</p>

            {chatMessages.map((message, index) => (
              <p className="chat-bubble" key={index}>
                <b>{message.from === "user" ? "You: " : "Saathi: "}</b>{message.text}
              </p>
            ))}

            <form onSubmit={sendChat}>
              <label className="field">
                <span>Ask Saathi</span>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about a suspicious message..." />
              </label>
              <button className="cta small-cta" type="submit">Send</button>
            </form>

            <button className="cta small-cta" onClick={() => { setChatOpen(false); openTool("Pay Guard"); }}>
              Open Pay Guard
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
