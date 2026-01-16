export default function TestPage() {
  // 1. We HARDCODE everything to remove "variables" from the equation.
  // Replace these with your EXACT values from the Dashboard.
  const CLIENT_ID = "app_Urg8gBmxqudKom"; 
  const REDIRECT_URI = "https://churn-buster-v8.vercel.app/api/oauth/callback";
  
  // 2. We build the link manually.
  const link = `https://whop.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid`;

  return (
    <div style={{ padding: 50, fontFamily: 'sans-serif' }}>
      <h1>The Ultimate Truth Test</h1>
      <p>Clicking this button bypasses all your server code.</p>
      
      <div style={{ marginTop: 20, padding: 20, background: '#f0f0f0', borderRadius: 8 }}>
        <strong>The exact link we are testing:</strong><br/>
        <code style={{ wordBreak: 'break-all' }}>{link}</code>
      </div>

      <a href={link} style={{
        display: 'inline-block',
        marginTop: 20,
        padding: '15px 30px',
        background: 'black',
        color: 'white',
        textDecoration: 'none',
        borderRadius: 5,
        fontWeight: 'bold'
      }}>
        Attempt Login (Raw Link)
      </a>
    </div>
  );
}