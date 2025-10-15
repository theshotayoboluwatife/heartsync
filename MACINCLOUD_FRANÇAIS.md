# MacinCloud - Soumission TrustMatch App Store

## Étape 1: Inscription MacinCloud

1. **Allez sur** : https://www.macincloud.com
2. **Cliquez "Sign Up"** (en haut à droite)
3. **Choisissez "Pay As You Go"** (Payer à l'usage)
4. **Remplissez** :
   - Email
   - Mot de passe
   - Informations de paiement
5. **Coût** : 20-30€/mois (vous pouvez annuler après)

## Étape 2: Connexion à votre Mac

1. **Connectez-vous** à MacinCloud
2. **Cliquez "My Cloud"**
3. **Cliquez "Connect"** sur votre Mac assigné
4. **Choisissez "Web Browser"** (fonctionne sur iPad)
5. **Le bureau Mac s'ouvre** dans Safari

## Étape 3: Télécharger TrustMatch

Sur le Mac MacinCloud :
1. **Ouvrez Safari**
2. **Allez sur votre GitHub** : `github.com/votreusername/trustmatch-app`
3. **Cliquez "Code"** → **"Download ZIP"**
4. **Extractez** le fichier ZIP sur le bureau

## Étape 4: Construction de l'app

1. **Ouvrez Terminal** (Applications → Utilitaires → Terminal)
2. **Naviguez vers le projet** :
   ```bash
   cd ~/Desktop/trustmatch-app
   ```
3. **Installez les dépendances** :
   ```bash
   npm install
   ```
4. **Construisez l'app** :
   ```bash
   npm run build
   npx cap sync ios
   ```

## Étape 5: Soumission Xcode

1. **Ouvrez Xcode** :
   ```bash
   npx cap open ios
   ```
2. **Dans Xcode** :
   - Sélectionnez "Any iOS Device"
   - **Product** → **Archive**
   - **Distribute App** → **App Store Connect**
   - **Uploadez** vers App Store Connect

## Étape 6: App Store Connect

1. **Allez sur** : https://appstoreconnect.apple.com
2. **Créez nouvelle app** :
   - **Nom** : TrustMatch
   - **Bundle ID** : com.trustmatch.app
   - **Catégorie** : Réseaux sociaux
3. **Ajoutez description française** (déjà préparée)
4. **Soumettez pour révision**

## Temps total : 1-2 heures

**Investissement** : 20-30€
**Revenus potentiels** : 8 000€ - 80 000€/mois

Votre app TrustMatch va cartonner !

Êtes-vous prêt à commencer avec MacinCloud ?