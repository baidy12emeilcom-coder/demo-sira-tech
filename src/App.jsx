import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const localNearbyReports = [
  { id: 101, type: '🕳️ Nid-de-poule profond', lieu: 'Axe principal de votre secteur', distance: 'à 50m', statut: 'Validé' },
  { id: 102, type: '💡 Lampadaire en panne', lieu: 'Quartier résidentiel proche', distance: 'à 300m', statut: 'Transmis' }
];

export default function App() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [phone, setPhone] = useState('');
  
  const [step, setStep] = useState('login'); 
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [mobileTab, setMobileTab] = useState('signaler');
  const [type, setType] = useState('accident');
  const [description, setDescription] = useState('');
  
  // AMÉLIORATION 1 : Vraie géolocalisation
  const [userLocation, setUserLocation] = useState('Recherche des coordonnées GPS...');
  const [syncStatus, setSyncStatus] = useState(null);

  // Déclencher la vraie puce GPS au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(`📍 Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
          setUserLocation('⚠️ GPS activé par défaut (Thiès, EPT)');
        }
      );
    }
  }, []);

  // AMÉLIORATION 2 : Vibration du téléphone (Retour haptique)
  const triggerVibration = (pattern = 50) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (nom && prenom && phone) {
      setIsSendingOtp(true);
      triggerVibration(40); // Petite vibration au clic
      setTimeout(() => {
        setIsSendingOtp(false);
        setStep('otp');
        triggerVibration([50, 50, 50]); // Triple petite vibration (réception SMS simulée)
      }, 1200);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode === '221' || otpCode.length === 4) {
      triggerVibration(100); // Vibration de succès
      setStep('app');
    } else {
      triggerVibration([200, 100, 200]); // Vibration d'erreur
      alert("Code OTP incorrect (Astuce Hackathon : tapez 221)");
    }
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    setSyncStatus('sending');
    triggerVibration(50);
    setTimeout(() => {
      setSyncStatus('success');
      triggerVibration([80, 80]); // Double vibration de validation
      setDescription('');
      setTimeout(() => setSyncStatus(null), 3000);
    }, 2000);
  };
  const [imagePreview, setImagePreview] = useState(null);


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {

      setImagePreview(URL.createObjectURL(file));
      

      if (navigator.vibrate) navigator.vibrate(60); 
    }
  };

  return (
    <div className="mobl-fullscreen-app">
      <div className="mobl-phone-screen">
        <header className="mobl-app-header">
          <h2>SiraTech</h2>
          <p>Sénégal • Mode Test Public</p>
        </header>

        <div className="mobl-app-body">
          <AnimatePresence mode="wait">
            
            {/* ÉCRAN 1 : CONNEXION */}
            {step === 'login' && (
              <motion.div key="login" className="mobl-screen-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mobl-auth-intro">
                  <h3>🇸🇳 Identification Citoyenne</h3>
                  <p>Entrez vos informations (fictives ou réelles) pour tester le tunnel de sécurité OTP.</p>
                </div>
                <form onSubmit={handleRequestOtp} className="mobl-form-core">
                  <div className="mobl-input-group">
                    <label>Prénom</label>
                    <input type="text" placeholder="Amadou" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                  </div>
                  <div className="mobl-input-group">
                    <label>Nom</label>
                    <input type="text" placeholder="Ndiaye" value={nom} onChange={(e) => setNom(e.target.value)} required />
                  </div>
                  <div className="mobl-input-group">
                    <label>Numéro de téléphone</label>
                    <input type="tel" placeholder="77 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <button type="submit" className="mobl-btn-submit mobl-btn-dark" disabled={isSendingOtp}>
                    {isSendingOtp ? 'Génération de l\'OTP...' : 'Obtenir le code secret'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ÉCRAN 2 : SAISIE CODE OTP */}
            {step === 'otp' && (
              <motion.div key="otp" className="mobl-screen-auth" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="mobl-auth-intro">
                  <h3>💬 Validation du profil</h3>
                  <p>Simulez la réception du SMS. Tapez le code de l'école ou du pays : <strong>2221</strong>.</p>
                </div>
                <form onSubmit={handleVerifyOtp} className="mobl-form-core">
                  <div className="mobl-input-group">
                    <label style={{ textAlign: 'center', marginBottom: '8px' }}>Code OTP de sécurité</label>
                    <input 
                      type="text" 
                      placeholder="• • • •" 
                      value={otpCode} 
                      onChange={(e) => setOtpCode(e.target.value)} 
                      maxLength={4}
                      style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '6px', fontWeight: 'bold' }}
                      required 
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="mobl-btn-submit">
                    Valider l'identité
                  </button>
                  <p className="mobl-otp-resend" onClick={() => { triggerVibration(30); alert("Nouveau code simulé : 2221"); }}>
                    SMS non reçu ? <span>Renvoyer le code</span>
                  </p>
                </form>
              </motion.div>
            )}

            {/* ÉCRAN 3 : FORMULAIRE DE SIGNALEMENT PRINCIPAL */}
            {step === 'app' && (
              <motion.div key="main-app" className="mobl-screen-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                <div className="mobl-user-badge">
                  <span>👤 Bienvenue, <strong>{prenom} {nom}</strong></span>
                </div>

                <div className="mobl-tabs-nav">
                  <button className={`mobl-tab-link ${mobileTab === 'signaler' ? 'is-active' : ''}`} onClick={() => setMobileTab('signaler')}>
                    ✍️ Signaler
                  </button>
                  <button className={`mobl-tab-link ${mobileTab === 'proximite' ? 'is-active' : ''}`} onClick={() => setMobileTab('proximite')}>
                    📍 Proximité
                  </button>
                </div>

                {mobileTab === 'signaler' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mobl-tab-content">
                    <form onSubmit={handleSubmitReport} className="mobl-form-core">
                      <div className="mobl-input-group">
                        <label>Nature du danger observé</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                          <option value="accident">💥 Accident de la circulation</option>
                          <option value="degradation">🕳️ Nid de poule / Chaussée détruite</option>
                          <option value="eclairage">💡 Absence d'éclairage public</option>
                          <option value="danger">⚠️ Zone à haut risque (Point noir)</option>
                        </select>
                      </div>

                      <div className="mobl-input-group">
                        <label>Votre Position Actuelle (GPS Réel)</label>
                        <div className="mobl-geo-box">
                          <span style={{ color: '#008751', fontWeight: 'bold' }}>{userLocation}</span>
                        </div>
                      </div>

<div className="mobl-input-group">
      <label>Preuve visuelle (Photo du danger)</label>
      
      {!imagePreview ? (
        /* Le label sert de bouton stylé. Cliquer dessus déclenche l'input caché en dessous */
        <label htmlFor="mobl-camera-input" className="mobl-upload-trigger">
          📸 Prendre une photo / Joindre un fichier
          <input 
            id="mobl-camera-input"
            type="file" 
            accept="image/*" 
            capture="environment" /* Force l'ouverture de l'appareil photo arrière sur smartphone */
            onChange={handlePhotoChange}
            style={{ display: 'none' }} /* On cache l'input moche par défaut */
          />
        </label>
      ) : (
        /* Zone d'aperçu de la photo si elle est chargée */
            <div className="mobl-preview-container">
              <img src={imagePreview} alt="Aperçu du danger" className="mobl-image-preview" />
              <button 
                type="button" 
                className="mobl-remove-photo-btn"
                onClick={() => {
                  setImagePreview(null);
                  if (navigator.vibrate) navigator.vibrate(30);
                }}
              >
                ❌ Retirer la photo
              </button>
            </div>
          )}
        </div>
                      <div className="mobl-input-group">
                        <label>Description des faits</label>
                        <textarea 
                          placeholder="Décrivez précisément le danger pour les équipes d'intervention..." 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)} 
                          required 
                        />
                      </div>

                      <button type="submit" className="mobl-btn-submit">
                        Envoyer le signalement
                      </button>
                    </form>
                  </motion.div>
                )}

                {mobileTab === 'proximite' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mobl-tab-content">
                    <p className="mobl-prox-text">Alertes actives à proximité immédiate :</p>
                    <div className="mobl-prox-list">
                      {localNearbyReports.map((report) => (
                        <div key={report.id} className="mobl-prox-card">
                          <div className="mobl-card-row">
                            <strong>{report.type}</strong>
                            <span className="mobl-badge-dist">{report.distance}</span>
                          </div>
                          <p>📍 {report.lieu}</p>
                          <span className="mobl-badge-status">Statut : {report.statut}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Toast de succès */}
          <AnimatePresence>
            {syncStatus && (
              <motion.div className={`mobl-sync-toast ${syncStatus}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
                {syncStatus === 'sending' ? (
                  <div className="mobl-spinner-row">
                    <div className="mobl-loader"></div>
                    <span>Transmission sécurisée...</span>
                  </div>
                ) : (
                  <span>🚀 Alerte envoyée ! Visible instantanément sur le Dashboard d'administration.</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}  

