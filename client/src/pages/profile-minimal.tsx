export default function ProfileMinimal() {
  // Debug: Log when component renders
  console.log("ProfileMinimal component rendering");
  console.log("Window location:", window.location.href);
  console.log("Document ready state:", document.readyState);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          ✅ Page de Profil FONCTIONNE !
        </h1>
        
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#e5e7eb',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          👤
        </div>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '20px',
          fontSize: '16px'
        }}>
          Votre profil TrustMatch
        </p>
        
        <div style={{
          backgroundColor: '#dcfce7',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #16a34a'
        }}>
          <p style={{ fontSize: '14px', color: '#166534', fontWeight: 'bold' }}>
            ✅ SUCCÈS: La page de profil s'affiche correctement !
          </p>
          <p style={{ fontSize: '12px', color: '#166534', marginTop: '5px' }}>
            URL: {window.location.href}
          </p>
        </div>
        
        <button 
          onClick={() => window.location.href = "/"}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%',
            marginBottom: '10px'
          }}
        >
          Retour à l'accueil
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          Actualiser la page
        </button>
      </div>
    </div>
  );
}