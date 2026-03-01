<?php

namespace App\Providers;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Payment;
use App\Models\Student;
use App\Policies\ExamAttemptPolicy;
use App\Policies\ExamPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\StudentPolicy;
use App\Listeners\LogUserActivity;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Exam::class, ExamPolicy::class);
        Gate::policy(Student::class, StudentPolicy::class);
        Gate::policy(ExamAttempt::class, ExamAttemptPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);

        Event::listen(Login::class, LogUserActivity::class);

        Vite::prefetch(concurrency: 3);
    }
}
