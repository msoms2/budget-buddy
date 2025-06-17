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
- **MySQL 8.0** - relāciju datubāze
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
- **Docker & Docker Compose** - konteinerzācija
- **Node.js 20** - JavaScript runtime
- **npm** - pakotņu pārvaldītājs
- **Nginx** - web serveris

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

8. [Docker Documentation](https://docs.docker.com/) - izmantots aplikācijas konteinerzācijai un development environment uzstādīšanai.

9. [MySQL 8.0 Documentation](https://dev.mysql.com/doc/) - izmantots datubāzes dizainā, optimizācijā un migrāciju izveidē.

10. [PHP 8.2 Documentation](https://www.php.net/docs.php) - izmantots mūsdienīgu PHP iespēju lietošanā, typed properties un match expressions.

11. [Composer Documentation](https://getcomposer.org/doc/) - izmantots PHP pakotņu pārvaldībā un autoloading konfigurācijā.

12. [Vite Documentation](https://vitejs.dev/) - izmantots modern frontend build tools setup un hot module replacement.

13. [Laravel Breeze](https://laravel.com/docs/starter-kits#laravel-breeze) - izmantots kā pamats autentifikācijas sistēmai un scaffold.

14. [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum) - izmantots API token authentication ieviešanai.

15. [PHPUnit Documentation](https://phpunit.de/documentation.html) - izmantots backend unit testu rakstīšanai.

16. [Jest Documentation](https://jestjs.io/docs/getting-started) - izmantots JavaScript/React komponenšu testēšanai.

17. [TypeScript Documentation](https://www.typescriptlang.org/docs/) - izmantots type safety uzlabošanai frontend kodā.

18. [Redis Documentation](https://redis.io/documentation) - izmantots kešošanas stratēģiju ieviešanai un session storage.

19. [Nginx Configuration Guide](https://nginx.org/en/docs/) - izmantots web servera konfigurācijai Docker vidē.

20. [Laravel Testing Documentation](https://laravel.com/docs/testing) - izmantots integration testu rakstīšanai un feature testing.

21. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) - izmantots React komponenšu unit testēšanai.

22. [DomPDF Documentation](https://github.com/dompdf/dompdf) - izmantots PDF pārskatu ģenerēšanai.

23. [League CSV Documentation](https://csv.thephpleague.com/) - izmantots CSV failu importa/eksporta funkcionalitātei.

24. [Laravel Eloquent ORM](https://laravel.com/docs/eloquent) - izmantots datubāzes modeļu izveidei un attiecību definēšanai.

25. [React Hook Form Documentation](https://react-hook-form.com/) - izmantots performantu formu izveidei ar validāciju.

26. [Laravel Migrations](https://laravel.com/docs/migrations) - izmantots datubāzes struktūras versioning un deployment.

27. [Zustand Documentation](https://github.com/pmndrs/zustand) - izmantots lightweight state management React aplikācijā.

28. [Zod Documentation](https://zod.dev/) - izmantots runtime type checking un form validation.

29. [GitHub Docker Compose Examples](https://github.com/docker/awesome-compose) - izmantots Docker Compose konfigurācijas izveidei.

30. [Laravel Queue Documentation](https://laravel.com/docs/queues) - izmantots background job processing ieviešanai.

:information_source: :exclamation: *Visi norādītie avoti ir tikuši izmantoti projekta izstrādes procesā. Kods ir rakstīts, balstoties uz oficiālajām dokumentācijām un best practices, ievērojot copyright un licenču prasības.* :exclamation:

## Uzstādīšanas instrukcijas

### Priekšnosacījumi
Pirms uzstādīšanas pārliecinieties, ka Jums ir uzstādīts:
- Git
- Docker & Docker Compose
- Node.js 20+ un npm (alternatīvi, ja nevēlaties izmantot Docker)
- PHP 8.2+ un Composer (alternatīvi, ja nevēlaties izmantot Docker)

### Uzstādīšana ar Docker (ieteicams)

1. **Klonējiet repozitoriju:**
   ```bash
   git clone https://github.com/[lietotājvārds]/budget-buddy-nosleguma-darbs.git
   cd budget-buddy-nosleguma-darbs
   ```

2. **Izveidojiet `.env` failu:**
   ```bash
   cp .env.example .env
   ```

3. **Rediģējiet `.env` failu:**
   Atveriet `.env` failu un pielāgojiet konfigurāciju:
   ```env
   APP_NAME="Budget Buddy"
   APP_ENV=local
   APP_KEY=
   APP_DEBUG=true
   APP_URL=http://localhost:8001

   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=budget_buddy
   DB_USERNAME=budget_user
   DB_PASSWORD=budget_password

   CACHE_DRIVER=redis
   QUEUE_CONNECTION=redis
   SESSION_DRIVER=redis

   REDIS_HOST=redis
   REDIS_PASSWORD=null
   REDIS_PORT=6379
   ```

4. **Palaidiet Docker konteinierus:**
   ```bash
   docker-compose up -d
   ```

5. **Instalējiet PHP atkarības:**
   ```bash
   docker-compose exec php composer install
   ```

6. **Ģenerējiet aplikācijas atslēgu:**
   ```bash
   docker-compose exec php php artisan key:generate
   ```

7. **Veiciet datubāzes migrācijas:**
   ```bash
   docker-compose exec php php artisan migrate
   ```

8. **Ievietojiet sākotnējos datus (opcionāli):**
   ```bash
   docker-compose exec php php artisan db:seed
   ```

9. **Instalējiet Node.js atkarības un build frontend:**
   ```bash
   docker-compose exec node npm ci
   docker-compose exec node npm run build
   ```

10. **Piekļūstiet lietotnei:**
    - Galvenā lietotne: http://localhost:8001
    - phpMyAdmin: http://localhost:8080
    - Development server (ar HMR): http://localhost:5173

### Uzstādīšana bez Docker

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
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=budget_buddy
   DB_USERNAME=[jūsu_db_lietotājs]
   DB_PASSWORD=[jūsu_db_parole]
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

**Ar Docker:**
```bash
# Palaist Vite dev server
docker-compose exec node npm run dev

# Palaist Laravel artisan serve atsevišķā terminal
docker-compose exec php php artisan serve --host=0.0.0.0 --port=8000
```

**Bez Docker:**
```bash
# Terminal 1 - Laravel server
php artisan serve

# Terminal 2 - Vite dev server
npm run dev
```

### Sistēmas prasības
- **PHP:** 8.2 vai jaunāka versija
- **Node.js:** 20 vai jaunāka versija
- **MySQL:** 8.0 vai jaunāka versija
- **Redis:** Jebkura stabilā versija (opcionāli)
- **RAM:** Vismaz 2GB brīvās atmiņas
- **Disk:** Vismaz 1GB brīvās vietas

### Problēmu risināšana

**Ja rodas permission kļūdas:**
```bash
docker-compose exec php chown -R www-data:www-data /var/www/html/storage
docker-compose exec php chown -R www-data:www-data /var/www/html/bootstrap/cache
```

**Ja neparādās frontend izmaiņas:**
```bash
docker-compose exec node npm run build
docker-compose exec php php artisan optimize:clear
```

**Datubāzes problēmu gadījumā:**
```bash
docker-compose exec php php artisan migrate:fresh --seed
```

:information_source: *Projekts ir optimizēts gan development, gan production vidēm. Development vidē izmantojiet hot module replacement funkcionalitāti ātrākai izstrādei. Production deployment var izmantot Docker konteinierus ar atbilstošām konfigurācijām.*