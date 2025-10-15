# Configuration du Domaine TrustMatch.com

## Instructions DNS pour votre registrar de domaine

Ajoutez ces enregistrements DNS dans votre panel de contrôle de domaine (là où vous avez acheté trustmarch.com) :

### Option 1 : CNAME (Recommandé)
```
Type: CNAME
Name: www
Value: trustmarch-sshahmizad.replit.app
TTL: 300 (5 minutes)
```

```
Type: CNAME  
Name: @
Value: trustmarch-sshahmizad.replit.app
TTL: 300 (5 minutes)
```

### Option 2 : Redirection
Si votre registrar ne supporte pas CNAME pour le domaine racine, utilisez :
```
Type: A
Name: @
Value: [IP fournie par Replit]
TTL: 300
```

## Configuration Replit

1. Allez dans les paramètres de votre projet Replit
2. Section "Domains" 
3. Ajoutez "trustmarch.com" comme domaine personnalisé
4. Replit fournira automatiquement les certificats SSL

## Statut
- ✅ Code configuré pour accepter trustmarch.com
- ✅ Authentification configurée pour le nouveau domaine
- ⏳ En attente de configuration DNS
- ⏳ En attente de certificat SSL automatique

## Test
Une fois la configuration DNS terminée, votre application sera disponible à :
- https://trustmarch.com
- https://www.trustmarch.com

Les deux redirigeront vers votre application TrustMatch complètement fonctionnelle !