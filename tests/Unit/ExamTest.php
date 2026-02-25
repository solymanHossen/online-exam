<?php

namespace Tests\Unit;

use App\Enums\ExamStatus;
use App\Models\Batch;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ExamTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_create_an_exam_with_all_fillable_attributes()
    {
        $batch = Batch::factory()->create();
        $user = User::factory()->admin()->create();

        $examData = [
            'title' => 'Midterm Mathematics',
            'description' => 'Comprehensive exam covering chapters 1-5.',
            'batch_id' => $batch->id,
            'total_marks' => 100,
            'duration_minutes' => 90,
            'pass_marks' => 40,
            'negative_enabled' => true,
            'shuffle_questions' => true,
            'shuffle_options' => false,
            'show_result_immediately' => true,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDays(2),
            'status' => ExamStatus::DRAFT,
            'created_by' => $user->id,
        ];

        $exam = Exam::create($examData);

        $this->assertDatabaseHas('exams', [
            'id' => $exam->id,
            'title' => 'Midterm Mathematics',
            'total_marks' => 100,
            'negative_enabled' => true,
            'batch_id' => $batch->id,
            'created_by' => $user->id,
            'status' => 'draft',
        ]);

        $this->assertInstanceOf(Exam::class, $exam);
        $this->assertEquals('Midterm Mathematics', $exam->title);
    }

    public function test_it_has_a_batch_relationship()
    {
        $batch = Batch::factory()->create();
        $exam = Exam::factory()->create(['batch_id' => $batch->id]);

        $this->assertInstanceOf(Batch::class, $exam->batch);
        $this->assertEquals($batch->id, $exam->batch->id);
    }

    public function test_it_has_a_creator_relationship()
    {
        $user = User::factory()->admin()->create();
        $exam = Exam::factory()->create(['created_by' => $user->id]);

        $this->assertInstanceOf(User::class, $exam->creator);
        $this->assertEquals($user->id, $exam->creator->id);
    }

    public function test_it_has_questions_relationship()
    {
        $exam = Exam::factory()->create();
        $question = Question::factory()->create();

        // Simulating the pivot/relationship table entry
        $examQuestion = ExamQuestion::create([
            'exam_id' => $exam->id,
            'question_id' => $question->id,
            'question_order' => 1,
        ]);

        $this->assertTrue($exam->questions->contains($examQuestion));
        $this->assertInstanceOf(ExamQuestion::class, $exam->questions->first());
        $this->assertCount(1, $exam->questions);
    }

    public function test_it_casts_attributes_correctly()
    {
        $exam = Exam::factory()->create([
            'negative_enabled' => 1,
            'shuffle_questions' => 0,
            'start_time' => '2026-02-24 10:00:00',
            'status' => 'published',
        ]);

        $this->assertIsBool($exam->negative_enabled);
        $this->assertTrue($exam->negative_enabled);

        $this->assertIsBool($exam->shuffle_questions);
        $this->assertFalse($exam->shuffle_questions);

        $this->assertInstanceOf(Carbon::class, $exam->start_time);

        $this->assertInstanceOf(ExamStatus::class, $exam->status);
        $this->assertEquals(ExamStatus::PUBLISHED, $exam->status);
    }

    public function test_active_scope_filters_published_and_ongoing_exams()
    {
        // 1. Active: Published, started in past, ends in future
        Exam::factory()->create([
            'status' => ExamStatus::PUBLISHED,
            'start_time' => now()->subDay(),
            'end_time' => now()->addDay(),
        ]);

        // 2. Draft: Not published
        Exam::factory()->create([
            'status' => ExamStatus::DRAFT,
            'start_time' => now()->subDay(),
            'end_time' => now()->addDay(),
        ]);

        // 3. Expired: Published but ended in past
        Exam::factory()->create([
            'status' => ExamStatus::PUBLISHED,
            'start_time' => now()->subDays(3),
            'end_time' => now()->subDay(),
        ]);

        // 4. Upcoming: Published but starts in future
        Exam::factory()->create([
            'status' => ExamStatus::PUBLISHED,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDays(2),
        ]);

        $activeExams = Exam::active()->get();

        $this->assertCount(1, $activeExams);
    }

    public function test_upcoming_scope_filters_published_and_future_exams()
    {
        // 1. Upcoming: Published but starts in future
        Exam::factory()->create([
            'status' => ExamStatus::PUBLISHED,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDays(2),
        ]);

        // 2. Draft Upcoming: Starts in future but DRAFT
        Exam::factory()->create([
            'status' => ExamStatus::DRAFT,
            'start_time' => now()->addDay(),
            'end_time' => now()->addDays(2),
        ]);

        // 3. Active: Published, started in past
        Exam::factory()->create([
            'status' => ExamStatus::PUBLISHED,
            'start_time' => now()->subDay(),
            'end_time' => now()->addDay(),
        ]);

        $upcomingExams = Exam::upcoming()->get();

        $this->assertCount(1, $upcomingExams);
    }
}
