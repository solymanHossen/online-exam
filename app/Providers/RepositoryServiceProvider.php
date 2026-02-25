<?php

namespace App\Providers;

use App\Repositories\ExamRepository;
use App\Repositories\Interfaces\ExamRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ExamRepositoryInterface::class, ExamRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
