export function injectSwalStyles(): void {
  if (document.getElementById('qpw-style')) return;

  const style = document.createElement('style');
  style.id = 'qpw-style';
  style.textContent = `
    /* ─── Reset Swal defaults that fight our styles ─── */
    .qpw-popup.swal2-popup {
      background: #0e0e0e !important;
      border: 1px solid #262626 !important;
      border-radius: 20px !important;
      padding: 0 !important;
      width: 420px !important;
      max-width: 94vw !important;
      box-shadow: 0 40px 100px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.04) !important;
      font-family: 'Sora', sans-serif !important;
      overflow: hidden !important;
      color: rgba(255,255,255,.88) !important;
    }

    /* Kill ALL default Swal inner padding/margins */
    .qpw-popup .swal2-html-container {
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      font-size: inherit !important;
      color: inherit !important;
      text-align: inherit !important;
    }
    .qpw-popup .swal2-title {
      display: none !important;
    }
    .qpw-popup .swal2-icon {
      display: none !important;
    }

    /* ─── Top accent line via ::before on the container ─── */
    .qpw-popup.swal2-popup::before {
      content: '';
      display: block;
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(232,255,71,.35), transparent);
      z-index: 1;
    }
    .qpw-popup.state-success.swal2-popup::before {
      background: linear-gradient(90deg, transparent, rgba(74,222,128,.4), transparent);
    }
    .qpw-popup.state-error.swal2-popup::before {
      background: linear-gradient(90deg, transparent, rgba(248,113,113,.4), transparent);
    }
    .qpw-popup.state-cancel.swal2-popup::before {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent);
    }

    /* ─── Body wrapper ─── */
    .qpw-body {
      padding: 36px 32px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    /* ─── Icon box ─── */
    .qpw-icon-box {
      width: 58px; height: 58px;
      border-radius: 15px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      position: relative;
      flex-shrink: 0;
    }
    .qpw-icon-box.accent  { background: rgba(232,255,71,.08);  border: 1px solid rgba(232,255,71,.22);  color: #e8ff47; }
    .qpw-icon-box.success { background: rgba(74,222,128,.08);  border: 1px solid rgba(74,222,128,.22);  color: #4ade80; }
    .qpw-icon-box.error   { background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.22); color: #f87171; }
    .qpw-icon-box.neutral { background: rgba(255,255,255,.04); border: 1px solid #2a2a2a;               color: rgba(255,255,255,.28); }

    .qpw-icon-box.success::after {
      content: ''; position: absolute; inset: -7px;
      border-radius: 21px;
      border: 1px solid rgba(74,222,128,.15);
      animation: qpwRing .5s ease both;
    }
    @keyframes qpwRing {
      from { opacity: 0; transform: scale(.8); }
      to   { opacity: 1; transform: scale(1); }
    }

    /* ─── Badge ─── */
    .qpw-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 3px 12px; border-radius: 100px;
      font-family: 'Geist Mono', monospace !important;
      font-size: 9px; font-weight: 600;
      letter-spacing: .13em; text-transform: uppercase;
      margin-bottom: 14px;
    }
    .qpw-badge.accent  { background: rgba(232,255,71,.07);  border: 1px solid rgba(232,255,71,.2);  color: rgba(232,255,71,.85); }
    .qpw-badge.success { background: rgba(74,222,128,.07);  border: 1px solid rgba(74,222,128,.2);  color: rgba(74,222,128,.85); }
    .qpw-badge.error   { background: rgba(248,113,113,.07); border: 1px solid rgba(248,113,113,.2); color: rgba(248,113,113,.85); }
    .qpw-badge.neutral { background: rgba(255,255,255,.04); border: 1px solid #2a2a2a;              color: rgba(255,255,255,.25); }

    .qpw-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: currentColor;
      animation: qpwPulse 2s infinite;
    }
    @keyframes qpwPulse {
      0%,100% { opacity: 1; transform: scale(1); }
      50%     { opacity: .2; transform: scale(.45); }
    }

    /* ─── Title ─── */
    .qpw-title {
      font-family: 'Sora', sans-serif !important;
      font-size: 22px !important; font-weight: 700 !important;
      color: rgba(255,255,255,.9) !important;
      margin: 0 0 8px !important;
      letter-spacing: -.02em !important;
      line-height: 1.2 !important;
    }

    /* ─── Subtitle ─── */
    .qpw-sub {
      font-family: 'Sora', sans-serif !important;
      font-size: 12.5px !important; font-weight: 300 !important;
      color: rgba(255,255,255,.35) !important;
      line-height: 1.65 !important;
      margin: 0 0 24px !important;
      max-width: 300px;
    }
    .qpw-sub strong { color: rgba(255,255,255,.65) !important; font-weight: 600 !important; }

    /* ─── Password field ─── */
    .qpw-field {
      position: relative;
      width: 100%;
      margin-bottom: 12px;
    }
    .qpw-input {
      width: 100% !important;
      height: 48px !important;
      background: #141414 !important;
      border: 1px solid #2e2e2e !important;
      border-radius: 12px !important;
      padding: 0 48px 0 16px !important;
      font-family: 'Geist Mono', monospace !important;
      font-size: 15px !important;
      color: rgba(255,255,255,.88) !important;
      letter-spacing: .1em !important;
      outline: none !important;
      box-shadow: none !important;
      transition: border-color .2s, box-shadow .2s !important;
      box-sizing: border-box !important;
      caret-color: #e8ff47 !important;
    }
    .qpw-input::placeholder {
      color: rgba(255,255,255,.15) !important;
      letter-spacing: .06em !important;
      font-size: 13px !important;
    }
    .qpw-input:focus {
      border-color: rgba(232,255,71,.35) !important;
      box-shadow: 0 0 0 3px rgba(232,255,71,.07) !important;
    }

    .qpw-eye {
      position: absolute;
      right: 13px; top: 50%; transform: translateY(-50%);
      background: none !important; border: none !important; padding: 5px;
      color: rgba(255,255,255,.25);
      cursor: pointer;
      display: flex; align-items: center;
      border-radius: 6px;
      transition: color .15s;
      line-height: 0;
    }
    .qpw-eye:hover { color: rgba(255,255,255,.6) !important; }

    /* ─── Warning strip ─── */
    .qpw-warn {
      display: flex; align-items: flex-start; gap: 8px;
      width: 100%;
      padding: 10px 14px;
      background: rgba(248,113,113,.05);
      border: 1px solid rgba(248,113,113,.15);
      border-radius: 9px;
      font-family: 'Geist Mono', monospace !important;
      font-size: 10px;
      color: rgba(248,113,113,.6);
      text-align: left;
      line-height: 1.6;
      margin-bottom: 4px;
      box-sizing: border-box;
    }
    .qpw-warn svg { flex-shrink: 0; margin-top: 1px; }

    /* ─── Progress bar (timer) ─── */
    .qpw-popup .swal2-timer-progress-bar-container {
      border-radius: 0 0 20px 20px !important;
      overflow: hidden !important;
    }
    .qpw-popup .swal2-timer-progress-bar {
      background: rgba(232,255,71,.5) !important;
      height: 3px !important;
    }
    .qpw-popup.state-success .swal2-timer-progress-bar { background: rgba(74,222,128,.5) !important; }
    .qpw-popup.state-cancel  .swal2-timer-progress-bar { background: rgba(255,255,255,.2) !important; }

    /* ─── Validation message ─── */
    .qpw-popup .swal2-validation-message {
      background: transparent !important;
      border: none !important;
      color: rgba(248,113,113,.75) !important;
      font-family: 'Geist Mono', monospace !important;
      font-size: 10.5px !important;
      padding: 4px 0 0 !important;
      margin: 0 32px !important;
      justify-content: center !important;
    }
    .qpw-popup .swal2-validation-message::before { display: none !important; }

    /* ─── Actions row ─── */
    .qpw-popup .swal2-actions {
      display: flex !important;
      flex-direction: row !important;
      gap: 10px !important;
      padding: 18px 32px 28px !important;
      margin: 0 !important;
      width: 100% !important;
      justify-content: stretch !important;
    }

    /* ─── Confirm button (yellow) ─── */
    .qpw-popup .swal2-confirm.qpw-btn-confirm {
      flex: 1 !important;
      height: 48px !important;
      background: #e8ff47 !important;
      color: #000 !important;
      border: none !important;
      border-radius: 12px !important;
      font-family: 'Sora', sans-serif !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      position: relative !important;
      overflow: hidden !important;
      transition: background .18s, transform .14s !important;
      box-shadow: 0 0 0 1px rgba(232,255,71,.2), 0 6px 20px rgba(232,255,71,.2) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      letter-spacing: -.01em !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .qpw-popup .swal2-confirm.qpw-btn-confirm:hover {
      background: #f2ff64 !important;
      transform: translateY(-1px) !important;
    }
    .qpw-popup .swal2-confirm.qpw-btn-confirm:focus {
      box-shadow: 0 0 0 3px rgba(232,255,71,.25) !important;
    }
    .qpw-popup .swal2-confirm.qpw-btn-confirm::after {
      content: '' !important;
      position: absolute !important;
      top: 0 !important; left: -100% !important;
      width: 55% !important; height: 100% !important;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent) !important;
      transform: skewX(-18deg) !important;
      animation: qpwShimmer 2.5s infinite !important;
    }
    @keyframes qpwShimmer { 0% { left: -100%; } 100% { left: 160%; } }

    /* ─── Cancel button (ghost) ─── */
    .qpw-popup .swal2-cancel.qpw-btn-cancel {
      flex: 1 !important;
      height: 48px !important;
      background: transparent !important;
      color: rgba(255,255,255,.4) !important;
      border: 1px solid #2c2c2c !important;
      border-radius: 12px !important;
      font-family: 'Sora', sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all .15s !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .qpw-popup .swal2-cancel.qpw-btn-cancel:hover {
      background: #181818 !important;
      border-color: #3a3a3a !important;
      color: rgba(255,255,255,.65) !important;
    }

    /* ─── Spin animation (evaluating state) ─── */
    @keyframes qpwSpinAnim { to { transform: rotate(360deg); } }
    .qpw-spin { animation: qpwSpinAnim .85s linear infinite; }

    /* ─── Indeterminate progress bar (evaluating state) ─── */
    .qpw-progress-track {
      width: 100%; height: 3px;
      background: #1e1e1e;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 8px;
      margin-bottom: 4px;
    }
    .qpw-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, transparent, #e8ff47, transparent);
      border-radius: 3px;
      animation: qpwIndeterminate 1.6s ease-in-out infinite;
      width: 40%;
    }
    @keyframes qpwIndeterminate {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(350%); }
    }

    /* ─── Backdrop ─── */
    .swal2-backdrop-show { background: rgba(0,0,0,.75) !important; backdrop-filter: blur(6px) !important; }
  `;
  document.head.appendChild(style);
}