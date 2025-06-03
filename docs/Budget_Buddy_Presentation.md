# Budget Buddy - Prezentācijas saturs

## 1. slaids - Titula slaids
**Virsraksts:** Personīgo finanšu pārvaldības sistēma "Budget Buddy"

**Saturs:**
- **Kvalifikācijas darba tēma:** Personīgo finanšu pārvaldības sistēmas "Budget Buddy" izstrāde
- **Autors:** [Jūsu vārds un uzvārds]
- **Gads:** 2025

---

## 2. slaids - Uzdevuma nostādne
**Virsraksts:** Uzdevuma nostādne

**Saturs:**
- **Mērķis:** Izveidot lietotājam draudzīgu tīmekļa lietotni personīgo finanšu pārvaldībai
- **Galvenie uzdevumi:**
  - Nodrošināt ienākumu un izdevumu uzskaiti
  - Realizēt budžetu plānošanas funkcionalitāti
  - Ieviesti finanšu mērķu definēšanu un sekošanu
  - Izveidot investīciju portfeļa pārvaldības sistēmu
  - Nodrošināt dažādu atskaišu ģenerēšanu
  - Automatizēt periodisko maksājumu procesu

---

## 3. slaids - Izmantotās izstrādes tehnoloģijas
**Virsraksts:** Izmantotās izstrādes tehnoloģijas

**Saturs:**
### Backend tehnoloģijas:
- **PHP 8.1+** - servera puses programmēšanas valoda
- **Laravel 11** - PHP ietvars
- **MySQL 8.0** - relāciju datubāze

### Frontend tehnoloģijas:
- **JavaScript** - klients puses programmēšana
- **React 18** - lietotāja saskarnes bibliotēka
- **Inertia.js** - SPA ietvars Laravel integrācijai
- **Tailwind CSS** - CSS ietvars dizainam

### Papildu rīki:
- **Vite** - frontend build rīks
- **Composer** - PHP atkarību pārvaldnieks
- **NPM** - JavaScript pakotņu pārvaldnieks

---

## 4. slaids - Funkcionālās dekompozīcijas diagramma
**Virsraksts:** Sistēmas funkcionālā dekompozīcija

**Diagrammas saturs:**
```
Budget Buddy Sistema
├── Lietotāju pārvaldība
│   ├── Reģistrācija
│   ├── Autentifikācija
│   └── Profila pārvaldība
├── Transakciju pārvaldība
│   ├── Ienākumu reģistrēšana
│   ├── Izdevumu reģistrēšana
│   └── Transakciju filtrēšana
├── Kategoriju pārvaldība
│   ├── Kategoriju izveide
│   ├── Apakškategoriju pārvaldība
│   └── Kategoriju analīze
├── Budžetu pārvaldība
│   ├── Budžeta plānošana
│   ├── Izpildes kontrole
│   └── Budžeta analīze
├── Mērķu pārvaldība
│   ├── Mērķu definēšana
│   ├── Progresa sekošana
│   └── Iemaksu reģistrēšana
├── Investīciju pārvaldība
│   ├── Portfeļa uzskaite
│   ├── Darījumu reģistrēšana
│   └── Veiktspējas analīze
├── Periodiskie maksājumi
│   ├── Grafika definēšana
│   ├── Automātiska izpilde
│   └── Pārvaldība
└── Atskaites un analīze
    ├── Finanšu pārskati
    ├── Grafiku ģenerēšana
    └── Datu eksportēšana
```

---

## 5. slaids - ER diagramma
**Virsraksts:** Entītiju saišu diagramma (ER)

**Galvenās entītijas (izceltās):**
- **USERS** (lietotāji)
- **TRANSACTIONS** (transakcijas) 
- **CATEGORIES** (kategorijas)
- **BUDGETS** (budžeti)
- **GOALS** (mērķi)
- **INVESTMENTS** (investīcijas)
- **PAYMENT_SCHEDULES** (periodiskie maksājumi)

**Saites:**
- Users → Transactions (1:N)
- Users → Budgets (1:N)
- Users → Goals (1:N)
- Categories → Transactions (1:N)
- Budgets → Budget_Items (1:N)
- Goals → Goal_Transactions (1:N)
- Users → Investments (1:N)
- Investments → Investment_Transactions (1:N)

---

## 6. slaids - Datu plūsmu diagramma
**Virsraksts:** Datu plūsmu diagramma
**Apakšvirsraksts:** Transakcijas reģistrēšanas process

**Diagrammas elementi:**
1. **Lietotājs** → Transakcijas dati → **Transakciju forma**
2. **Transakciju forma** → Validācija → **Sistēma**
3. **Sistēma** → Saglabāšana → **Datubāze**
4. **Datubāze** → Atjaunināšana → **Budžeta aprēķini**
5. **Budžeta aprēķini** → Rezultāts → **Lietotāja saskarnes atjaunināšana**
6. **Sistēma** → Paziņojums → **Lietotājs**

**Datu krātuves:**
- Transakciju tabula
- Kategoriju tabula
- Budžetu tabula
- Lietotāju tabula

---

## 7. slaids - Tabulu saišu shēma
**Virsraksts:** Datubāzes tabulu saišu shēma

**Galvenās tabulas un saites:**
```
users (1) ——→ (N) transactions
users (1) ——→ (N) budgets  
users (1) ——→ (N) goals
users (1) ——→ (N) investments
users (1) ——→ (N) payment_schedules

categories (1) ——→ (N) transactions
categories (1) ——→ (N) sub_categories
sub_categories (1) ——→ (N) transactions

budgets (1) ——→ (N) budget_items
goals (1) ——→ (N) goal_transactions
investments (1) ——→ (N) investment_transactions

currencies (1) ——→ (N) users
currencies (1) ——→ (N) transactions
payment_methods (1) ——→ (N) transactions

tags (N) ←——→ (N) transactions [many-to-many]
```

---

## 8. slaids - Programmas galvenā loga attēls
**Virsraksts:** Budget Buddy galvenā saskarne

**Attēla apraksts:**
[Šeit būtu jāievieto ekrānšāviņš no Dashboard.jsx lapas ar:]
- Kreisā puse: Navigācijas sānjosla ar izvēlnēm
- Augšējā daļa: Virsraksts un lietotāja informācija
- Centrālā daļa: 
  - Kopējās bilances informācija
  - Ātrās pievienošanas pogas
  - Pēdējo transakciju saraksts
  - Budžeta progresa indikatori
  - Finanšu mērķu progress
  - Grafiks ar izdevumu sadalījumu

---

## 9. slaids - Noslēgums
**Virsraksts:** Paldies par uzmanību!

**Saturs:**
- **Sistēma ir veiksmīgi realizēta un gatava ekspluatācijai**
- **Nodrošina pilnvērtīgu personīgo finanšu pārvaldību**
- **Izmanto mūsdienīgas tīmekļa tehnoloģijas**
- **Ir ērti lietojama un funkcionāla**

**Jautājumi?**

---

## Papildu norādes prezentācijas veidošanai:

### Dizaina elementi:
- Izmantot konsekventu krāsu shēmu (ieteicams zaļš/zils naudas tēmai)
- Fonts: minimums 24pt visam tekstam
- Logo: Budget Buddy logo katrā slaidā
- Fons: profesionāls, vienkāršs dizains

### Vizuālie elementi:
- 4. slaids: Hierarhiska bloku shēma
- 5. slaids: ER diagramma ar krāsainām entītiju kastītēm
- 6. slaids: Plūsmas diagramma ar bultiņām
- 7. slaids: Datubāzes shēma ar saišu līnijām
- 8. slaids: Reāls sistēmas ekrānšāviņš

### Prezentācijas laiks:
- Katrs slaids: ~1-2 minūtes
- Kopējais laiks: 10-15 minūtes
- Atstāt laiku jautājumiem: 5 minūtes