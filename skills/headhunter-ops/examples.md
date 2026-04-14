# Examples — Headhunter Ops

## !add — full block

Command:

```text
!add
nom: Sophie Laurent
linkedin: https://linkedin.com/in/sophielaurent
ville: Bruxelles, BE
titre: Data Engineer
stack: Spark, dbt, Airflow
marché: Belgique
source: LinkedIn
owner: Rosy
```

Expected response:

```text
✅ Candidate added
ID: NT-004
Name: Sophie Laurent
Status: new
Score: 0
Next action: Qualifier profil
Next action date: 2026-04-16
Owner: Rosy
```

---

## !add — URL only

Command:

```text
!add https://linkedin.com/in/sophielaurent
```

Expected response:

```text
✅ Candidate added
ID: NT-005
Status: new
Score: 0
Missing fields marked as À qualifier
Next action: Qualifier profil
```

---

## !add — duplicate detected

Command:

```text
!add
nom: Sophie Laurent
linkedin: https://linkedin.com/in/sophielaurent
```

Expected response:

```text
⚠ Duplicate detected
Existing candidate: NT-004
No new candidate created
```

---

## !qualify

Command:

```text
!qualify NT-004
seniorite: mid
langues: FR, EN
dispo: Préavis 2 mois
salaire: 65-75K EUR
```

Expected response:

```text
✅ Candidate updated
ID: NT-004
Updated fields: seniority, languages, availability, salary_expectation
Status: to_review
Next action: Scorer le profil
```

---

## !qualify with force

Command:

```text
!qualify NT-004
stack: Terraform, AWS
force
```

Expected response:

```text
✅ Candidate updated with force
ID: NT-004
Updated fields: stack_main
Last update: 2026-04-16
```

---

## !score generic

Command:

```text
!score NT-004
```

Expected response:

```text
✅ Score assigned
ID: NT-004
Score: 7/10
Reason: [Score générique — sans mission] Stack coherent, seniority aligned, market compatible
Status: shortlisted
Priority: high
Next action: Envoyer profil client
```

---

## !score with mission

Command:

```text
!score NT-004 mission:DataEng-BE-001
```

Expected response:

```text
✅ Score assigned
ID: NT-004
Score: 8/10
Reason: Mission DataEng-BE-001, stack strong match, market fit confirmed
Status: shortlisted
Priority: high
Next action: Envoyer profil client
```

---

## !shortlist

Command:

```text
!shortlist marché:Belgique score:7 owner:Rosy
```

Expected response:

```text
📋 Shortlist — Belgique
NT-004 · Sophie Laurent · 8/10 · shortlisted
NT-007 · Marc Dubois · 7/10 · contacted
NT-002 · Lena Berger · 7/10 · to_review
```

---

## !next

Command:

```text
!next owner:Rosy
```

Expected response:

```text
🔥 Next actions
⚠ EN RETARD · NT-002 · Follow-up call · 2026-04-15
🔴 Aujourd'hui · NT-007 · Relance J+5 · 2026-04-16
🟡 Demain · NT-004 · Envoyer profil client · 2026-04-17
```

---

## !update

Command:

```text
!update NT-004 status:contacted next_action:"Relance J+5" date_action:2026-04-21
```

Expected response:

```text
✅ Candidate updated
ID: NT-004
status: shortlisted -> contacted
next_action: Relance J+5
next_action_date: 2026-04-21
```

---

## !update protected field error

Command:

```text
!update NT-004 full_name:"Autre Nom"
```

Expected response:

```text
❌ Protected field
Field cannot be modified: full_name
```
