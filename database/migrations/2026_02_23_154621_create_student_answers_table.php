<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_attempt_id')->constrained('exam_attempts')->onDelete('cascade');
            $table->foreignUuid('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignUuid('selected_option_id')->nullable()->constrained('question_options')->onDelete('cascade');
            $table->boolean('is_correct')->nullable(); // null means un-evaluated
            $table->decimal('marks_awarded', 5, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_answers');
    }
};
