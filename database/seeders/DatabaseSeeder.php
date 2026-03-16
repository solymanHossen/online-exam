<?php

namespace Database\Seeders;

use App\Enums\ExamStatus;
use App\Enums\StudentStatus;
use App\Models\ActivityLog;
use App\Models\Batch;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\ExamRanking;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuestionStatistic;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentAnswer;
use App\Models\Subject;
use App\Models\SubjectPerformance;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    private const DEFAULT_PASSWORD = 'password';

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->seedSystemSettings();

        $adminRole = Role::query()->create(['name' => 'admin']);
        $teacherRole = Role::query()->create(['name' => 'teacher']);
        $studentRole = Role::query()->create(['name' => 'student']);

        $adminUser = $this->createVerifiedUser($adminRole, 'System Admin', 'admin@example.com', [
            'phone' => '+8801700000000',
        ]);

        $teachers = collect([
            ['name' => 'Ariana Carter', 'email' => 'teacher1@example.com'],
            ['name' => 'Nolan Brooks', 'email' => 'teacher2@example.com'],
            ['name' => 'Sofia Bennett', 'email' => 'teacher3@example.com'],
        ])->map(fn (array $teacher, int $index) => $this->createVerifiedUser(
            $teacherRole,
            $teacher['name'],
            $teacher['email'],
            [
                'phone' => '+88017123' . str_pad((string) ($index + 101), 3, '0', STR_PAD_LEFT),
                'last_login_at' => now()->subDays($index + 1),
            ],
        ));

        $batches = collect([
            ['name' => 'Batch Alpha 2026', 'class_level' => 'Grade 10', 'year' => 2026],
            ['name' => 'Batch Beta 2026', 'class_level' => 'Grade 11', 'year' => 2026],
            ['name' => 'Batch Gamma 2026', 'class_level' => 'Grade 12', 'year' => 2026],
        ])->map(fn (array $batch) => Batch::query()->create($batch));

        $subjects = collect([
            ['name' => 'Mathematics', 'code' => 'MTH101'],
            ['name' => 'Physics', 'code' => 'PHY101'],
            ['name' => 'Chemistry', 'code' => 'CHM101'],
            ['name' => 'Biology', 'code' => 'BIO101'],
            ['name' => 'English', 'code' => 'ENG101'],
            ['name' => 'Computer Science', 'code' => 'CSE101'],
        ])->map(function (array $subjectData, int $subjectIndex) use ($teachers) {
            $subject = Subject::query()->create($subjectData);

            collect([
                'Fundamentals',
                'Core Concepts',
                'Advanced Practice',
            ])->each(function (string $chapterName, int $chapterIndex) use ($subject) {
                Chapter::query()->create([
                    'subject_id' => $subject->id,
                    'name' => $chapterName,
                    'order' => $chapterIndex + 1,
                    'description' => $subject->name . ' ' . strtolower($chapterName) . ' chapter.',
                ]);
            });

            Material::query()->create([
                'title' => $subject->name . ' Quick Revision PDF',
                'subject_id' => $subject->id,
                'file_url' => 'https://example.com/materials/' . Str::slug($subject->name) . '-revision.pdf',
                'created_by' => $teachers[$subjectIndex % $teachers->count()]->id,
            ]);

            Material::query()->create([
                'title' => $subject->name . ' Formula Sheet',
                'subject_id' => $subject->id,
                'file_url' => 'https://example.com/materials/' . Str::slug($subject->name) . '-formula-sheet.pdf',
                'created_by' => $teachers[($subjectIndex + 1) % $teachers->count()]->id,
            ]);

            return $subject;
        });

        $students = collect(range(1, 24))->map(function (int $index) use ($studentRole, $batches) {
            $user = $this->createVerifiedUser(
                $studentRole,
                'Demo Student ' . $index,
                'student' . $index . '@example.com',
                [
                    'phone' => '+88018123' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                    'last_login_at' => now()->subHours($index),
                ],
            );

            $batch = $batches[($index - 1) % $batches->count()];

            Student::query()->create([
                'user_id' => $user->id,
                'roll_number' => 'STD-' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                'guardian_name' => 'Guardian ' . $index,
                'guardian_phone' => '+88019123' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                'batch_id' => $batch->id,
                'admission_date' => now()->subMonths(rand(1, 12))->toDateString(),
                'status' => StudentStatus::Active->value,
            ]);

            return $user;
        });

        $questions = collect();
        $questionsBySubject = collect();
        foreach ($subjects as $subjectIndex => $subject) {
            $chapters = Chapter::query()->where('subject_id', $subject->id)->orderBy('order')->get();

            foreach ($chapters as $chapterIndex => $chapter) {
                for ($i = 1; $i <= 10; $i++) {
                    $questionNumber = ($subjectIndex * 30) + ($chapterIndex * 10) + $i;
                    $question = Question::query()->create([
                        'subject_id' => $subject->id,
                        'chapter_id' => $chapter->id,
                        'question_text' => sprintf('%s Question %d: choose the best answer.', $subject->name, $questionNumber),
                        'question_image' => null,
                        'explanation' => 'Detailed explanation for ' . $subject->name . ' question ' . $questionNumber . '.',
                        'difficulty' => collect(['easy', 'medium', 'hard'])->random(),
                        'marks' => collect([1, 2, 3, 4])->random(),
                        'negative_marks' => 0.50,
                        'created_by' => $teachers[$questionNumber % $teachers->count()]->id,
                        'is_active' => true,
                    ]);

                    collect(['A', 'B', 'C', 'D'])->each(function (string $optionLabel, int $optionIndex) use ($question, $subject, $questionNumber) {
                        QuestionOption::query()->create([
                            'question_id' => $question->id,
                            'option_text' => sprintf('%s option %s for question %d', $subject->name, $optionLabel, $questionNumber),
                            'option_image' => null,
                            'is_correct' => $optionIndex === 0,
                        ]);
                    });

                    $questions->push($question);
                    $questionsBySubject[$subject->id] = ($questionsBySubject[$subject->id] ?? collect())->push($question);
                }
            }
        }

        $exams = collect();
        $examQuestionsMap = [];
        foreach ($batches as $batchIndex => $batch) {
            $examDefinitions = collect(range(1, 10))->map(function (int $number) use ($batch) {
                if ($number <= 4) {
                    return [
                        'title' => sprintf('%s Mock Test %02d', $batch->name, $number),
                        'status' => ExamStatus::PUBLISHED,
                        'start_time' => now()->subDays(28 - ($number * 3)),
                        'end_time' => now()->subDays(27 - ($number * 3)),
                        'duration_minutes' => collect([45, 60, 75])->random(),
                        'price' => $number % 2 === 0 ? 9.99 : 0,
                    ];
                }

                if ($number <= 7) {
                    return [
                        'title' => sprintf('%s Live Assessment %02d', $batch->name, $number - 4),
                        'status' => ExamStatus::PUBLISHED,
                        'start_time' => now()->subHours(3 + $number),
                        'end_time' => now()->addDays(2 + ($number - 5)),
                        'duration_minutes' => collect([60, 75, 90])->random(),
                        'price' => collect([0, 14.99, 19.99])->random(),
                    ];
                }

                if ($number <= 9) {
                    return [
                        'title' => sprintf('%s Upcoming Exam %02d', $batch->name, $number - 7),
                        'status' => ExamStatus::PUBLISHED,
                        'start_time' => now()->addDays($number - 5),
                        'end_time' => now()->addDays($number - 4),
                        'duration_minutes' => collect([75, 90, 120])->random(),
                        'price' => collect([14.99, 19.99, 24.99])->random(),
                    ];
                }

                return [
                    'title' => sprintf('%s Practice Draft %02d', $batch->name, $number - 9),
                    'status' => ExamStatus::DRAFT,
                    'start_time' => now()->addDays(15 + $number),
                    'end_time' => now()->addDays(16 + $number),
                    'duration_minutes' => 60,
                    'price' => 0,
                ];
            })->all();

            foreach ($examDefinitions as $definitionIndex => $definition) {
                $exam = Exam::query()->create([
                    'title' => $definition['title'],
                    'description' => 'Demo exam generated for ' . $batch->name . '.',
                    'batch_id' => $batch->id,
                    'price' => $definition['price'],
                    'total_marks' => 100,
                    'duration_minutes' => $definition['duration_minutes'],
                    'pass_marks' => 40,
                    'negative_enabled' => true,
                    'shuffle_questions' => true,
                    'shuffle_options' => true,
                    'show_result_immediately' => true,
                    'start_time' => $definition['start_time'],
                    'end_time' => $definition['end_time'],
                    'status' => $definition['status'],
                    'created_by' => $teachers[($batchIndex + $definitionIndex) % $teachers->count()]->id,
                ]);

                $subjectIdsForBatch = $subjects->shuffle()->take(4)->pluck('id');
                $examQuestionPool = $subjectIdsForBatch
                    ->flatMap(fn ($subjectId) => $questionsBySubject[$subjectId] ?? collect())
                    ->shuffle()
                    ->take(25)
                    ->values();

                foreach ($examQuestionPool as $order => $question) {
                    ExamQuestion::query()->create([
                        'exam_id' => $exam->id,
                        'question_id' => $question->id,
                        'question_order' => $order + 1,
                    ]);
                }

                $examQuestionsMap[$exam->id] = $examQuestionPool->values();

                $exams->push($exam);
            }
        }

        $exams->push(Exam::query()->create([
            'title' => 'Global Draft Exam',
            'description' => 'Draft exam for admin preview.',
            'batch_id' => null,
            'price' => 0,
            'total_marks' => 50,
            'duration_minutes' => 45,
            'pass_marks' => 20,
            'negative_enabled' => false,
            'shuffle_questions' => false,
            'shuffle_options' => true,
            'show_result_immediately' => false,
            'start_time' => now()->addDays(10),
            'end_time' => now()->addDays(11),
            'status' => ExamStatus::DRAFT,
            'created_by' => $adminUser->id,
        ]));

        $questionStats = [];
        $subjectPerformanceAccumulator = [];

        foreach ($students as $index => $studentUser) {
            $studentProfile = Student::query()->where('user_id', $studentUser->id)->firstOrFail();
            $batchExams = $exams->where('batch_id', $studentProfile->batch_id)->values();
            $completedExams = $batchExams->filter(function (Exam $exam) {
                return $exam->status === ExamStatus::PUBLISHED
                    && $exam->end_time !== null
                    && $exam->end_time->isPast();
            })->values();

            foreach ($completedExams->take(4) as $completedExamIndex => $exam) {
                $accuracy = 55 + (($index + 1) * 3) + ($completedExamIndex * 7);
                $this->createCompletedAttempt(
                    $exam,
                    $studentUser,
                    min($accuracy, 92),
                    $examQuestionsMap[$exam->id] ?? collect(),
                    $questionStats,
                    $subjectPerformanceAccumulator,
                );
            }

            if ($index < 6) {
                $activeExam = $batchExams->first(function (Exam $exam) {
                    return $exam->status === ExamStatus::PUBLISHED
                        && $exam->start_time !== null
                        && $exam->start_time->isPast()
                        && $exam->end_time !== null
                        && $exam->end_time->isFuture();
                });

                if ($activeExam instanceof Exam) {
                    $this->createInProgressAttempt($activeExam, $studentUser, $examQuestionsMap[$activeExam->id] ?? collect());
                }
            }

            $paidExam = $batchExams->first(fn (Exam $exam) => (float) $exam->price > 0);
            if ($paidExam instanceof Exam) {
                Payment::query()->create([
                    'user_id' => $studentUser->id,
                    'amount' => $paidExam->price,
                    'currency' => 'USD',
                    'status' => 'completed',
                    'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
                    'gateway_name' => 'stripe',
                    'type' => 'exam_fee',
                    'description' => 'exam_id:' . $paidExam->id . ' - Successful exam payment',
                ]);
            }

            Payment::query()->create([
                'user_id' => $studentUser->id,
                'amount' => 12.99,
                'currency' => 'USD',
                'status' => 'pending',
                'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
                'gateway_name' => 'paypal',
                'type' => 'subscription',
                'description' => 'Premium analytics subscription pending.',
            ]);

            Payment::query()->create([
                'user_id' => $studentUser->id,
                'amount' => 7.50,
                'currency' => 'USD',
                'status' => 'failed',
                'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
                'gateway_name' => 'stripe',
                'type' => 'exam_fee',
                'description' => 'Failed retry payment for optional mock exam.',
            ]);
        }

        foreach ($questionStats as $questionId => $stats) {
            QuestionStatistic::query()->create([
                'question_id' => $questionId,
                'times_attempted' => $stats['times_attempted'],
                'times_correct' => $stats['times_correct'],
            ]);
        }

        $questions
            ->reject(fn (Question $question) => array_key_exists($question->id, $questionStats))
            ->each(function (Question $question) {
                QuestionStatistic::query()->create([
                    'question_id' => $question->id,
                    'times_attempted' => rand(4, 16),
                    'times_correct' => rand(1, 12),
                ]);
            });

        foreach ($subjectPerformanceAccumulator as $userId => $subjectsMap) {
            foreach ($subjectsMap as $subjectId => $stats) {
                SubjectPerformance::query()->create([
                    'user_id' => $userId,
                    'subject_id' => $subjectId,
                    'proficiency_level' => round($stats['score_sum'] / max($stats['attempts'], 1), 2),
                ]);
            }
        }

        foreach ($students as $studentUser) {
            $existingSubjectIds = SubjectPerformance::query()
                ->where('user_id', $studentUser->id)
                ->pluck('subject_id');

            $subjects
                ->reject(fn (Subject $subject) => $existingSubjectIds->contains($subject->id))
                ->take(2)
                ->each(function (Subject $subject) use ($studentUser) {
                    SubjectPerformance::query()->create([
                        'user_id' => $studentUser->id,
                        'subject_id' => $subject->id,
                        'proficiency_level' => rand(45, 88),
                    ]);
                });
        }

        $completedAttempts = ExamAttempt::query()
            ->where('is_completed', true)
            ->orderByDesc('total_score')
            ->get()
            ->groupBy('exam_id');

        foreach ($completedAttempts as $examId => $attempts) {
            $attempts->values()->each(function (ExamAttempt $attempt, int $rankIndex) use ($examId) {
                ExamRanking::query()->create([
                    'exam_id' => $examId,
                    'user_id' => $attempt->user_id,
                    'rank' => $rankIndex + 1,
                    'total_score' => $attempt->total_score,
                ]);
            });
        }

        collect([$adminUser])
            ->merge($teachers)
            ->merge($students)
            ->each(function (User $user, int $index) use ($exams) {
                Notification::query()->create([
                    'user_id' => $user->id,
                    'title' => 'Welcome to Online Exam',
                    'message' => 'Your demo account is ready with dashboard data and sample records.',
                    'type' => 'system',
                    'read_at' => $index % 2 === 0 ? now()->subDay() : null,
                ]);

                Notification::query()->create([
                    'user_id' => $user->id,
                    'title' => 'Exam Schedule Updated',
                    'message' => 'A new assessment is now visible in your exam list.',
                    'type' => 'exam',
                    'read_at' => null,
                ]);

                ActivityLog::query()->create([
                    'user_id' => $user->id,
                    'action' => 'Logged into the system',
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Seeder Demo Browser',
                ]);

                ActivityLog::query()->create([
                    'user_id' => $user->id,
                    'action' => 'Viewed ' . $exams->random()->title,
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Seeder Demo Browser',
                ]);
            });

        $this->command?->newLine();
        $this->command?->info('Demo seed completed successfully.');
        $this->command?->info('Admin login: admin@example.com / ' . self::DEFAULT_PASSWORD);
        $this->command?->info('Teacher login: teacher1@example.com / ' . self::DEFAULT_PASSWORD);
        $this->command?->info('Student login: student1@example.com / ' . self::DEFAULT_PASSWORD);
    }

    private function seedSystemSettings(): void
    {
        collect([
            'site_name' => 'Online Exam Platform',
            'site_email' => 'support@example.com',
            'default_currency' => 'USD',
            'timezone' => 'Asia/Dhaka',
            'allow_registration' => '1',
        ])->each(function (string $value, string $key) {
            SystemSetting::query()->create([
                'key' => $key,
                'value' => $value,
            ]);
        });
    }

    private function createVerifiedUser(Role $role, string $name, string $email, array $overrides = []): User
    {
        $user = User::query()->create(array_merge([
            'role_id' => $role->id,
            'name' => $name,
            'email' => $email,
            'phone' => '+8801700000000',
            'password' => self::DEFAULT_PASSWORD,
            'avatar' => null,
            'is_active' => true,
            'last_login_at' => now(),
        ], $overrides));

        $user->forceFill([
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ])->save();

        return $user;
    }

    private function createCompletedAttempt(
        Exam $exam,
        User $student,
        int $accuracy,
        Collection $examQuestions,
        array &$questionStats,
        array &$subjectPerformanceAccumulator,
    ): void {
        $attempt = ExamAttempt::query()->create([
            'exam_id' => $exam->id,
            'user_id' => $student->id,
            'start_time' => $exam->start_time?->copy()?->addMinutes(rand(1, 12)) ?? now()->subHours(2),
            'end_time' => $exam->start_time?->copy()?->addMinutes($exam->duration_minutes ?? 60) ?? now()->subHour(),
            'is_completed' => true,
            'total_score' => 0,
        ]);

        $score = 0.0;
        foreach ($examQuestions as $question) {
            if (! $question instanceof Question) {
                continue;
            }

            $options = $question->options;
            $correctOption = $options->firstWhere('is_correct', true);
            $incorrectOptions = $options->where('is_correct', false)->values();

            if (! $correctOption instanceof QuestionOption || $incorrectOptions->isEmpty()) {
                continue;
            }

            $isCorrect = rand(1, 100) <= $accuracy;
            $selectedOption = $isCorrect ? $correctOption : $incorrectOptions->random();
            $marksAwarded = $isCorrect ? (float) $question->marks : -1 * (float) $question->negative_marks;
            $score += $marksAwarded;

            StudentAnswer::query()->create([
                'exam_attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'selected_option_id' => $selectedOption->id,
                'is_correct' => $isCorrect,
                'marks_awarded' => $marksAwarded,
            ]);

            $questionStats[$question->id] = [
                'times_attempted' => ($questionStats[$question->id]['times_attempted'] ?? 0) + 1,
                'times_correct' => ($questionStats[$question->id]['times_correct'] ?? 0) + ($isCorrect ? 1 : 0),
            ];

            $subjectPerformanceAccumulator[$student->id][$question->subject_id] = [
                'score_sum' => ($subjectPerformanceAccumulator[$student->id][$question->subject_id]['score_sum'] ?? 0) + max($marksAwarded, 0),
                'attempts' => ($subjectPerformanceAccumulator[$student->id][$question->subject_id]['attempts'] ?? 0) + 1,
            ];
        }

        $attempt->update([
            'total_score' => max(round($score, 2), 0),
        ]);
    }

    private function createInProgressAttempt(Exam $exam, User $student, Collection $examQuestions): void
    {
        $attempt = ExamAttempt::query()->create([
            'exam_id' => $exam->id,
            'user_id' => $student->id,
            'start_time' => now()->subMinutes(rand(5, 20)),
            'end_time' => now()->addMinutes(60),
            'is_completed' => false,
            'total_score' => 0,
        ]);

        foreach ($examQuestions->take(5) as $question) {
            if (! $question instanceof Question || $question->options->isEmpty()) {
                continue;
            }

            $selectedOption = $question->options->random();

            StudentAnswer::query()->create([
                'exam_attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'selected_option_id' => $selectedOption->id,
                'is_correct' => $selectedOption->is_correct,
                'marks_awarded' => $selectedOption->is_correct ? (float) $question->marks : 0,
            ]);
        }
    }
}
