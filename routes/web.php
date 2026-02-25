<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/**
 * ==========================================================
 * INSTALLER ROUTES
 * ==========================================================
 */
Route::prefix('install')->name('install.')->group(function () {
    Route::get('/', [\App\Http\Controllers\InstallController::class, 'welcome'])->name('welcome');
    Route::get('/requirements', [\App\Http\Controllers\InstallController::class, 'requirements'])->name('requirements');
    Route::get('/permissions', [\App\Http\Controllers\InstallController::class, 'permissions'])->name('permissions');

    Route::get('/database', [\App\Http\Controllers\InstallController::class, 'database'])->name('database');
    Route::post('/database', [\App\Http\Controllers\InstallController::class, 'processDatabase'])->name('database.process');

    Route::get('/migrations', [\App\Http\Controllers\InstallController::class, 'migrations'])->name('migrations');
    Route::post('/migrations', [\App\Http\Controllers\InstallController::class, 'runMigrations'])->name('migrations.run');

    Route::get('/admin', [\App\Http\Controllers\InstallController::class, 'admin'])->name('admin');
    Route::post('/admin', [\App\Http\Controllers\InstallController::class, 'processAdmin'])->name('admin.process');

    Route::get('/complete', [\App\Http\Controllers\InstallController::class, 'complete'])->name('complete');
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/**
 * ==========================================================
 * ADMIN ROUTES
 * ==========================================================
 */
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
    Route::resource('batches', \App\Http\Controllers\Admin\BatchController::class);
    Route::resource('subjects', \App\Http\Controllers\Admin\SubjectController::class);
    Route::resource('chapters', \App\Http\Controllers\Admin\ChapterController::class);
    Route::resource('questions', \App\Http\Controllers\Admin\QuestionController::class);
    Route::resource('exams', \App\Http\Controllers\Admin\ExamController::class);
    Route::resource('students', \App\Http\Controllers\Admin\StudentController::class);
    Route::resource('payments', \App\Http\Controllers\Admin\PaymentController::class)->only(['index', 'show']);
});

/**
 * ==========================================================
 * STUDENT ROUTES
 * ==========================================================
 */
Route::middleware(['auth', 'verified'])->prefix('student')->name('student.')->group(function () {
    Route::get('exams', [\App\Http\Controllers\Student\ExamController::class, 'index'])->name('exams.index');
    Route::get('exams/{exam}/room', [\App\Http\Controllers\Student\ExamController::class, 'room'])->name('exams.room');

    Route::post('attempts/{attempt}/save-answer', [\App\Http\Controllers\Student\AttemptController::class, 'saveAnswer'])->name('attempts.save-answer');
    Route::post('attempts/{attempt}/submit', [\App\Http\Controllers\Student\AttemptController::class, 'submit'])->name('attempts.submit');

    Route::get('payments', [\App\Http\Controllers\Student\PaymentController::class, 'index'])->name('payments.index');
    Route::post('payments/checkout', [\App\Http\Controllers\Student\PaymentController::class, 'initiateCheckout'])->name('payments.checkout');
    Route::get('payments/callback', [\App\Http\Controllers\Student\PaymentController::class, 'callback'])->name('payments.callback');
});

Route::post('webhooks/payments/{gateway}', [\App\Http\Controllers\Student\PaymentController::class, 'webhook'])->name('webhooks.payments');

require __DIR__ . '/auth.php';
