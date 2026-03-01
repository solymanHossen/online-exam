<?php

use App\Http\Controllers\Admin\BatchController;
use App\Http\Controllers\Admin\ChapterController;
use App\Http\Controllers\Admin\ExamController as AdminExamController;
// General Controllers
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
// Admin Controllers
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\SystemUtilityController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\InstallController;
use App\Http\Controllers\LocalizationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\AttemptController;
use App\Http\Controllers\Student\ExamController as StudentExamController;
use App\Http\Controllers\Student\PaymentController as StudentPaymentController;
// Student Controllers
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * |--------------------------------------------------------------------------
 * | Web Routes
 * |--------------------------------------------------------------------------
 * |
 * | Here is where you can register web routes for your application. These
 * | routes are loaded by the RouteServiceProvider within a group which
 * | contains the "web" middleware group. Now create something great!
 * |
 */

/**
 * ==========================================================
 * INSTALLER ROUTES
 * ==========================================================
 * These routes handle the GUI-based installation process for new users.
 */
Route::middleware('is-installed')->prefix('install')->name('install.')->controller(InstallController::class)->group(function () {
    // Renders the initial welcome screen for the installer
    Route::get('/', 'welcome')->name('welcome');

    // Verifies PHP extensions and minimum version requirements
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

/**
 * Public Landing Page
 * Returns the Welcome view with current framework versions if not authenticated.
 */
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/**
 * Authenticated User Routes (Both Students and Admins)
 * Requires the user to be logged in and strictly verified via email.
 */
Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard entry point
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile management grouped securely via the ProfileController
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
 * Strictly protected routes requiring the 'admin' role middleware.
 */
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('questions/statistics', [QuestionController::class, 'statistics'])->name('questions.statistics');

    // RESTful resource controllers for core application entities
    Route::resource('users', UserController::class);
    Route::resource('batches', BatchController::class);
    Route::resource('subjects', SubjectController::class);
    Route::resource('chapters', ChapterController::class);
    Route::resource('questions', QuestionController::class);
    Route::resource('exams', AdminExamController::class);
    Route::resource('students', AdminStudentController::class);

    // Payments are view-only for admins (no create/edit permissions required)
    Route::resource('payments', AdminPaymentController::class)->only(['index', 'show']);

    /**
     * System Utilities
     * Advanced server management options suitable for cPanel/Shared Hosting environments.
     */
    Route::prefix('system-utilities')->name('system-utilities.')->controller(SystemUtilityController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/link-storage', 'linkStorage')->name('link-storage');
        Route::post('/clear-caches', 'clearCaches')->name('clear-caches');
        Route::post('/update-env', 'updateEnvSettings')->name('update-env');
    });
});

/**
 * ==========================================================
 * STUDENT ROUTES
 * ==========================================================
 * Routes specifically designed for students interacting with exams and payments.
 */
Route::middleware(['auth', 'verified'])->prefix('student')->name('student.')->group(function () {

    // Handles the listing of available exams and entering the actual exam room interface
    Route::controller(StudentExamController::class)->prefix('exams')->name('exams.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{exam}/room', 'room')->name('room');
    });

    // Manages the logic during an active exam (saving answers dynamically and final submission)
    Route::controller(AttemptController::class)->prefix('attempts')->name('attempts.')->group(function () {
        Route::post('/{attempt}/save-answer', 'saveAnswer')->middleware('throttle:60,1')->name('save-answer');
        Route::post('/{attempt}/submit', 'submit')->name('submit');
    });

    // Handles payment processing and history specifically for the logged-in student
    Route::controller(StudentPaymentController::class)->prefix('payments')->name('payments.')->group(function () {
        Route::get('/', 'index')->name('index');
        // Protection from double-charges via atomic locks and rate limit throttling
        Route::post('/checkout', 'initiateCheckout')->middleware('throttle:5,1')->name('checkout');
        Route::get('/callback', 'callback')->name('callback');
    });
});

/**
 * Gateway Webhooks (Excluded from CSRF inside bootstrap/app.php)
 * Handles asynchronous payment confirmations from Stripe/PayPal.
 */
Route::post('webhooks/payments/{gateway}', [StudentPaymentController::class, 'webhook'])->name('webhooks.payments');

/**
 * Global Localization 
 * Session-based dynamic language switching endpoint.
 */
Route::post('/locale', [LocalizationController::class, 'update'])->name('locale.update');

// Authentication routes utilizing Laravel Breeze/Fortify endpoints
require __DIR__ . '/auth.php';
