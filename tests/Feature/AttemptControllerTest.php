<?php

namespace Tests\Feature;

use App\Jobs\EvaluateExamAttempt;
use App\Models\Batch;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AttemptControllerTest extends TestCase
{
    use RefreshDatabase;

    private function createCoreData()
    {
        $user = User::factory()->create();

        $batch = Batch::create(['name' => 'B1', 'class_level' => '10', 'year' => 2026, 'status' => 'active']);

        $exam = Exam::create([
            'title' => 'Test Exam',
            'duration_minutes' => 60,
            'status' => 'published',
            'negative_enabled' => false,
            'batch_id' => $batch->id,
            'created_by' => User::factory()->create()->id,
        ]);

        return [$user, $exam];
    }

    public function test_submits_exam_successfully_and_dispatches_job()
    {
        Queue::fake();

        [$user, $exam] = $this->createCoreData();

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'start_time' => now()->subMinutes(10),
            'end_time' => now()->addMinutes(50),
            'is_completed' => false,
            'total_score' => 0,
        ]);

        $response = $this->actingAs($user)->post(route('student.attempts.submit', $attempt->id));

        $response->assertRedirect(route('student.exams.index'));
        $response->assertSessionHas('success');

        $attempt->refresh();
        $this->assertTrue($attempt->is_completed);

        Queue::assertPushed(EvaluateExamAttempt::class, function ($job) {
            // Can't directly access protected $attempt easily, but relying on class pushed
            return true;
        });
    }

    public function test_prevents_submitting_already_completed_exam()
    {
        Queue::fake();

        [$user, $exam] = $this->createCoreData();

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'start_time' => now()->subMinutes(60),
            'end_time' => now(),
            'is_completed' => true, // Already completed
            'total_score' => 50,
        ]);

        $response = $this->actingAs($user)->post(route('student.attempts.submit', $attempt->id));

        $response->assertRedirect(route('student.exams.index'));
        $response->assertSessionHas('error', 'Exam is already submitted.');

        Queue::assertNotPushed(EvaluateExamAttempt::class);
    }

    public function test_prevents_unauthorized_user_from_submitting()
    {
        Queue::fake();

        [$owner, $exam] = $this->createCoreData();
        $stranger = User::factory()->create();

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $owner->id,
            'start_time' => now(),
            'end_time' => now()->addMinutes(60),
            'is_completed' => false,
            'total_score' => 0,
        ]);

        $response = $this->actingAs($stranger)->post(route('student.attempts.submit', $attempt->id));

        $response->assertStatus(403);

        $attempt->refresh();
        $this->assertFalse($attempt->is_completed);

        Queue::assertNotPushed(EvaluateExamAttempt::class);
    }

    public function test_handles_submission_after_end_time_properly()
    {
        Queue::fake();

        [$user, $exam] = $this->createCoreData();

        // Exam should have ended 10 minutes ago
        $expiredTime = now()->subMinutes(10);

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'start_time' => now()->subMinutes(70),
            'end_time' => clone $expiredTime,
            'is_completed' => false,
            'total_score' => 0,
        ]);

        // Submit happens NOW, but attempt theoretically ended 10 mins ago.
        $this->actingAs($user)->post(route('student.attempts.submit', $attempt->id));

        $attempt->refresh();
        $this->assertTrue($attempt->is_completed);

        // Assert the end time wasn't pushed forward to `now()`
        $this->assertEquals($expiredTime->timestamp, $attempt->end_time->timestamp);
    }
}
