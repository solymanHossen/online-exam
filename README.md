# 🎓 Online Exam Platform - Enterprise Examination System

Welcome to the **Online Exam Platform**! This is a state-of-the-art, robust, and highly scalable examination and quiz management system built for educational institutions and businesses.

## 🚀 Tech Stack
This project is engineered using the most modern and powerful web technologies:
- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React.js, Inertia.js (Single Page Application)
- **UI Framework:** Tailwind CSS & Shadcn UI
- **Database:** MySQL / MariaDB

## 📖 Documentation & Installation
If you have purchased this item from Envato CodeCanyon, please **DO NOT** try to install it manually using terminal commands if you are not a developer. 

We have provided a comprehensive GUI Web Installer and a detailed Documentation file.

👉 **Please open the `Documentation` folder included in your downloaded `.zip` file and open the `index.html` file to read the step-by-step installation guide.**

## 🏭 Production Checklist (Required)
- Set `APP_ENV=production` and `APP_DEBUG=false`.
- Run `php artisan key:generate` once (if empty key).
- Run `php artisan migrate --force`.
- Run `php artisan config:cache && php artisan route:cache && php artisan view:cache`.
- Ensure writable folders: `storage/` and `bootstrap/cache/`.
- Create storage link: `php artisan storage:link`.
- Configure queue driver (`database` or `redis`) and run queue worker.
- Configure cron scheduler (every minute):

```bash
* * * * * php /home/your-user/your-app/artisan schedule:run >/dev/null 2>&1
```

## 💳 Payment Configuration
- Stripe: `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`
- PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `PAYPAL_WEBHOOK_ID`
- Cron secret (optional internal maintenance use): `CRON_SECRET`

### Webhook Security (Provider-Native)
- Stripe webhooks are verified using the `Stripe-Signature` header and `STRIPE_WEBHOOK_SECRET`.
- PayPal webhooks are verified by calling PayPal's `verify-webhook-signature` API using `PAYPAL_WEBHOOK_ID`.
- Endpoint: `POST /webhooks/payments/{gateway}` where `{gateway}` is `stripe` or `paypal`.

## 🔐 Security Baseline
- Keep `.env` outside public exposure and never commit secrets.
- Use HTTPS in production and set secure session cookies.
- Configure webhook endpoints and secrets before enabling checkout.
- Restrict file upload permissions and monitor `storage/logs/laravel.log`.

## 🧪 Validation Commands
```bash
npm run build
php artisan test
```

## 🧰 Local Development Ports
- This project is pinned to dedicated ports to avoid conflicts with other Laravel/Vite projects.
- Backend (Laravel): `APP_PORT=8088`
- Frontend (Vite): `VITE_PORT=5188`
- Start both with:

```bash
composer run dev
```

- Open app at: `http://127.0.0.1:8088`


## ✨ Key Features
- ⚡ **Blazing Fast SPA:** No page reloads, providing a smooth app-like experience.
- 🔒 **Highly Secure:** Advanced protection against race-conditions, IDOR, and XSS.
- 💳 **Integrated Payments:** Built-in support for Stripe and PayPal gateways.
- 🌍 **Multi-Language:** Fully translatable architecture for global audiences.
- ⚙️ **GUI Installer:** 100% browser-based installation wizard.

## 🛡️ Security Vulnerabilities
If you discover a security vulnerability within this project, please send an e-mail to our support team directly via our Envato Profile page. All security vulnerabilities will be promptly addressed.

## 📄 License
This project is a premium product available exclusively on Envato CodeCanyon. 
Unauthorized distribution, sharing, or resale is strictly prohibited.

---
*Thank you for choosing our product!*