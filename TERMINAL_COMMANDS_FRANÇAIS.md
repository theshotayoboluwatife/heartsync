# Terminal Commands pour TrustMatch App Store

## Étapes dans Terminal (Mac)

### 1. Télécharger le projet TrustMatch
```bash
git clone https://github.com/votre-nom/trustmatch-app.git
cd trustmatch-app
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Préparer le projet iOS
```bash
npx cap sync ios
```

### 4. Ouvrir dans Xcode
```bash
npx cap open ios
```

## Alternative: Si pas de Git
1. Télécharger ZIP depuis GitHub
2. Extraire le dossier
3. Ouvrir Terminal dans le dossier
4. Exécuter les commandes 2-4

## Dans Xcode après ouverture:
1. **Signing & Capabilities** → Sélectionner votre compte Apple Developer
2. **Product → Archive** (sélectionner "Any iOS Device")
3. **Distribute App** → **App Store Connect**
4. **Upload** → Attendre la confirmation

## Informations App Store:
- **Nom**: TrustMatch
- **Bundle ID**: com.trustmatch.app
- **Description**: Application de rencontres française avec système de notation d'honnêteté
- **Prix**: Gratuit avec abonnements premium €9.99/mois

## Votre app est prête!
- ✅ Interface complète en français
- ✅ Système de notation des hommes
- ✅ Mini-défis de conversation
- ✅ Système d'achievements
- ✅ Abonnements premium Stripe

**Potentiel de revenus: €8,000-80,000/mois**

Tapez ces commandes dans Terminal maintenant!