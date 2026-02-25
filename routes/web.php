<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// General Controllers
use App\Http\Controllers\InstallController;
use App\Http\Controllers\LocalizationController;
use App\Http\Controllers\ProfileController;

// Admin Controllers
use App\Http\Controllers\Admin\BatchController;
use App\Http\Controllers\Admin\ChapterController;
use App\Http\Controllers\Admin\ExamController as AdminExamController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\SystemUtilityController;
use App\Http\Controllers\Admin\UserController;

// Student Controllers
use App\Http\Controllers\Student\AttemptController;
use App\Http\Controllers\Student\ExamController as StudentExamController;
use App\Http\Controllers\Student\PaymentController as StudentPaymentController;

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
Route::prefix('install')->name('install.')->controller(InstallController::class)->group(function () {
    Route::get('/', 'welcome')->name('welcome');
    Route::get('/requirements', 'requirements')->name('requirements');
    Route::get('/permissions', 'permissions')->name('permissions');

    Route::get('/database', 'database')->name('database');
    Route::post('/database', 'processDatabase')->name('database.process');

    Route::get('/migrations', 'migrations')->name('migrations');
    Route::post('/migrations', 'runMigrations')->name('migrations.run');

    Route::get('/admin', 'admin')->name('admin');
    Route::post('/admin', 'processAdmin')->name('admin.process');

    Route::get('/complete', 'complete')->name('complete');
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

    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });
});

/**
 * ==========================================================
 * ADMIN ROUTES
 * ==========================================================
 */
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('batches', BatchController::class);
    Route::resource('subjects', SubjectController::class);
    Route::resource('chapters', ChapterController::class);
    Route::resource('questions', QuestionController::class);
    Route::resource('exams', AdminExamController::class);
    Route::resource('students', AdminStudentController::class);
    Route::resource('payments', AdminPaymentController::class)->only(['index', 'show']);

    // System Utilities (cPanel / Shared Hosting Support)
    Route::prefix('system-utilities')->name('system-utilities.')->controller(SystemUtilityController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/link-storage', 'linkStorage')->name('link-storage');
        Route::post('/clear-caches', 'clearCaches')->name('clear-caches');
        Route::post('/update-env', 'updateEnvSettings')->name('update-env');
    });
});

// Dedicated Public/Cron Route for Queue Processing (Secured via token or run locally via cPanel cron)
Route::get('/cron/process-queue', [SystemUtilityController::class, 'processQueue'])->name('cron.process-queue');

/**
 * ==========================================================
 * STUDENT ROUTES
 * ==========================================================
 */
Route::middleware(['auth', 'verified'])->prefix('student')->name('student.')->group(function () {

    Route::controller(StudentExamController::class)->prefix('exams')->name('exams.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{exam}/room', 'room')->name('room');
    });

    Route::controller(AttemptController::class)->prefix('attempts')->name('attempts.')->group(function () {
        Route::post('/{attempt}/save-answer', 'saveAnswer')->name('save-answer');
        Route::post('/{attempt}/submit', 'submit')->name('submit');
    });

    Route::controller(StudentPaymentController::class)->prefix('payments')->name('payments.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/checkout', 'initiateCheckout')->name('checkout');
        Route::get('/callback', 'callback')->name('callback');
    });
});

Route::post('webhooks/payments/{gateway}', [StudentPaymentController::class, 'webhook'])->name('webhooks.payments');

Route::post('/locale', [LocalizationController::class, 'update'])->name('locale.update');

require __DIR__ . '/auth.php';
