import Link from 'next/link';

export default function Home() {
  // HARDCODED VALUES (No Variables allowed)
  const CLIENT_ID = "app_MS6Yv4SmtG0TNI"; 
  const REDIRECT_URI = "https://churn-buster-v8.vercel.app/api/oauth/callback";
  
  // The Manual Link
  const link = `https://whop.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid`;

  return (
    <div style={{ padding: 50, background: 'yellow', height: '100vh', color: 'black' }}>
      <h1>⚠️ DEBUG MODE: ACTIVE ⚠️</h1>
      <p>If you can see this yellow screen, your code IS updated.</p>
      
      <h2>Step 1: Verify Identity</h2>
      <p><strong>Client ID:</strong> {CLIENT_ID}</p>
      <p><strong>Redirect:</strong> {REDIRECT_URI}</p>

      <h2>Step 2: The Test</h2>
      <a href={link} style={{
        display: 'inline-block',
        padding: '20px 40px',
        background: 'black',
        color: 'white',
        fontSize: '20px',
        textDecoration: 'none',
        borderRadius: 10
      }}>
        CLICK ME TO LOGIN
      </a>
    </div>
  );
}