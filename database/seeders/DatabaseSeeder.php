<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\User;
use App\Models\Batch;
use App\Models\Subject;
use App\Models\Chapter;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Student;
use App\Models\ExamAttempt;
use App\Models\StudentAnswer;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

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

        // 2. Users (Admin & Teachers)
        $adminUser = User::factory()->create([
            'role_id' => $adminRole->id,
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $teachers = User::factory(5)->create([
            'role_id' => $teacherRole->id,
            'password' => Hash::make('password'),
        ]);

        // 3. Batches
        $batches = Batch::factory(3)->create();

        // 4. Subjects & Chapters & Questions
        $subjects = Subject::factory(15)->create(); // Spread across conceptual batches
        $allQuestions = collect();

        foreach ($subjects as $subject) {
            $chapters = Chapter::factory(3)->create([
                'subject_id' => $subject->id,
            ]);

            foreach ($chapters as $chapter) {
                $questions = Question::factory(10)->create([
                    'subject_id' => $subject->id,
                    'chapter_id' => $chapter->id,
                    'created_by' => $teachers->random()->id,
                ]);

                foreach ($questions as $question) {
                    $allQuestions->push($question);

                    // Options: 1 correct, 3 incorrect
                    QuestionOption::factory(1)->correct()->create([
                        'question_id' => $question->id,
                    ]);
                    QuestionOption::factory(3)->incorrect()->create([
                        'question_id' => $question->id,
                    ]);
                }
            }
        }

        // 5. Exams
        $exams = collect();
        foreach ($batches as $batch) {
            $batchExams = Exam::factory(2)->published()->create([
                'batch_id' => $batch->id,
                'created_by' => $adminUser->id,
            ]);

            foreach ($batchExams as $exam) {
                $randomQuestions = $allQuestions->random(10);
                foreach ($randomQuestions as $rq) {
                    ExamQuestion::firstOrCreate([
                        'exam_id' => $exam->id,
                        'question_id' => $rq->id,
                    ]);
                }
                $exams->push($exam);
            }
        }

        // 6. Students
        $students = collect();
        for ($i = 0; $i < 20; $i++) {
            $studentUser = User::factory()->create([
                'role_id' => $studentRole->id,
                'email' => "student{$i}@example.com",
            ]);

            $student = Student::factory()->create([
                'user_id' => $studentUser->id,
                'batch_id' => $batches->random()->id,
            ]);

            $students->push($student);
        }

        // 7. Exam Attempts and Payments
        foreach ($students as $student) {
            Payment::factory(random_int(1, 3))->create([
                'user_id' => $student->user_id,
            ]);

            $studentExams = $exams->random(random_int(1, 3));
            foreach ($studentExams as $exam) {
                $attempt = ExamAttempt::factory()->completed()->create([
                    'exam_id' => $exam->id,
                    'user_id' => $student->user_id,
                ]);

                $examQuestions = ExamQuestion::where('exam_id', $exam->id)->get();
                foreach ($examQuestions as $eq) {
                    $options = QuestionOption::where('question_id', $eq->question_id)->get();

                    if ($options->isNotEmpty()) {
                        $selectedOption = $options->random();
                        StudentAnswer::factory()->create([
                            'exam_attempt_id' => $attempt->id,
                            'question_id' => $eq->question_id,
                            'selected_option_id' => random_int(0, 1) ? $selectedOption->id : null,
                            'is_correct' => $selectedOption->is_correct,
                        ]);
                    }
                }
            }
        }
    }
}
