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
    Route::post('exams/{exam}/attempt', [\App\Http\Controllers\Student\ExamController::class, 'attempt'])->name('exams.attempt');

    Route::get('payments', [\App\Http\Controllers\Student\PaymentController::class, 'index'])->name('payments.index');
});

require __DIR__ . '/auth.php';
