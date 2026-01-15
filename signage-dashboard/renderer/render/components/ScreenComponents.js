// Professional Pairing Screen Component
export async function PairingScreen(pairing_code) {
  try {
    const qrPayload = `signage://pair/${pairing_code}`;
    const qrDataUrl = await window.QR.Code(qrPayload);

    return `
      <div style="background: #0a0a0a; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif;">
        <div style="border: 2px solid #333; padding: 40px; border-radius: 12px; background: #111; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center;">
          <h1 style="font-size: 24px; margin-bottom: 20px; font-weight: 600;">Pairing Required</h1>
          <img src="${qrDataUrl}" style="width:200px; height:200px; padding: 10px; background: #fff; border-radius: 8px; margin-bottom: 20px;" alt="QR Code" />
          <div style="font-size: 42px; font-weight: 800; letter-spacing: 4px; color: #007bff; margin-bottom: 10px;">${pairing_code}</div>
          <p style="color: #888; font-size: 14px;">Scan QR or enter code in management panel</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error generating pairing screen:", error);
    return `
      <div style="background: #0a0a0a; color: #fff; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif;">
        <div style="text-align: center;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">Pairing Code</h1>
          <div style="font-size: 42px; font-weight: 800; letter-spacing: 4px; color: #007bff;">${pairing_code}</div>
          <p style="color: #888; font-size: 14px; margin-top: 20px;">Enter this code in the management panel</p>
        </div>
      </div>
    `;
  }
}

export function WaitingScreen() {
  return `
    <div style="background: #0a0a0a; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif;">
      <div style="text-align: center; max-width: 400px;">
        <div style="font-size: 24px; font-weight: 600; margin-bottom: 15px;">System Ready</div>
        <p style="color: #888; margin-bottom: 30px; line-height: 1.6;">Waiting for content assignment. Please assign a playlist or scene from the dashboard.</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
           <div style="width: 8px; height: 8px; background: #333; border-radius: 50%; animation: pulse 1.5s infinite 0s;"></div>
           <div style="width: 8px; height: 8px; background: #333; border-radius: 50%; animation: pulse 1.5s infinite 0.5s;"></div>
           <div style="width: 8px; height: 8px; background: #333; border-radius: 50%; animation: pulse 1.5s infinite 1s;"></div>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0% { background: #333; transform: scale(1); }
          50% { background: #007bff; transform: scale(1.2); }
          100% { background: #333; transform: scale(1); }
        }
      </style>
    </div>
  `;
}

export function ErrorScreen(message = "An error occurred") {
  return `
    <div style="background: #0a0a0a; color: #fff; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif;">
      <div style="text-align: center; max-width: 500px; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h1 style="font-size: 24px; margin-bottom: 15px; color: #ff6b6b;">System Error</h1>
        <p style="color: #888; line-height: 1.6;">${message}</p>
      </div>
    </div>
  `;
}