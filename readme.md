# Budget Buddy – Personālo finanšu pārvaldības sistēma
:information_source: *Projekta nosaukums ir tieši tāds pats, kā kvalifikācijas darba nosaukums*

## Projekta apraksts
Budget Buddy ir visaptveroša personālo finanšu pārvaldības sistēma, kas izstrādāta kā PIKC "Rīgas Valsts tehnikums" kvalifikācijas darba projekts. Sistēma ļauj lietotājiem efektīvi pārvaldīt savus ienākumus, izdevumus, budžetus, finanšu mērķus, investīcijas un parādus. Gala produkts ir moderna tīmekļa lietotne ar intuitīvu lietotāja saskarni, detalizētiem pārskatiem, analītiku un automatizētiem maksājumu plānošanas rīkiem. Sistēma nodrošina pilnīgu finanšu dzīves cikla pārvaldību – no ikdienas darījumu uzskaites līdz ilgtermiņa finanšu plānošanai un investīciju portfeļa analīzei.

### Galvenās funkcionalitātes:
- **Ienākumu un izdevumu uzskaite** - detalizēta darījumu reģistrācija ar kategorijām
- **Budžetu plānošana** - budžetu izveide, uzraudzība un analīze
- **Finanšu mērķi** - mērķu noteikšana, progress tracking un kalkulatori
- **Investīciju portfelis** - investīciju pārvaldība un veiktspējas analīze
- **Parādu menedžments** - kreditoru uzskaite un atmaksas plānošana
- **Automatizēti maksājumi** - periodisko maksājumu plānošana
- **Analītika un pārskati** - detalizēti finanšu pārskati un prognozes
- **Datu imports/eksports** - CSV failu apstrāde un PDF atskaišu ģenerēšana
- **Lietotāju administrēšana** - admin panelis lietotāju pārvaldībai

## Izmantotās tehnoloģijas

### Backend tehnoloģijas:
- **PHP 8.2** - galvenā programmēšanas valoda
- **Laravel 12.0** - PHP framework aplikācijas loģikai
- **SQLite 3.x** - failu bāzes relāciju datubāze (noklusējuma)
- **Redis** - kešošanas sistēma
- **Composer** - PHP pakotņu pārvaldītājs

### Frontend tehnoloģijas:
- **HTML5** - strukturēšanas valoda
- **CSS3** - stilizēšanas valoda
- **JavaScript/TypeScript** - interaktivitātes valoda
- **React 18** - lietotāja saskarnes framework
- **Inertia.js 2.0** - SPA bez API arhitektūra
- **Tailwind CSS 3.4** - utility-first CSS framework
- **Radix UI** - pieejamības komponentu bibliotēka
- **shadcn/ui** - React komponentu bibliotēka

### Vizualizācijas un UI:
- **Chart.js 4.4** - grafiku bibliotēka
- **Recharts 2.15** - React grafiku bibliotēka
- **Lucide React** - ikonu bibliotēka
- **Headless UI** - nenogurdinošie UI komponenti

### Izstrādes rīki:
- **Vite 5.1** - build tools un dev server
- **Node.js 20** - JavaScript runtime
- **npm** - pakotņu pārvaldītājs

### Testēšanas rīki:
- **PHPUnit** - PHP unit testing
- **Jest 29** - JavaScript testing framework
- **Playwright** - end-to-end testing
- **Testing Library** - React komponenšu testing

### Papildu bibliotēkas:
- **DomPDF (barryvdh/laravel-dompdf)** - PDF ģenerēšana
- **League CSV** - CSV failu apstrāde
- **Laravel Sanctum** - API autentifikācija
- **Ziggy** - Laravel routes JavaScript-ā
- **React Hook Form** - formu pārvaldība
- **Zod** - datu validācija
- **Zustand** - stāvokļa pārvaldība

## Izmantotie avoti

1. [Laravel Documentation](https://laravel.com/docs) - izmantots Laravel framework izstrādei, autentifikācijas sistēmas ieviešanai, Eloquent ORM lietošanai un API izstrādei.

2. [React Documentation](https://react.dev/) - izmantots React komponentu izstrādei, hooks lietošanai un komponenšu arhitektūras plānošanai.

3. [Inertia.js Documentation](https://inertiajs.com/) - izmantots SPA funkcionalitātes ieviešanai bez atsevišķa API, server-side rendering un client-side routing.

4. [Tailwind CSS Documentation](https://tailwindcss.com/docs) - izmantots responsive dizaina izveidei un utility-first CSS pieejas ieviešanai.

5. [Radix UI Documentation](https://www.radix-ui.com/) - izmantots pieejamības standartu ievērošanai UI komponentos un WAI-ARIA atbalstam.

6. [shadcn/ui Documentation](https://ui.shadcn.com/) - izmantots modernu, customizable React komponentu ieviešanai.

7. [Chart.js Documentation](https://www.chartjs.org/docs/) - izmantots interaktīvu grafiku un diagrammu izveidei finanšu analītikā.

8. [SQLite Documentation](https://sqlite.org/docs.html) - izmantots failu bāzes datubāzes dizainā, optimizācijā un migrāciju izveidē.

10. [PHP 8.2 Documentation](https://www.php.net/docs.php) - izmantots mūsdienīgu PHP iespēju lietošanā, typed properties un match expressions.

11. [Composer Documentation](https://getcomposer.org/doc/) - izmantots PHP pakotņu pārvaldībā un autoloading konfigurācijā.

12. [Vite Documentation](https://vitejs.dev/) - izmantots modern frontend build tools setup un hot module replacement.

13. [Laravel Breeze](https://laravel.com/docs/starter-kits#laravel-breeze) - izmantots kā pamats autentifikācijas sistēmai un scaffold.

14. [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum) - izmantots API token authentication ieviešanai.

15. [PHPUnit Documentation](https://phpunit.de/documentation.html) - izmantots backend unit testu rakstīšanai.

16. [Jest Documentation](https://jestjs.io/docs/getting-started) - izmantots JavaScript/React komponenšu testēšanai.

17. [TypeScript Documentation](https://www.typescriptlang.org/docs/) - izmantots type safety uzlabošanai frontend kodā.

18. [Redis Documentation](https://redis.io/documentation) - izmantots kešošanas stratēģiju ieviešanai un session storage.

19. [Laravel Testing Documentation](https://laravel.com/docs/testing) - izmantots integration testu rakstīšanai un feature testing.

21. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) - izmantots React komponenšu unit testēšanai.

22. [DomPDF Documentation](https://github.com/dompdf/dompdf) - izmantots PDF pārskatu ģenerēšanai.

23. [League CSV Documentation](https://csv.thephpleague.com/) - izmantots CSV failu importa/eksporta funkcionalitātei.

24. [Laravel Eloquent ORM](https://laravel.com/docs/eloquent) - izmantots datubāzes modeļu izveidei un attiecību definēšanai.

25. [React Hook Form Documentation](https://react-hook-form.com/) - izmantots performantu formu izveidei ar validāciju.

26. [Laravel Migrations](https://laravel.com/docs/migrations) - izmantots datubāzes struktūras versioning un deployment.

27. [Zustand Documentation](https://github.com/pmndrs/zustand) - izmantots lightweight state management React aplikācijā.

28. [Zod Documentation](https://zod.dev/) - izmantots runtime type checking un form validation.

29. [Laravel Queue Documentation](https://laravel.com/docs/queues) - izmantots background job processing ieviešanai.

:information_source: :exclamation: *Visi norādītie avoti ir tikuši izmantoti projekta izstrādes procesā. Kods ir rakstīts, balstoties uz oficiālajām dokumentācijām un best practices, ievērojot copyright un licenču prasības.* :exclamation:

## Uzstādīšanas instrukcijas

:information_source: **Svarīgs paziņojums:** Šajā projektā tiek izmantota SQLite datubāze uz failiem, nevis MySQL serveris. Tas nozīmē, ka nav nepieciešama atsevišķa datubāzes servera uzstādīšana vai pārvaldība - PHP automātiski izgādā SQLite atbildību.

### Priekšnosacījumi
Pirms uzstādīšanas pārliecinieties, ka Jums ir uzstādīts:
- Git
- PHP 8.2+ un Composer
- Node.js 20+ un npm

### Uzstādīšana

1. **Klonējiet repozitoriju:**
   ```bash
   git clone https://github.com/[lietotājvārds]/budget-buddy-nosleguma-darbs.git
   cd budget-buddy-nosleguma-darbs
   ```

2. **Instalējiet PHP atkarības:**
   ```bash
   composer install
   ```

3. **Instalējiet JavaScript atkarības:**
   ```bash
   npm install
   ```

4. **Izveidojiet `.env` failu:**
   ```bash
   cp .env.example .env
   ```

5. **Konfigurējiet datubāzi `.env` failā:**
    Sistēma izmanto SQLite failu bāzi, tāpēc nav nepieciešami papildus datubāzes serveri:
    ```env
    DB_CONNECTION=sqlite
    DB_DATABASE=[ceļš/uz/projektu]/database/database.sqlite
    ```

6. **Ģenerējiet lietotnes atslēgu:**
   ```bash
   php artisan key:generate
   ```

7. **Veiciet datubāzes migrācijas:**
   ```bash
   php artisan migrate
   ```

8. **Ievietojiet sākotnējos datus:**
   ```bash
   php artisan db:seed
   ```

9. **Sagatavojiet frontenda aktīvus:**
   ```bash
   npm run build
   ```

10. **Palaidiet Laravel serveri:**
    ```bash
    php artisan serve
    ```

11. **Piekļūstiet lietotnei:**
    ```
    http://localhost:8000
    ```

### Development režīms

Lai strādātu development režīmā ar hot reload:

```bash
# Terminal 1 - Laravel server
php artisan serve

# Terminal 2 - Vite dev server
npm run dev
```

### Sistēmas prasības
- **PHP:** 8.2 vai jaunāka versija
- **Node.js:** 20 vai jaunāka versija
- **SQLite:** 3.x vai jaunāka versija (iekļauts PHP pēc noklusējuma)
- **Redis:** Jebkura stabilā versija (opcionāli)
- **RAM:** Vismaz 2GB brīvās atmiņas
- **Disk:** Vismaz 1GB brīvās vietas

:information_source: **Datubāze:** Sistēma nodrošina automātisku SQLite datubāzes faila izveidi projekta `database/` mapē. Nav nepieciešami ārējie datubāzes serveri vai konfigurācija.

### Problēmu risināšana

**Ja rodas permission kļūdas:**
```bash
chown -R $USER:$USER storage/
chown -R $USER:$USER bootstrap/cache/
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

**Ja neparādās frontend izmaiņas:**
```bash
npm run build
php artisan optimize:clear
```

**Datubāzes problēmu gadījumā:**
```bash
# Atjaunot datubāzes struktūru un ievietot sākotnējos datus
php artisan migrate:fresh --seed
```

**Ja SQLite neatrod datubāzes failu:**
```bash
# Pārbaudīt vai eksistē database/database.sqlite fails
ls -la database/

# Ja fails neeksistē, izveidot to manuāli
touch database/database.sqlite
```

**SQLite pieejas tiesības:**
```bash
# Nodrošināt rakstīšanas tiesības SQLite failam
chmod 664 database/database.sqlite
```

**Ja rodas cache kļūdas:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

:information_source: *Projekts ir optimizēts gan development, gan production vidēm. Development vidē izmantojiet hot module replacement funkcionalitāti ātrākai izstrādei. Production deploynei izveidojiet atbilstošu konfigurāciju serverī.*