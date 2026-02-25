<?php

namespace Tests\Feature;

use App\Jobs\EvaluateExamAttempt;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamRanking;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuestionStatistic;
use App\Models\StudentAnswer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluateExamAttemptTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    private function createCoreData($negativeEnabled = true)
    {
        $user = User::factory()->create();

        $exam = Exam::create([
            'title' => 'Test Exam',
            'duration_minutes' => 60,
            'status' => 'published',
            'negative_enabled' => $negativeEnabled,
            'batch_id' => \App\Models\Batch::create(['name' => 'Test Batch', 'class_level' => '10', 'year' => 2026, 'status' => 'active'])->id,
            'created_by' => $user->id,
        ]);

        $subject = \App\Models\Subject::create(['name' => 'Math', 'code' => 'MATH101']);
        $chapter = \App\Models\Chapter::create(['subject_id' => $subject->id, 'name' => 'Algebra 1', 'order' => 1]);

        return [$user, $exam, $subject, $chapter];
    }

    public function test_job_calculates_score_correctly_and_handles_negatives()
    {
        [$user, $exam, $subject, $chapter] = $this->createCoreData(true);

        // Create Question 1 (Correct)
        $q1 = Question::create([
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'created_by' => $user->id,
            'question_text' => 'Q1',
            'difficulty' => 'easy',
            'marks' => 5,
            'negative_marks' => 2,
        ]);
        $q1_opt_correct = QuestionOption::create(['question_id' => $q1->id, 'option_text' => 'Right', 'is_correct' => true]);
        $q1_opt_wrong = QuestionOption::create(['question_id' => $q1->id, 'option_text' => 'Wrong', 'is_correct' => false]);

        // Create Question 2 (Wrong)
        $q2 = Question::create([
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'created_by' => $user->id,
            'question_text' => 'Q2',
            'difficulty' => 'easy',
            'marks' => 4,
            'negative_marks' => 1,
        ]);
        $q2_opt_correct = QuestionOption::create(['question_id' => $q2->id, 'option_text' => 'Right', 'is_correct' => true]);
        $q2_opt_wrong = QuestionOption::create(['question_id' => $q2->id, 'option_text' => 'Wrong', 'is_correct' => false]);

        // Create Question 3 (Skipped / Unanswered)
        $q3 = Question::create([
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'created_by' => $user->id,
            'question_text' => 'Q3',
            'difficulty' => 'easy',
            'marks' => 2,
            'negative_marks' => 0.5,
        ]);

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'start_time' => now(),
            'end_time' => now()->addMinutes(60),
            'is_completed' => false,
            'total_score' => 0,
        ]);

        // Answer Q1 Correctly
        StudentAnswer::create([
            'exam_attempt_id' => $attempt->id,
            'question_id' => $q1->id,
            'selected_option_id' => $q1_opt_correct->id,
        ]);

        // Answer Q2 Wrongly
        StudentAnswer::create([
            'exam_attempt_id' => $attempt->id,
            'question_id' => $q2->id,
            'selected_option_id' => $q2_opt_wrong->id,
        ]);

        // Answer Q3 Skipped
        StudentAnswer::create([
            'exam_attempt_id' => $attempt->id,
            'question_id' => $q3->id,
            'selected_option_id' => null,
        ]);

        // Run the Job
        (new EvaluateExamAttempt($attempt))->handle();

        $attempt->refresh();

        $this->assertEquals(4, $attempt->total_score);
        $this->assertTrue($attempt->is_completed);

        $ans1 = StudentAnswer::where('question_id', $q1->id)->first();
        $this->assertTrue($ans1->is_correct);
        $this->assertEquals(5, $ans1->marks_awarded);

        $ans2 = StudentAnswer::where('question_id', $q2->id)->first();
        $this->assertFalse($ans2->is_correct);
        $this->assertEquals(-1, $ans2->marks_awarded);

        $ans3 = StudentAnswer::where('question_id', $q3->id)->first();
        $this->assertFalse($ans3->is_correct);
        $this->assertEquals(0, $ans3->marks_awarded);
    }

    public function test_it_does_not_result_in_negative_total_score()
    {
        [$user, $exam, $subject, $chapter] = $this->createCoreData(true);

        $q1 = Question::create([
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'created_by' => $user->id,
            'question_text' => 'Q1',
            'difficulty' => 'easy',
            'marks' => 5,
            'negative_marks' => 10,
        ]);
        $q1_opt_wrong = QuestionOption::create(['question_id' => $q1->id, 'option_text' => 'Wrong', 'is_correct' => false]);

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'start_time' => now(),
            'end_time' => now()->addMinutes(60),
            'is_completed' => false,
            'total_score' => 0,
        ]);

        StudentAnswer::create([
            'exam_attempt_id' => $attempt->id,
            'question_id' => $q1->id,
            'selected_option_id' => $q1_opt_wrong->id,
        ]);

        (new EvaluateExamAttempt($attempt))->handle();
        $attempt->refresh();

        $this->assertEquals(0, $attempt->total_score);
    }

    public function test_it_updates_question_statistics_dynamically()
    {
        [$user, $exam, $subject, $chapter] = $this->createCoreData(true);

        $q1 = Question::create([
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'created_by' => $user->id,
            'question_text' => 'Q1',
            'difficulty' => 'easy',
            'marks' => 5,
            'negative_marks' => 2,
        ]);
        $q1_opt_correct = QuestionOption::create(['question_id' => $q1->id, 'option_text' => 'Right', 'is_correct' => true]);

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'start_time' => now(),
            'end_time' => now()->addMinutes(60),
            'is_completed' => false,
            'total_score' => 0,
        ]);

        StudentAnswer::create([
            'exam_attempt_id' => $attempt->id,
            'question_id' => $q1->id,
            'selected_option_id' => $q1_opt_correct->id,
        ]);

        (new EvaluateExamAttempt($attempt))->handle();

        $stat = QuestionStatistic::where('question_id', $q1->id)->first();
        $this->assertNotNull($stat);
        $this->assertEquals(1, $stat->times_attempted);
        $this->assertEquals(1, $stat->times_correct);
    }

    public function test_rankings_updated_correctly_based_on_score_and_time()
    {
        [$user1, $exam, $subject, $chapter] = $this->createCoreData(true);
        $user2 = User::factory()->create();

        $q1 = Question::create([
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'created_by' => $user1->id,
            'question_text' => 'Q1',
            'difficulty' => 'easy',
            'marks' => 10,
            'negative_marks' => 0,
        ]);
        $q1_opt_correct = QuestionOption::create(['question_id' => $q1->id, 'option_text' => 'Right', 'is_correct' => true]);

        // Attempt 1: Took 50 mins
        $attempt1 = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user1->id,
            'start_time' => now()->subMinutes(60),
            'end_time' => now()->subMinutes(10),
            'is_completed' => false,
            'total_score' => 0,
        ]);
        StudentAnswer::create([
            'exam_attempt_id' => $attempt1->id,
            'question_id' => $q1->id,
            'selected_option_id' => $q1_opt_correct->id,
        ]);

        // Attempt 2: Took 40 mins
        $attempt2 = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user2->id,
            'start_time' => now()->subMinutes(60),
            'end_time' => now()->subMinutes(20),
            'is_completed' => false,
            'total_score' => 0,
        ]);
        StudentAnswer::create([
            'exam_attempt_id' => $attempt2->id,
            'question_id' => $q1->id,
            'selected_option_id' => $q1_opt_correct->id,
        ]);

        (new EvaluateExamAttempt($attempt1))->handle();
        (new EvaluateExamAttempt($attempt2))->handle();

        // User 2 should be Rank 1 since they finished earlier
        $rankUser2 = ExamRanking::where('exam_id', $exam->id)->where('user_id', $user2->id)->first();
        $rankUser1 = ExamRanking::where('exam_id', $exam->id)->where('user_id', $user1->id)->first();

        $this->assertEquals(1, $rankUser2->rank);
        $this->assertEquals(2, $rankUser1->rank);
    }
}
