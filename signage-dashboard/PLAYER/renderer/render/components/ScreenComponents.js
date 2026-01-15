// Professional Pairing Screen Component
export async function PairingScreen(pairing_code) {
  try {
    const qrPayload = `signage://pair/${pairing_code}`;
    const qrDataUrl = await window.QR.Code(qrPayload);

    return `
      <div style="background: radial-gradient(circle at center, #1a1a1a 0%, #050505 100%); color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(#ffffff 0.5px, transparent 0.5px); background-size: 30px 30px;"></div>
        <div style="position: relative; border: 1px solid rgba(255,255,255,0.1); padding: 50px; border-radius: 24px; background: rgba(15, 15, 15, 0.8); backdrop-filter: blur(20px); box-shadow: 0 30px 60px rgba(0,0,0,0.8); text-align: center; max-width: 500px; width: 90%;">
          <div style="display: flex; justify-content: center; margin-bottom: 30px;">
             <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
             </div>
          </div>
          <h1 style="font-size: 28px; margin-bottom: 12px; font-weight: 800; letter-spacing: -0.5px;">Pairing Required</h1>
          <p style="color: #94a3b8; font-size: 16px; margin-bottom: 40px; line-height: 1.5;">Connect this display to your management dashboard to start publishing content.</p>
          
          <div style="display: flex; flex-direction: column; align-items: center; gap: 30px;">
            <div style="padding: 16px; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
              <img src="${qrDataUrl}" style="width:180px; height:180px; display: block;" alt="QR Code" />
            </div>
            
            <div style="width: 100%;">
              <div style="text-transform: uppercase; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 2px; margin-bottom: 12px;">Activation Code</div>
              <div style="font-size: 56px; font-weight: 900; letter-spacing: 8px; color: #3b82f6; text-shadow: 0 0 20px rgba(59, 130, 246, 0.2);">${pairing_code}</div>
            </div>
          </div>
          
          <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #475569; font-size: 14px; font-weight: 500;">Visit dashboard.signage.com/pair</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error generating pairing screen:", error);
    return `
      <div style="background: #050505; color: #fff; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif;">
        <div style="text-align: center;">
          <h1 style="font-size: 24px; margin-bottom: 20px; font-weight: 700;">Pairing Code</h1>
          <div style="font-size: 64px; font-weight: 900; letter-spacing: 10px; color: #3b82f6;">${pairing_code}</div>
          <p style="color: #64748b; font-size: 16px; margin-top: 30px;">Enter this code in the management panel</p>
        </div>
      </div>
    `;
  }
}

export function WaitingScreen() {
  return `
    <div style="background: #050505; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.05; background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 40px 40px;"></div>
      <div style="text-align: center; max-width: 500px; position: relative; z-index: 1;">
        <div style="margin-bottom: 40px; position: relative; display: inline-block;">
           <div style="width: 100px; height: 100px; border: 4px solid rgba(59, 130, 246, 0.1); border-top-color: #3b82f6; border-radius: 50%; animation: spin 2s linear infinite;"></div>
           <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>
        </div>
        <h2 style="font-size: 32px; font-weight: 900; margin-bottom: 16px; letter-spacing: -1px; background: linear-gradient(to bottom, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">System Ready</h2>
        <p style="color: #64748b; margin-bottom: 40px; line-height: 1.6; font-size: 18px; font-weight: 500;">The player is synchronized and waiting for content assignments from the dashboard.</p>
        
        <div style="display: flex; gap: 12px; justify-content: center; align-items: center;">
           <div style="width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; animation: pulse-dot 1.5s infinite 0s;"></div>
           <div style="width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; animation: pulse-dot 1.5s infinite 0.3s;"></div>
           <div style="width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; animation: pulse-dot 1.5s infinite 0.6s;"></div>
           <span style="color: #475569; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-left: 8px;">Waiting for signal</span>
        </div>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      </style>
    </div>
  `;
}

export function ErrorScreen(message = "An error occurred") {
  return `
    <div style="background: #0a0505; color: #fff; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif;">
      <div style="text-align: center; max-width: 600px; padding: 60px; border-radius: 32px; background: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.1);">
        <div style="width: 80px; height: 80px; background: rgba(220, 38, 38, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 style="font-size: 28px; margin-bottom: 16px; font-weight: 800; color: #ef4444;">System Offline</h1>
        <p style="color: #94a3b8; line-height: 1.6; font-size: 18px; margin-bottom: 30px;">${message}</p>
        <div style="padding: 12px 24px; background: rgba(255,255,255,0.05); border-radius: 12px; display: inline-block; color: #64748b; font-size: 14px; font-weight: 600;">
          Error reference: ERR_SYS_HALT
        </div>
      </div>
    </div>
  `;
}