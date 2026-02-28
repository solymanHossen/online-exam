<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\Payment;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentAnswer;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $teacherRole = Role::firstOrCreate(['name' => 'Teacher']);
        $studentRole = Role::firstOrCreate(['name' => 'Student']);

        // 2. Admin User
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'role_id' => $adminRole->id,
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 3. Batches & Subjects
        $batch = Batch::firstOrCreate(['name' => '2026 CodeCanyon Demo Batch', 'class_level' => 'Grade 12']);
        $subject = Subject::factory()->create(['name' => 'General Knowledge']);
        $chapter = Chapter::factory()->create(['subject_id' => $subject->id, 'name' => 'Demo Chapter']);

        // 4. Generate EXACTLY 50 Questions with Options
        $questions = collect();
        for ($i = 0; $i < 50; $i++) {
            $question = Question::factory()->create([
                'subject_id' => $subject->id,
                'chapter_id' => $chapter->id,
                'created_by' => $adminUser->id,
                'question_text' => "Sample Demo Question #" . ($i + 1) . " for CodeCanyon Testing.",
                'marks' => 2,
                'negative_marks' => 0.5,
            ]);

            // Create 1 correct, 3 incorrect options
            QuestionOption::factory()->correct()->create(['question_id' => $question->id, 'option_text' => 'Correct Option A']);
            QuestionOption::factory()->incorrect()->create(['question_id' => $question->id, 'option_text' => 'Incorrect Option B']);
            QuestionOption::factory()->incorrect()->create(['question_id' => $question->id, 'option_text' => 'Incorrect Option C']);
            QuestionOption::factory()->incorrect()->create(['question_id' => $question->id, 'option_text' => 'Incorrect Option D']);

            $questions->push($question);
        }

        // 5. Generate EXACTLY 3 Exams (Past, Active, Upcoming)
        $exams = collect();

        // Active Exam (Live Now)
        $exams->push(Exam::factory()->published()->create([
            'batch_id' => $batch->id,
            'created_by' => $adminUser->id,
            'title' => 'Live Demo Assessment',
            'start_time' => now()->subMinutes(10),
            'end_time' => now()->addDays(2),
            'duration_minutes' => 60,
        ]));

        // Upcoming Exam
        $exams->push(Exam::factory()->published()->create([
            'batch_id' => $batch->id,
            'created_by' => $adminUser->id,
            'title' => 'Upcoming Final Exam',
            'start_time' => now()->addDays(1),
            'end_time' => now()->addDays(5),
            'duration_minutes' => 120,
        ]));

        // Past Exam
        $exams->push(Exam::factory()->published()->create([
            'batch_id' => $batch->id,
            'created_by' => $adminUser->id,
            'title' => 'Completed Mock Test',
            'start_time' => now()->subDays(5),
            'end_time' => now()->subDays(3),
            'duration_minutes' => 45,
        ]));

        // Attach random questions to exams
        foreach ($exams as $exam) {
            $examQuestions = $questions->random(15);
            $order = 1;
            foreach ($examQuestions as $eq) {
                ExamQuestion::firstOrCreate([
                    'exam_id' => $exam->id,
                    'question_id' => $eq->id,
                    'question_order' => $order++,
                ]);
            }
        }

        // 6. Generate EXACTLY 5 Students
        $students = collect();
        for ($i = 1; $i <= 5; $i++) {
            $studentUser = User::updateOrCreate(
                ['email' => "student{$i}@example.com"],
                [
                    'role_id' => $studentRole->id,
                    'name' => "Demo Student {$i}",
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            Student::firstOrCreate(
                ['user_id' => $studentUser->id],
                ['batch_id' => $batch->id]
            );

            $students->push($studentUser);
        }

        // 7. Seed 1 Completed Attempt for the Past Exam for Student 1 to show results UI
        $pastExam = $exams->last();
        $demoStudent1 = $students->first();

        $attempt = ExamAttempt::create([
            'id' => Str::uuid(),
            'exam_id' => $pastExam->id,
            'user_id' => $demoStudent1->id,
            'start_time' => $pastExam->start_time->addMinutes(5),
            'end_time' => $pastExam->start_time->addMinutes(45),
            'is_completed' => true,
            'total_score' => 20,
        ]);

        $examQuestions = ExamQuestion::where('exam_id', $pastExam->id)->get();
        foreach ($examQuestions as $eq) {
            $options = QuestionOption::where('question_id', $eq->question_id)->get();
            if ($options->isNotEmpty()) {
                $selectedOption = $options->random();
                StudentAnswer::create([
                    'id' => Str::uuid(),
                    'exam_attempt_id' => $attempt->id,
                    'question_id' => $eq->question_id,
                    'selected_option_id' => $selectedOption->id,
                    'answer_text' => null,
                ]);
            }
        }
    }
}
