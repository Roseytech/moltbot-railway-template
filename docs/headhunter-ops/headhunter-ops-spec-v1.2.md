# Headhunter Ops — Spec d'implémentation OpenClaw V1.2
**Nexdoor Talent | Couche Discord → Google Sheet**  
Version : 1.2 — Finale build (8 corrections de cohérence)  
Basé sur : Master File V1.2 + Discord Spec V1.0

**Corrections V1.2 :** `!add confirm` intégré dans la grammaire · alias `linkedin:` ajouté · règle de casse des clés clarifiée · lock ID_Rules précisé · contradiction `!shortlist` log résolue · références colonnes remplacées par noms · définition "champ vide" resserrée · normalisation préfixe restreinte aux champs liste · distinctions `source` vs `added_by` clarifiées · mode score générique documenté explicitement

---

## 0. Principes d'implémentation

```
Discord message
    → Parser (extraire commande + arguments)
    → Valider (champs obligatoires, valeurs normalisées)
    → Lire Sheet si besoin (anti-doublon, récupérer ligne)
    → Écrire Sheet (créer ou mettre à jour)
    → Logger dans Automations_Log
    → Retourner confirmation Discord formatée
```

**Règle absolue :** toute écriture dans le Sheet déclenche une mise à jour de `last_update` = date du jour (YYYY-MM-DD).

---

## 1. Grammaire des commandes

### 1.1 Structure générale

```
!<commande> [sous-commande] [identifiant] [clé:valeur ...] [flag]
```

- `<commande>` : mot-clé en minuscules, sans accent (`add`, `qualify`, `score`, `shortlist`, `next`, `update`)
- `[sous-commande]` : mot-clé optionnel immédiatement après la commande. Seule valeur V1 : `confirm` (voir §1.5)
- `[identifiant]` : optionnel selon commande. Format strict : `NT-` suivi d'au moins 3 chiffres (`NT-001`, `NT-042`, `NT-100`)
- `[clé:valeur]` : paires sans espace autour du `:`. Valeur avec espace = guillemets droits obligatoires
- `[flag]` : mot-clé seul en fin de message (`force`, `dry`)

### 1.5 Sous-commande `confirm`

`!add confirm` est la seule sous-commande V1. Elle s'utilise exclusivement après un avertissement `WARN_DOUBLON_PROBABLE`.

```
Séquence :
1. Utilisateur tape !add [données]
2. Agent retourne WARN_DOUBLON_PROBABLE
3. Utilisateur tape !add confirm
4. Agent reprend la création avec les dernières données reçues (stockées en session)
```

**Règles :**
- `!add confirm` sans doublon probable préalable → RETURN `ℹ Aucun doublon signalé. Tape !add [données] normalement.`
- `!add confirm` ne bypasse **jamais** un doublon confirmé (`linkedin_url` identique)
- Les données de la tentative précédente doivent être conservées en mémoire de session pendant 5 minutes maximum
- Si session expirée → `❌ Session expirée. Renvoie !add [données] depuis le début.`

### 1.2 Règles de parsing

| Règle | Détail | Exemple |
|-------|--------|---------|
| Séparateur clé:valeur | `:` sans espace avant ni après | `status:contacted` |
| Valeur multi-mots | Guillemets droits obligatoires | `next_action:"Envoyer profil client"` |
| Valeur avec accent | Accepté tel quel | `localisation:"Bruxelles, BE"` |
| Flag | Mot seul en fin de commande | `!score NT-004 force` |
| Bloc multi-lignes | Chaque ligne = une paire clé:valeur | voir `!add` ci-dessous |
| Casse colonnes | Insensible à la casse en entrée | `Stack:` = `stack:` = `STACK:` |
| Alias de colonnes | Acceptés (table ci-dessous) | `titre:` → `current_title` |

### 1.3 Table d'alias de colonnes

| Alias accepté | Colonne Sheet réelle |
|---------------|----------------------|
| `nom:` | `full_name` |
| `titre:` | `current_title` |
| `société:` / `societe:` / `company:` | `current_company` |
| `ville:` / `localisation:` / `lieu:` | `location` |
| `linkedin:` / `linkedin_url:` | `linkedin_url` |
| `stack:` | `stack_main` |
| `dispo:` | `availability` |
| `marché:` / `marche:` / `market:` | `target_market` |
| `langues:` / `lang:` | `languages` |
| `salaire:` | `salary_expectation` |
| `séniorité:` / `seniorite:` / `seniority:` | `seniority` |
| `mission:` | `assigned_mission` |
| `action:` | `next_action` |
| `date_action:` / `date:` | `next_action_date` |

**Règle de casse et d'accent sur les clés :**  
Les clés sont insensibles à la casse (`Stack:` = `stack:` = `STACK:`).  
Les accents dans les clés sont normalisés automatiquement (`séniorité:` → `seniority:`).  
En revanche, les accents dans les **valeurs** sont préservés tels quels (`nom:"Élodie Dupré"` est valide).  
En pratique : le développeur peut accepter les variantes avec accents listées dans la table d'alias — pas besoin d'un moteur de normalisation général.

### 1.4 Formats de valeurs imposés

| Champ | Format attendu | Rejet si |
|-------|---------------|----------|
| Toute date | `YYYY-MM-DD` | Format ambigu (ex: `14/04/26`) → normaliser automatiquement si possible, sinon erreur |
| `linkedin_url` | Commence par `https://linkedin.com/in/` | URL partielle ou autre domaine |
| `location` | `Ville, XX` (XX = code pays ISO 2 lettres) | Texte libre sans code pays → accepter mais logger warning |
| `languages` | Codes ISO majuscules séparés par `, ` | Noms complets → tenter normalisation (ex: `Français` → `FR`) |
| `fit_score` | Entier 0-10 | Décimal, texte, hors plage |
| Toute valeur de liste | Doit correspondre à une valeur normalisée (voir §2) | Valeur hors liste → erreur bloquante |

---

## 2. Valeurs normalisées (référence parsing)

Le parser valide ces champs contre les listes ci-dessous. Toute valeur hors liste = erreur bloquante.

```
status          : new | to_review | shortlisted | contacted | interview |
                  submitted | offer | placed | on_hold | archived

priority        : high | medium | low

seniority       : junior | mid | senior | lead | executive

target_market   : Belgique | Luxembourg | Suisse | France | Miami | UAE | Multi

source          : LinkedIn | Referral | Manatal | Inbound | Discord | Import

added_by        : manuel | agent | Discord | import

owner           : Rosy | Santiago | agent

manatal_sync_status : not_sent | sent | updated | error

gdpr_consent    : oui | en_attente | non_applicable
```

**Règle de tolérance sur préfixe :** applicable **uniquement** aux champs à valeurs normalisées (§2 : `status`, `priority`, `seniority`, `target_market`, `source`, `added_by`, `owner`, `manatal_sync_status`, `gdpr_consent`).  
Si le préfixe fourni est non ambigu → normaliser automatiquement. Ex: `status:contact` → `contacted`.  
Si ambigu → erreur bloquante + liste des valeurs possibles.  
**Ne pas appliquer** cette tolérance aux champs texte libre (`full_name`, `notes`, `stack_main`, etc.).

---

## 3. Champs autorisés par commande

### 3.1 `!add` — champs acceptés en entrée

| Champ | Alias | Obligatoire | Valeur par défaut si absent |
|-------|-------|-------------|----------------------------|
| `full_name` | `nom:` | OUI | — (erreur si absent + pas d'URL) |
| `linkedin_url` | — | OUI (si pas de nom) | — |
| `location` | `ville:`, `lieu:` | Recommandé | `À qualifier` |
| `current_title` | `titre:` | Recommandé | `À qualifier` |
| `current_company` | `société:`, `company:` | Non | `À qualifier` |
| `seniority` | — | Non | `À qualifier` |
| `stack_main` | `stack:` | Recommandé | `À qualifier` |
| `target_role` | — | Non | = `current_title` si absent |
| `target_market` | `marché:`, `market:` | Non | `À qualifier` |
| `languages` | `lang:` | Non | `À qualifier` |
| `availability` | `dispo:` | Non | `À qualifier` |
| `source` | — | Non | `LinkedIn` |
| `assigned_mission` | `mission:` | Non | vide |
| `owner` | — | Non | `Rosy` |

**Distinction `source` vs `added_by` :**

| Champ | Sens | Valeur par défaut via Discord |
|-------|------|-------------------------------|
| `added_by` | Canal d'entrée dans le système (qui/quoi a créé la ligne) | `Discord` — auto-généré, non modifiable |
| `source` | Origine du lead candidat (où le profil a été trouvé) | `LinkedIn` — à renseigner explicitement |

Les deux coexistent sans redondance : `added_by=Discord` signifie "créé via Discord", `source=LinkedIn` signifie "profil trouvé sur LinkedIn". Ne pas confondre.

**Champs générés automatiquement (non acceptés en entrée) :**

| Champ | Valeur générée |
|-------|---------------|
| `candidate_id` | NT-XXX (incrémental depuis ID_Rules) |
| `date_added` | date du jour YYYY-MM-DD |
| `added_by` | `Discord` |
| `status` | `new` |
| `priority` | `medium` |
| `fit_score` | `0` |
| `manatal_sync_status` | `not_sent` |
| `next_action` | `Qualifier profil` |
| `next_action_date` | date du jour + 2 jours |
| `last_update` | date du jour |

### 3.2 `!qualify` — champs modifiables

Tous les champs de `!add` sauf les champs générés automatiquement.

**Définition de "champ vide" (condition pour écriture sans `force`) :**

| Champ | Considéré vide si |
|-------|-------------------|
| Champ texte | Cellule vide OU valeur = `À qualifier` |
| `fit_score` | Valeur = `0` (zéro numérique) |
| Champ liste normalisée | Cellule vide OU valeur absente de la liste normalisée |

La règle `valeur = 0 → vide` s'applique **uniquement** à `fit_score`, pas aux autres champs numériques.

Sans le flag `force`, seuls les champs vides (selon la table ci-dessus) sont modifiés.  
Avec `force`, écraser autorisé sur tout champ sauf les champs protégés.

**Champs protégés (jamais modifiables via `!qualify`) :**
`candidate_id`, `date_added`, `added_by`

### 3.3 `!score` — champs modifiables

| Champ | Valeur après scoring |
|-------|---------------------|
| `fit_score` | entier calculé 0-10 |
| `fit_reason` | texte généré par l'agent |
| `status` | calculé selon score (voir §4.3) |
| `priority` | calculé selon score (voir §4.3) |
| `last_update` | date du jour |
| `next_action` | calculé selon score |
| `next_action_date` | date du jour + 1 si score ≥ 7, + 3 sinon |

### 3.4 `!update` — champs autorisés

**Liste blanche stricte :**
```
status | priority | availability | assigned_mission | notes |
next_action | next_action_date | owner | manatal_sync_status |
manatal_id | gdpr_consent | fit_score | fit_reason | salary_expectation
```

**Champs protégés (rejet immédiat) :**
```
candidate_id | date_added | added_by | linkedin_url | full_name
```

Si tentative de modification d'un champ protégé → erreur bloquante + message explicite.

---

## 4. Pseudo-logique d'exécution

### 4.1 `!add`

```
PARSE message → extraire champs
IF linkedin_url présente:
    QUERY Sheet colonne linkedin_url
    IF trouvé → RETURN erreur doublon (NT-XXX existant)
ELSE IF full_name absent:
    RETURN erreur "nom ou URL requis"

READ ID_Rules → récupérer dernier_id
nouveau_id = incrémenter(dernier_id)  # NT-001 → NT-002 etc.
UPDATE ID_Rules → écrire nouveau dernier_id

Construire ligne avec :
    - champs fournis (validés + normalisés)
    - champs manquants → valeurs par défaut (§3.1)
    - champs auto-générés (§3.1)

WRITE Candidates_Master → nouvelle ligne
WRITE Automations_Log → {timestamp, nouveau_id, "add_candidate", "Discord", "Sheet", "success", résumé}
RETURN confirmation Discord formatée + suggestion !qualify si champs manquants
```

**Verrou candidate_id — comportement exact :**

```
# Cellule ID_Rules!B2 = valeur du lock ("0" = libre, "1" = occupé)
# Cellule ID_Rules!B13 = dernier ID attribué (ex: "NT-003")

LOCK_READ : lire ID_Rules!B2
IF lock == "1":
    attendre 2 secondes, relire (max 3 tentatives)
    IF toujours "1" après 3 tentatives:
        RETURN ERR_LOCK_TIMEOUT : "❌ Système occupé. Réessaie dans quelques secondes."
        NE PAS créer le candidat

SET ID_Rules!B2 = "1"           # acquérir le lock
READ ID_Rules!B13 → dernier_id
nouveau_id = incrémenter(dernier_id)
WRITE Candidates_Master → nouvelle ligne NT-XXX
WRITE ID_Rules!B13 = nouveau_id  # mettre à jour le compteur
SET ID_Rules!B2 = "0"            # libérer le lock (toujours, même en cas d'erreur)
```

En pratique V1 : le lock ne sera déclenché que si Discord et Make écrivent simultanément. La fenêtre de collision est de quelques secondes. Trois tentatives + délai de 2s = protection suffisante.

### 4.2 `!qualify`

```
PARSE message → extraire candidate_id + champs
QUERY Sheet → chercher ligne avec candidate_id
IF non trouvé → RETURN erreur

FOREACH champ fourni:
    IF champ protégé → ignorer silencieusement
    IF flag force:
        écraser la valeur
    ELSE:
        IF cellule vide OR valeur == "À qualifier" OR valeur == 0:
            écrire la nouvelle valeur
        ELSE:
            signaler dans la réponse "champ déjà rempli, ignoré : [champ]=[valeur actuelle]"

IF tous les champs noyau sont remplis (non "À qualifier"):
    IF status == "new": SET status = "to_review"
    SET next_action = "Scorer le profil"
    SET next_action_date = aujourd'hui + 1 jour

SET last_update = aujourd'hui
WRITE Candidates_Master
WRITE Automations_Log
RETURN confirmation + liste champs mis à jour + champs ignorés
```

### 4.3 `!score`

```
PARSE message → extraire candidate_id + mission (optionnel)
QUERY Sheet → chercher ligne avec candidate_id
IF non trouvé → RETURN erreur

IF stack_main vide OR stack_main == "À qualifier":
    RETURN erreur "qualifier d'abord"

IF fit_score >= 7 AND NOT flag force:
    RETURN avertissement + demander confirmation force

# Scoring (5 questions)
score = 0
reason_parts = []

# Q1 : Stack (0-3)
q1 = évaluer alignement stack_main vs mission ou profil général
score += q1_pts ; reason_parts.append(résumé Q1)

# Q2 : Séniorité (0-2)
q2 = évaluer seniority vs besoin mission
score += q2_pts ; reason_parts.append(résumé Q2)

# Q3 : Disponibilité (0-2)
q3 = parser availability → catégoriser (immédiate=2, ≤2mois=1, >2mois=0)
score += q3_pts ; reason_parts.append(résumé Q3)

# Q4 : Marché + autorisation (0-2)
q4 = vérifier target_market vs mission_market (si connu)
score += q4_pts ; reason_parts.append(résumé Q4)

# Q5 : Salaire (0-1)
q5 = évaluer salary_expectation vs budget mission (si connu), sinon 0
score += q5_pts ; reason_parts.append(résumé Q5)

# Bonus
bonus = détecter certif / langue rare / recommandation dans notes ou stack
score = min(10, score + bonus)

# Déduction status/priority
IF score >= 9 : status = "shortlisted" ; priority = "high"
IF score >= 7 : status = "shortlisted" ; priority = "high"
IF score >= 5 : status = "to_review"   ; priority = "medium"
IF score >= 3 : status = "to_review"   ; priority = "low"
IF score <  3 : status = "to_review"   ; priority = "low"  # ne pas auto-archiver

WRITE fit_score, fit_reason, status, priority, next_action, next_action_date, last_update
WRITE Automations_Log
RETURN confirmation Discord avec score + raison + status + prochaine action
```

**Deux modes de scoring :**

| Mode | Déclenchement | Référence pour Q1/Q2/Q4 | Mention obligatoire dans `fit_reason` |
|------|--------------|-------------------------|---------------------------------------|
| Score générique | `!score NT-XXX` | Profil seul — évaluation intrinsèque sans mission définie | Commencer par `[Score générique — sans mission]` |
| Score mission | `!score NT-XXX mission:DataEng-BE-001` | Comparaison explicite avec la mission assignée | Mentionner le nom de la mission |

En mode générique, Q1 évalue la cohérence interne du profil (stack vs target_role), Q2 évalue la séniorité telle que renseignée, Q4 évalue la compatibilité du marché cible avec les marchés actifs de Nexdoor Talent.

### 4.4 `!shortlist`

```
PARSE message → extraire filtres (mission, marché, score_min, owner)
score_min défaut = 6

QUERY Sheet Candidates_Master avec filtres :
    status NOT IN (archived, placed)
    fit_score >= score_min
    IF mission → assigned_mission == mission
    IF marché → target_market == marché
    IF owner → owner == owner

SORT par fit_score DESC
LIMIT 5 résultats

IF 0 résultats:
    COUNT profils status=to_review pour suggérer prochaine action
    RETURN message 0 résultat + suggestion

IF mission précisé:
    WRITE Lists_Shortlists → ajouter bloc horodaté (vue de travail, pas source de vérité)
    WRITE Automations_Log → action "shortlist_generated", source "Discord", target "Lists_Shortlists"
    # Note : c'est la seule situation où !shortlist génère une ligne de log
    #        (car il y a une écriture effective dans Lists_Shortlists)
    # Sans mission précisé → lecture seule → PAS de ligne de log

RETURN liste Discord formatée (5 lignes max)
```

### 4.5 `!next`

```
PARSE message → extraire filtres (owner, marché, mission)

QUERY Sheet Candidates_Master :
    status NOT IN (archived, placed)
    next_action NOT vide
    IF owner → owner == owner
    IF marché → target_market == marché

SORT par :
    1. priority DESC (high > medium > low)
    2. next_action_date ASC

FOREACH résultat:
    IF next_action_date < aujourd'hui → préfixer "⚠ EN RETARD"
    IF next_action_date == aujourd'hui → préfixer "🔴 Aujourd'hui"
    IF next_action_date == demain → préfixer "🟡 Demain"
    SINON → préfixer "🟢 [date]"

LIMIT 5 résultats
RETURN liste Discord formatée
```

### 4.6 `!update`

```
PARSE message → extraire candidate_id + paires champ:valeur + flag force
QUERY Sheet → chercher ligne

FOREACH champ fourni:
    IF champ dans liste protégée → RETURN erreur bloquante
    IF champ PAS dans liste blanche → RETURN erreur bloquante
    valider valeur selon type (normaliser, vérifier liste si applicable)
    écrire nouvelle valeur

SET last_update = aujourd'hui
WRITE Automations_Log
RETURN confirmation avec valeurs avant/après pour chaque champ modifié
```

---

## 5. Gestion des doublons

**Séquence de détection (dans l'ordre) :**

```
1. Chercher la valeur de linkedin_url dans la colonne "linkedin_url" (Candidates_Master)
   → Match exact (insensible à la casse, espaces supprimés) → DOUBLON CONFIRMÉ
   → Bloquer + retourner : "⚠ Doublon détecté. Profil existant : NT-XXX (full_name). Aucune création."

2. Si linkedin_url absente de l'input OU non trouvée en étape 1 :
   Chercher full_name dans la colonne "full_name" (insensible à la casse)
   ET current_company dans la colonne "current_company" (insensible à la casse)
   → Si les deux matchent → DOUBLON PROBABLE → avertir sans bloquer :
     "⚠ Un profil similaire existe peut-être : NT-XXX [full_name] chez [current_company].
      Tape !add confirm pour forcer la création."

3. Si aucun match → procéder à la création
```

**Commande de confirmation :**
```
!add confirm
```
→ Bypasse l'avertissement doublon probable et procède à la création.  
Ne bypasse PAS un doublon confirmé (linkedin_url identique).

---

## 6. Gestion du journal (Automations_Log)

Chaque écriture dans Candidates_Master génère une ligne dans `Automations_Log` :

| Champ | Valeur |
|-------|--------|
| `timestamp` | datetime ISO : `YYYY-MM-DD HH:MM` |
| `candidate_id` | NT-XXX |
| `action` | `add_candidate` / `qualify_candidate` / `score_candidate` / `update_field` / `shortlist_generated` |
| `source` | `Discord` / `Make` / `manuel` |
| `target` | `Candidates_Master` / `Lists_Shortlists` |
| `status` | `success` / `error` / `warning` |
| `detail` | résumé en 1 ligne (champs modifiés, erreur rencontrée, etc.) |

**Règle de log :**
- Toute **écriture** dans `Candidates_Master` ou `Lists_Shortlists` → ligne de log obligatoire
- `!next` → lecture seule → **pas de log**
- `!shortlist` sans `mission:` → lecture seule → **pas de log**
- `!shortlist` avec `mission:` → écriture dans `Lists_Shortlists` → **log généré** (action `shortlist_generated`)

---

## 7. Erreurs — cas prioritaires

| Code | Déclencheur | Message Discord | Bloquant |
|------|-------------|-----------------|----------|
| ERR_LOCK_TIMEOUT | Cellule lock ID_Rules occupée après 3 tentatives | `❌ Système occupé. Réessaie dans quelques secondes.` | OUI |
| ERR_DOUBLON | linkedin_url déjà présente | `⚠ Doublon détecté. Profil existant : NT-XXX (Nom). Aucune création.` | OUI |
| ERR_ID_MANQUANT | !qualify / !score / !update sans NT-XXX valide | `❌ Identifiant manquant ou invalide. Format attendu : NT-XXX` | OUI |
| ERR_ID_INTROUVABLE | NT-XXX non trouvé dans le Sheet | `❌ NT-XXX non trouvé dans Candidates_Master.` | OUI |
| ERR_CHAMP_PROTEGE | Tentative de modif candidate_id / date_added / linkedin_url | `❌ Ce champ ne peut pas être modifié : [champ].` | OUI |
| ERR_VALEUR_HORS_LISTE | Valeur non normalisée sur un champ liste | `❌ Valeur invalide pour [champ] : "[valeur]". Valeurs acceptées : [liste]` | OUI |
| ERR_STACK_MANQUANTE | !score sur profil sans stack_main | `❌ Score impossible : stack_main manquante. Lance !qualify NT-XXX d'abord.` | OUI |
| WARN_SCORE_EXISTANT | !score sur profil avec fit_score >= 7 sans force | `⚠ Score existant : X/10. Ajoute 'force' pour re-scorer.` | NON |
| WARN_CHAMP_PLEIN | !qualify sans force sur champ déjà rempli | `ℹ [champ] déjà rempli ([valeur actuelle]), ignoré. Ajoute 'force' pour écraser.` | NON |
| WARN_DOUBLON_PROBABLE | Nom + société similaires sans linkedin_url | `⚠ Profil similaire possible : NT-XXX. Tape !add confirm pour forcer la création.` | NON |
| ERR_FORMAT_DATE | Date non parseable | `❌ Format de date invalide : "[valeur]". Format attendu : YYYY-MM-DD` | OUI |
| ERR_SHEET_WRITE | Échec écriture Google Sheet | `❌ Erreur d'écriture dans le Sheet. Action loggée. Réessaie ou contacte Rosy.` | OUI |

---

## 8. Exemples de messages Discord complets

### Ajout avec bloc
```
!add
nom: Amara Diallo
linkedin: https://linkedin.com/in/amaradiallo
ville: Miami, US
titre: Cybersecurity Analyst
stack: SIEM, Splunk, SOC
marché: Miami
dispo: Immédiate
source: LinkedIn
owner: Santiago
```

### Ajout rapide URL seule
```
!add https://linkedin.com/in/amaradiallo
```

### Qualification
```
!qualify NT-005
seniorite: junior
langues: EN
salaire: 55-65K USD
```

### Score avec mission
```
!score NT-005 mission:SOC-Miami-001
```

### Update multi-champs
```
!update NT-005 status:contacted next_action:"Relance J+5" date_action:2026-04-21
```

### Shortlist filtrée
```
!shortlist marché:Miami score:5 owner:Santiago
```

### Next actions de Santiago
```
!next owner:Santiago
```

---

*Spec d'implémentation V1.2 — Nexdoor Talent — Headhunter Ops*  
*Finale build — 8 corrections de cohérence appliquées — Prêt pour build OpenClaw — Skill `add_candidate` en premier*
