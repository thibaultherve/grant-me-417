# Analyse de performance — POST /work-entries/week

> **Objectif** : Comprendre pourquoi la sauvegarde des heures de travail prend 10+ secondes et évaluer toutes les solutions possibles.

---

## Table des matières

1. [Flux actuel détaillé](#1-flux-actuel-détaillé)
2. [Analyse de la cause racine](#2-analyse-de-la-cause-racine)
3. [Quantification du problème](#3-quantification-du-problème)
4. [Solutions proposées](#4-solutions-proposées)
   - [A. Optimiser le serveur (batching)](#a-optimiser-le-serveur-actuel-batching)
   - [B. Triggers PostgreSQL](#b-triggers-postgresql)
   - [C. Procédures stockées / Fonctions SQL](#c-procédures-stockées--fonctions-sql)
   - [D. Calcul côté client](#d-calcul-côté-client)
   - [E. Job queue asynchrone (BullMQ)](#e-job-queue-asynchrone-bullmq)
   - [F. Vues matérialisées](#f-vues-matérialisées)
   - [G. Approche hybride (recommandée)](#g-approche-hybride-recommandée)
5. [Tableau comparatif](#5-tableau-comparatif)
6. [Recommandation finale](#6-recommandation-finale)

---

## 1. Flux actuel détaillé

### Ce que fait l'endpoint

`POST /api/work-entries/week` reçoit les heures d'un employeur pour une semaine (7 jours).

**Fichiers impliqués** :
- `server/src/work-entries/work-entries.controller.ts:44-50` — Point d'entrée HTTP
- `server/src/work-entries/work-entries.service.ts:130-213` — Logique métier
- `server/src/visas/visa-progress.service.ts:166-218` — Recalcul de progression
- `shared/src/schemas/work-entry.ts` — Validation Zod
- `shared/src/constants/visa-rules.ts` — Seuils heures→jours

### Payload envoyé par le client

```json
{
  "employerId": "uuid",
  "entries": [
    { "workDate": "2025-01-06", "hours": 8 },
    { "workDate": "2025-01-07", "hours": 8.5 },
    { "workDate": "2025-01-08", "hours": 0 },
    { "workDate": "2025-01-09", "hours": 7 },
    { "workDate": "2025-01-10", "hours": 0 },
    { "workDate": "2025-01-11", "hours": 0 },
    { "workDate": "2025-01-12", "hours": 0 }
  ]
}
```

### Chaîne d'appels complète

```
HTTP POST /api/work-entries/week
│
├── [JwtAuthGuard] — Vérifie le JWT
├── [ZodValidationPipe] — Valide le body (saveWeekHoursSchema)
│
└── WorkEntriesService.saveWeekHours(userId, body)
    │
    ├── 🔍 Q1: Employer.findUnique(employerId) — Vérifie propriété
    ├── 🔍 Q2: WorkEntry.findMany({userId, employerId, dates}) — Entrées existantes
    ├── 🗑️ Q3: WorkEntry.deleteMany() — Supprime les entrées à 0h
    │
    ├── 📝 Q4-Q10: WorkEntry.upsert() × N — Un par jour avec heures > 0
    │   (typiquement 3-5 upserts par semaine)
    │
    └── 🔄 BOUCLE SUR CHAQUE DATE AFFECTÉE (7 dates) ← GOULOT D'ÉTRANGLEMENT
        │
        └── visaProgress.refreshWeekForDate(userId, date) × 7
            │
            ├── 🔍 Q: UserVisa.findMany({arrivalDate ≤ date ≤ expiryDate})
            │   → Trouve les visas couvrant cette date (1 à 3 visas)
            │
            └── BOUCLE SUR CHAQUE VISA (jusqu'à 3)
                │
                ├── calculateWeeklyProgress(visaId, weekStart, weekEnd)
                │   ├── 🔍 Q: UserVisa.findUnique(visaId)
                │   ├── 🔍 Q: WorkEntry.findMany({userId, dates in week range})
                │   │   + JOIN employer.isEligible
                │   └── Calcul en mémoire: totalHours, eligibleHours → eligibleDays
                │
                ├── 🔍 Q: VisaWeeklyProgress.findUnique({visaId, weekStart})
                ├── 📝 Q: VisaWeeklyProgress.update() ou .create()
                │
                └── calculateVisaProgress(visaId)
                    ├── 🔍 Q: VisaWeeklyProgress.findMany({visaId}) — TOUTES les semaines
                    ├── Calcul en mémoire: sum(eligibleDays), sum(daysWorked)
                    └── 📝 Q: UserVisa.update({progressPercentage, isEligible, ...})
```

### Conversion heures → jours (business rule)

| Heures éligibles/semaine | Jours éligibles |
|--------------------------|----------------|
| < 6h                     | 0 jours        |
| 6-11h                    | 1 jour         |
| 12-17h                   | 2 jours        |
| 18-23h                   | 3 jours        |
| 24-29h                   | 4 jours        |
| 30h+                     | 7 jours        |

Défini dans `shared/src/constants/visa-rules.ts:13-19`.

---

## 2. Analyse de la cause racine

### Problème principal : explosion de requêtes N+1

Le code actuel dans `work-entries.service.ts:208-210` boucle sur chaque date affectée :

```typescript
for (const dateStr of affectedDates) {
  await this.visaProgress.refreshWeekForDate(userId, dateStr);
}
```

Et `refreshWeekForDate()` (`visa-progress.service.ts:166-218`) boucle sur chaque visa, chacun déclenchant 6-7 requêtes.

### Problèmes identifiés

| # | Problème | Localisation | Impact |
|---|----------|-------------|--------|
| 1 | **Boucle séquentielle par date** | `work-entries.service.ts:208-210` | 7 appels séquentiels |
| 2 | **Re-query des work entries à chaque itération** | `visa-progress.service.ts:54-67` | Données identiques re-fetchées 7×3=21 fois |
| 3 | **Boucle par visa sans batching** | `visa-progress.service.ts:175-217` | 3 visas × 7 queries chacun |
| 4 | **calculateVisaProgress() refetch ALL weekly rows** | `visa-progress.service.ts:99` | Fetch ~52 rows par visa, boucle JS pour SUM |
| 5 | **Upserts individuels (pas de batch)** | `work-entries.service.ts:179-198` | 5-7 requêtes au lieu de 1 |
| 6 | **Pas de transaction** | Tout le flux | Pas d'optimisation de connexion |

### L'ironie : le bon pattern existe déjà

`visa-progress.service.ts:225-323` contient `refreshAllWeeksForVisa()` qui :
- Fetch les données UNE seule fois
- Groupe en mémoire par semaine
- Met à jour en batch avec `$executeRaw`

Mais `refreshWeekForDate()` (appelé par `saveWeekHours`) n'utilise PAS ce pattern optimisé.

---

## 3. Quantification du problème

### Scénario typique : 1 semaine, 1 employeur, 3 visas

| Phase | Requêtes | Détail |
|-------|----------|--------|
| Validation | 1 | Employer ownership |
| Fetch existants | 1 | WorkEntry.findMany |
| Suppressions | 1 | deleteMany |
| Upserts | 5 | 5 jours avec heures > 0 |
| **Progress par date** | **7 × (1 + 3 × 6)** = **133** | 7 dates × (findVisas + 3 visas × 6 queries) |
| **TOTAL** | **~141 requêtes** | |

### Estimation du temps

- **Latence Railway intra-région** : ~2-5ms par requête simple
- **Requêtes avec JOINs** : ~5-15ms
- **calculateVisaProgress (fetch ~52 rows)** : ~10-20ms

| Composant | Temps estimé |
|-----------|-------------|
| Validation + fetch | ~20ms |
| Upserts (5×) | ~25ms |
| Progress loop (133 queries × ~5ms) | **~665ms** |
| calculateVisaProgress (21× × ~15ms) | **~315ms** |
| Overhead Node.js (await chains, serialization) | ~200ms |
| **TOTAL estimé** | **~1.2s** |

> **Hmm, 1.2s ≠ 10s.** D'où vient le reste ?

### Facteurs aggravants probables

1. **Latence Railway réelle** : la latence intra-Railway peut varier (cold starts, connection pool saturation, shared infrastructure). Si la latence moyenne est ~30-50ms au lieu de 5ms → **~5-7s**
2. **Connection pool Prisma** : Prisma ouvre/ferme des connexions. Avec 141 requêtes séquentielles, le pool peut saturer → attente de connexions disponibles
3. **Cold start du serveur NestJS** : si le serveur est en sleep (Railway free tier ou scale-to-zero)
4. **Pas de transaction** : chaque requête est une transaction implicite séparée
5. **Serialization overhead** : Prisma génère du SQL, parse les résultats, convertit les Decimal... 141 fois
6. **Côté client** : après le save, `invalidateQueries({ queryKey: queryKeys.hours.all })` refetch TOUTES les queries hours (list, employer, month)

---

## 4. Solutions proposées

---

### A. Optimiser le serveur actuel (batching)

**Principe** : Appliquer le pattern de `refreshAllWeeksForVisa()` au flux `saveWeekHours()`. Fetch une fois, calcule en mémoire, batch update en SQL.

**Implémentation** :

```typescript
// Nouveau: refreshWeeksForDates(userId, dates[]) remplace la boucle
async refreshWeeksForDates(userId: string, affectedDates: string[]) {
  // 1. Trouver toutes les semaines uniques affectées
  const weekRanges = getUniqueWeekRanges(affectedDates);

  // 2. Fetch TOUTES les entrées de travail pour ces semaines EN UNE SEULE REQUÊTE
  const allEntries = await this.prisma.workEntry.findMany({
    where: { userId, workDate: { gte: minDate, lte: maxDate } },
    include: { employer: { select: { isEligible: true } } },
  });

  // 3. Fetch tous les visas de l'utilisateur EN UNE SEULE REQUÊTE
  const visas = await this.prisma.userVisa.findMany({
    where: { userId },
  });

  // 4. Calcul en mémoire (pur, pas de DB)
  const weeklyProgressUpdates = computeAllWeeklyProgress(allEntries, visas, weekRanges);

  // 5. Batch upsert via $executeRaw (1 seule requête SQL)
  await this.prisma.$executeRaw`
    INSERT INTO visa_weekly_progress (...)
    VALUES ${weeklyProgressUpdates}
    ON CONFLICT (user_visa_id, week_start_date)
    DO UPDATE SET ...
  `;

  // 6. Recalcul des agrégats visa via SQL SUM (1 requête par visa)
  for (const visa of affectedVisas) {
    await this.prisma.$executeRaw`
      UPDATE user_visa SET
        eligible_days = (SELECT SUM(eligible_days) FROM visa_weekly_progress WHERE user_visa_id = ${visa.id}),
        days_worked = (SELECT SUM(days_worked) FROM visa_weekly_progress WHERE user_visa_id = ${visa.id}),
        ...
      WHERE id = ${visa.id}
    `;
  }
}
```

**Requêtes résultantes** : ~5-8 au lieu de ~141

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Réduction drastique des requêtes (141 → ~8) | ❌ Refactoring significatif de visa-progress.service.ts |
| ✅ Pas de nouvelle dépendance infra | ❌ SQL brut ($executeRaw) plus complexe à maintenir |
| ✅ Temps de réponse estimé : **< 100ms** | ❌ Logique métier dupliquée (mémoire + SQL) |
| ✅ Le pattern existe déjà dans le code | ❌ Tests à réécrire/adapter |
| ✅ Consistency immédiate (synchrone) | |
| ✅ Compatible avec l'archi actuelle | |

**Complexité** : ⭐⭐⭐ (Moyenne)
**Temps estimé** : 2-3 jours

---

### B. Triggers PostgreSQL

**Principe** : Le recalcul de progression se déclenche automatiquement côté DB quand une work_entry est insérée/modifiée/supprimée.

**Implémentation** :

```sql
-- Fonction de recalcul d'une semaine
CREATE OR REPLACE FUNCTION recalculate_week_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_week_start DATE;
  v_week_end DATE;
  v_visa RECORD;
  v_total_hours DECIMAL;
  v_eligible_hours DECIMAL;
  v_eligible_days INT;
  v_days_worked INT;
BEGIN
  -- Calculer le lundi de la semaine
  v_week_start := date_trunc('week', COALESCE(NEW.work_date, OLD.work_date))::DATE;
  v_week_end := v_week_start + INTERVAL '6 days';

  -- Pour chaque visa couvrant cette date
  FOR v_visa IN
    SELECT * FROM user_visa
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND arrival_date <= v_week_end AND expiry_date >= v_week_start
  LOOP
    -- Calculer heures de la semaine
    SELECT
      COALESCE(SUM(we.hours), 0),
      COALESCE(SUM(CASE WHEN e.is_eligible THEN we.hours ELSE 0 END), 0),
      COUNT(DISTINCT we.work_date)
    INTO v_total_hours, v_eligible_hours, v_days_worked
    FROM work_entry we
    JOIN employer e ON e.id = we.employer_id
    WHERE we.user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND we.work_date BETWEEN GREATEST(v_week_start, v_visa.arrival_date)
                         AND LEAST(v_week_end, v_visa.expiry_date);

    -- Conversion heures → jours
    v_eligible_days := CASE
      WHEN v_eligible_hours >= 30 THEN 7
      WHEN v_eligible_hours >= 24 THEN 4
      WHEN v_eligible_hours >= 18 THEN 3
      WHEN v_eligible_hours >= 12 THEN 2
      WHEN v_eligible_hours >= 6 THEN 1
      ELSE 0
    END;

    -- Upsert weekly progress
    INSERT INTO visa_weekly_progress (id, user_visa_id, week_start_date, week_end_date,
                                       hours, eligible_hours, eligible_days, days_worked)
    VALUES (gen_random_uuid(), v_visa.id, v_week_start, v_week_end,
            v_total_hours, v_eligible_hours, v_eligible_days, v_days_worked)
    ON CONFLICT (user_visa_id, week_start_date)
    DO UPDATE SET hours = EXCLUDED.hours, eligible_hours = EXCLUDED.eligible_hours,
                  eligible_days = EXCLUDED.eligible_days, days_worked = EXCLUDED.days_worked,
                  updated_at = NOW();

    -- Recalcul agrégat visa
    UPDATE user_visa SET
      eligible_days = (SELECT COALESCE(SUM(eligible_days), 0) FROM visa_weekly_progress WHERE user_visa_id = v_visa.id),
      days_worked = (SELECT COALESCE(SUM(days_worked), 0) FROM visa_weekly_progress WHERE user_visa_id = v_visa.id),
      days_remaining = GREATEST(0, days_required - (SELECT COALESCE(SUM(eligible_days), 0) FROM visa_weekly_progress WHERE user_visa_id = v_visa.id)),
      progress_percentage = ROUND((SELECT COALESCE(SUM(eligible_days), 0) FROM visa_weekly_progress WHERE user_visa_id = v_visa.id)::DECIMAL / days_required * 100, 2),
      is_eligible = (SELECT COALESCE(SUM(eligible_days), 0) FROM visa_weekly_progress WHERE user_visa_id = v_visa.id) >= days_required,
      updated_at = NOW()
    WHERE id = v_visa.id;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trg_work_entry_progress
  AFTER INSERT OR UPDATE OR DELETE ON work_entry
  FOR EACH ROW EXECUTE FUNCTION recalculate_week_progress();
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Zéro latence réseau (tout côté DB) | ❌ **Logique métier dans le SQL** — très dur à tester |
| ✅ Garantie de cohérence (transactionnelle) | ❌ **Duplication de la business rule** heures→jours |
| ✅ Se déclenche automatiquement | ❌ Debugging difficile (pas de logs applicatifs) |
| ✅ Fonctionne même avec des inserts directs | ❌ **Migration complexe** (trigger + function SQL) |
| ✅ Temps de réponse : **< 50ms** | ❌ Couplage fort entre schema et logique |
| | ❌ Prisma ne gère pas nativement les triggers |
| | ❌ Le trigger s'exécute par ROW → N triggers par save (mais côté DB = rapide) |
| | ❌ Difficile à modifier quand les règles métier changent |

**Complexité** : ⭐⭐⭐⭐ (Élevée)
**Temps estimé** : 3-4 jours

---

### C. Procédures stockées / Fonctions SQL

**Principe** : Remplacer toute la logique de `saveWeekHours()` + recalcul par une seule fonction SQL appelée via `$queryRaw`.

**Implémentation** :

```sql
CREATE OR REPLACE FUNCTION save_week_hours(
  p_user_id UUID,
  p_employer_id UUID,
  p_entries JSONB  -- [{"workDate": "2025-01-06", "hours": 8}, ...]
) RETURNS JSON AS $$
DECLARE
  v_entry JSONB;
  v_deleted INT := 0;
  v_saved INT := 0;
  v_affected_weeks DATE[];
BEGIN
  -- 1. Upsert/delete toutes les entrées en une passe
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries) LOOP
    IF (v_entry->>'hours')::DECIMAL > 0 THEN
      INSERT INTO work_entry (id, user_id, employer_id, work_date, hours)
      VALUES (gen_random_uuid(), p_user_id, p_employer_id,
              (v_entry->>'workDate')::DATE, (v_entry->>'hours')::DECIMAL)
      ON CONFLICT (user_id, employer_id, work_date)
      DO UPDATE SET hours = EXCLUDED.hours, updated_at = NOW();
      v_saved := v_saved + 1;
    ELSE
      DELETE FROM work_entry
      WHERE user_id = p_user_id AND employer_id = p_employer_id
      AND work_date = (v_entry->>'workDate')::DATE;
      GET DIAGNOSTICS v_deleted = ROW_COUNT;
    END IF;

    -- Collecter les semaines affectées
    v_affected_weeks := array_append(v_affected_weeks,
      date_trunc('week', (v_entry->>'workDate')::DATE)::DATE);
  END LOOP;

  -- 2. Dédupliquer les semaines
  v_affected_weeks := ARRAY(SELECT DISTINCT unnest(v_affected_weeks));

  -- 3. Recalcul batch pour chaque semaine unique
  -- (même logique que le trigger ci-dessus, mais par semaine unique)
  PERFORM recalculate_weeks_progress(p_user_id, v_affected_weeks);

  RETURN json_build_object('deleted', v_deleted, 'saved', v_saved);
END;
$$ LANGUAGE plpgsql;
```

**Appel côté serveur** :

```typescript
const result = await this.prisma.$queryRaw`
  SELECT save_week_hours(${userId}::UUID, ${employerId}::UUID, ${JSON.stringify(entries)}::JSONB)
`;
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ **1 seul aller-retour réseau** (appel unique) | ❌ **Toute la logique métier dans SQL** |
| ✅ Transactionnel nativement | ❌ Très difficile à tester unitairement |
| ✅ Performance maximale (~20-50ms total) | ❌ **Maintenance pénible** — SQL procédural complexe |
| ✅ Pas de N+1 possible | ❌ Duplication business rules (JS + SQL) |
| ✅ Fonctionne avec n'importe quel client | ❌ Debugging limité (pas de console.log) |
| | ❌ Risque d'erreurs silencieuses |
| | ❌ Prisma n'a aucun tooling pour les SP |
| | ❌ Le code devient moins lisible/maintenable |

**Complexité** : ⭐⭐⭐⭐⭐ (Très élevée)
**Temps estimé** : 4-5 jours

---

### D. Calcul côté client

**Principe** : Le client calcule `eligibleDays`, `eligibleHours`, etc. localement et envoie les résultats pré-calculés au serveur qui les stocke directement.

**Implémentation** :

```typescript
// Client: après sauvegarde des heures
const weeklyProgress = computeWeeklyProgress(weekEntries, employer.isEligible);
// { hours: 40, eligibleHours: 40, eligibleDays: 7, daysWorked: 5 }

await api.post('/work-entries/week', {
  employerId,
  entries: weekEntries,
  weeklyProgress, // Pré-calculé
});
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Temps de réponse serveur minimal | ❌ **NON FIABLE** — le client peut être manipulé |
| ✅ UX instantanée (calcul local) | ❌ **Incohérence garantie** si bug client |
| ✅ Moins de charge serveur | ❌ Que faire si 2 employeurs la même semaine ? Le client n'a pas toutes les données |
| | ❌ Le client ne connaît pas les dates du visa (arrival/expiry) |
| | ❌ **Violation du principe** : la source de vérité doit être côté serveur |
| | ❌ Impossible de recalculer si un employer change d'éligibilité |
| | ❌ Sécurité : un utilisateur pourrait truquer sa progression |

> ⚠️ **Verdict** : Cette solution seule est **non viable** pour les calculs de progression visa. Les règles métier dépendent de données multi-employeurs et multi-visas que seul le serveur possède.

**Usage valide** : Calcul côté client pour **preview/affichage temps réel** uniquement, avec le serveur comme source de vérité.

**Complexité** : ⭐⭐ (Faible) mais ⚠️ risques élevés
**Temps estimé** : 1-2 jours

---

### E. Job queue asynchrone (BullMQ)

**Principe** : Le serveur sauvegarde les heures immédiatement et met le recalcul de progression en file d'attente. Un worker traite le recalcul en background.

**Implémentation** :

```typescript
// work-entries.service.ts
async saveWeekHours(userId: string, data: SaveWeekHoursDto) {
  // 1. Upsert/delete les entrées (rapide, ~50ms)
  const result = await this.batchUpsertEntries(userId, data);

  // 2. Enqueue le recalcul (instantané, ~1ms)
  await this.progressQueue.add('recalculate-week', {
    userId,
    affectedDates: result.affectedDates,
  });

  return result; // Réponse immédiate au client
}

// progress.worker.ts (BullMQ worker)
@Processor('progress')
export class ProgressWorker {
  @Process('recalculate-week')
  async handleRecalculate(job: Job) {
    await this.visaProgress.refreshWeeksForDates(
      job.data.userId,
      job.data.affectedDates
    );
  }
}
```

**Infrastructure requise** : Redis (pour BullMQ)

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Réponse instantanée au client (~50ms) | ❌ **Consistency éventuelle** — progression pas à jour immédiatement |
| ✅ Le recalcul peut être lent sans impacter l'UX | ❌ **Nouvelle dépendance** : Redis |
| ✅ Retry automatique si le recalcul échoue | ❌ Complexité opérationnelle (Redis + worker) |
| ✅ Scalable (multiple workers) | ❌ Plus de code à maintenir (worker, queue config) |
| ✅ Découple save et calcul | ❌ UI doit gérer l'état "calcul en cours" |
| ✅ Peut battre les recalculs (deduplicate) | ❌ Coût Railway pour Redis (~$5-10/mois) |
| | ❌ Overkill pour un seul use case |

**Complexité** : ⭐⭐⭐⭐ (Élevée)
**Temps estimé** : 3-4 jours

---

### F. Vues matérialisées

**Principe** : PostgreSQL maintient une vue pré-calculée des progressions hebdomadaires, rafraîchie périodiquement ou à la demande.

**Implémentation** :

```sql
CREATE MATERIALIZED VIEW mv_weekly_progress AS
SELECT
  uv.id AS user_visa_id,
  date_trunc('week', we.work_date)::DATE AS week_start_date,
  (date_trunc('week', we.work_date) + INTERVAL '6 days')::DATE AS week_end_date,
  SUM(we.hours) AS hours,
  SUM(CASE WHEN e.is_eligible THEN we.hours ELSE 0 END) AS eligible_hours,
  CASE
    WHEN SUM(CASE WHEN e.is_eligible THEN we.hours ELSE 0 END) >= 30 THEN 7
    WHEN SUM(CASE WHEN e.is_eligible THEN we.hours ELSE 0 END) >= 24 THEN 4
    WHEN SUM(CASE WHEN e.is_eligible THEN we.hours ELSE 0 END) >= 18 THEN 3
    WHEN SUM(CASE WHEN e.is_eligible THEN we.hours ELSE 0 END) >= 12 THEN 2
    WHEN SUM(CASE WHEN e.is_eligible THEN we.hours ELSE 0 END) >= 6 THEN 1
    ELSE 0
  END AS eligible_days,
  COUNT(DISTINCT we.work_date) AS days_worked
FROM work_entry we
JOIN employer e ON e.id = we.employer_id
JOIN user_visa uv ON uv.user_id = we.user_id
  AND we.work_date BETWEEN uv.arrival_date AND uv.expiry_date
GROUP BY uv.id, date_trunc('week', we.work_date);

-- Refresh après modification
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weekly_progress;
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ Lecture ultra-rapide des progressions | ❌ **REFRESH n'est pas incrémental** — rebuild complet |
| ✅ SQL standard, pas de code complexe | ❌ Pas de mise à jour temps réel |
| ✅ Simplifie les requêtes de lecture | ❌ `REFRESH CONCURRENTLY` nécessite un unique index |
| | ❌ Ne résout pas le problème d'écriture (le save est toujours lent) |
| | ❌ **Ne remplace pas la table VisaWeeklyProgress** existante |
| | ❌ Maintenance de la vue quand le schema change |

> ⚠️ **Verdict** : Les vues matérialisées optimisent la **lecture**, pas l'**écriture**. Elles ne résolvent pas directement le problème de lenteur du POST. Utile en complément d'une autre solution.

**Complexité** : ⭐⭐ (Faible)
**Temps estimé** : 1 jour

---

### G. Approche hybride (recommandée)

**Principe** : Combiner le batching serveur (Solution A) avec un optimistic update côté client.

#### Côté serveur (batching optimisé)

Refactorer `saveWeekHours()` pour :
1. Batch upsert les work entries (1 requête au lieu de N)
2. Déterminer la(les) semaine(s) unique(s) affectée(s)
3. Fetch TOUTES les données nécessaires en 2-3 requêtes
4. Calculer en mémoire (JavaScript pur)
5. Batch update les VisaWeeklyProgress (1 requête)
6. Update les agrégats UserVisa avec SQL SUM (1 requête par visa)

**Total** : ~5-10 requêtes au lieu de ~141

#### Côté client (optimistic update)

```typescript
// use-hours.ts - mutation avec optimistic update
useMutation({
  mutationFn: saveWeekHours,
  onMutate: async (newData) => {
    // Annuler les requêtes en cours
    await queryClient.cancelQueries({ queryKey: queryKeys.hours.all });

    // Snapshot pour rollback
    const previousHours = queryClient.getQueryData(queryKeys.hours.byEmployer(employerId));

    // Optimistic update : mettre à jour le cache immédiatement
    queryClient.setQueryData(queryKeys.hours.byEmployer(employerId), (old) => ({
      ...old,
      // Merger les nouvelles heures
    }));

    return { previousHours };
  },
  onError: (err, newData, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(queryKeys.hours.byEmployer(employerId), context.previousHours);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.hours.all });
  },
});
```

| Avantages | Inconvénients |
|-----------|---------------|
| ✅ **Temps perçu par l'utilisateur : ~0ms** (optimistic) | ❌ Complexité moyenne des deux côtés |
| ✅ **Temps réel serveur : ~50-100ms** (batching) | ❌ Gestion du rollback client |
| ✅ Pas de nouvelle dépendance infra | ❌ Refactoring du service + du hook React Query |
| ✅ Source de vérité reste côté serveur | |
| ✅ Consistency immédiate | |
| ✅ Pattern standard React Query | |
| ✅ Réutilise le code existant (refactoré) | |

**Complexité** : ⭐⭐⭐ (Moyenne)
**Temps estimé** : 3-4 jours

---

## 5. Tableau comparatif

| Solution | Performance | Consistency | Complexité | Maintenance | Nouvelle infra | Sécurité |
|----------|------------|-------------|------------|-------------|----------------|----------|
| **A. Batching serveur** | ~100ms | ✅ Immédiate | ⭐⭐⭐ | Bonne | Non | ✅ |
| **B. Triggers SQL** | ~50ms | ✅ Immédiate | ⭐⭐⭐⭐ | ❌ Difficile | Non | ✅ |
| **C. Procédures stockées** | ~30ms | ✅ Immédiate | ⭐⭐⭐⭐⭐ | ❌ Très difficile | Non | ✅ |
| **D. Calcul client** | ~0ms | ❌ Non fiable | ⭐⭐ | Bonne | Non | ❌ |
| **E. BullMQ async** | ~50ms (save) | ⚠️ Éventuelle | ⭐⭐⭐⭐ | Moyenne | Redis | ✅ |
| **F. Vues matérialisées** | N/A (lecture) | ⚠️ Rafraîchie | ⭐⭐ | Bonne | Non | ✅ |
| **G. Hybride (A + optimistic)** | **~0ms perçu** | ✅ Immédiate | ⭐⭐⭐ | Bonne | Non | ✅ |

---

## 6. Recommandation finale

### Court terme (quick win) : Solution A — Batching serveur

**Pourquoi** : Résout 90% du problème avec un effort modéré. Le pattern existe déjà dans `refreshAllWeeksForVisa()`. Il suffit de l'adapter pour `saveWeekHours()`.

**Impact** : 141 requêtes → ~8 requêtes → **~100ms au lieu de 10s**

### Moyen terme (UX optimale) : Solution G — Hybride

**Pourquoi** : Ajoute l'optimistic update côté client pour une UX instantanée. Le serveur peut prendre 100ms ou 500ms, l'utilisateur ne le remarque pas car le cache est mis à jour immédiatement.

### À éviter

- **Solution C (procédures stockées)** : Trop de complexité pour le gain marginal vs Solution A
- **Solution D (calcul client seul)** : Non viable comme source de vérité
- **Solution E (BullMQ)** : Overkill — la consistency éventuelle n'est pas justifiée quand on peut avoir la consistency immédiate avec la Solution A
- **Solution B (triggers)** : Logique métier dans le SQL = dette technique significative

### Plan d'action suggéré

1. **Sprint 1** : Implémenter Solution A (batching serveur)
   - Créer `refreshWeeksForDates()` batch dans visa-progress.service.ts
   - Batch upsert des work entries
   - Utiliser SQL SUM pour les agrégats visa
   - Tests unitaires + integration

2. **Sprint 2** : Ajouter optimistic update (Solution G)
   - Modifier `useSaveWeekHours()` avec onMutate/onError
   - Invalider intelligemment (pas tout le cache hours)

3. **Optionnel** : Si la charge augmente significativement
   - Considérer BullMQ pour découpler save et calcul
   - Vues matérialisées pour les dashboards de lecture

---

> **Note** : Ce rapport se base sur l'analyse statique du code. Pour confirmer les latences exactes, il serait utile d'ajouter du logging temporaire (`console.time`/`console.timeEnd`) autour de chaque phase du `saveWeekHours()` pour mesurer précisément où le temps est passé.
