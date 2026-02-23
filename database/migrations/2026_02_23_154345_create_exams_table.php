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
        Schema::create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->foreignUuid('batch_id')->nullable()->constrained('batches')->onDelete('cascade');
            $table->decimal('total_marks', 6, 2)->default(0.00);
            $table->integer('duration_minutes')->default(60);
            $table->decimal('pass_marks', 6, 2)->default(0.00);
            $table->boolean('negative_enabled')->default(false);
            $table->boolean('shuffle_questions')->default(false);
            $table->boolean('shuffle_options')->default(false);
            $table->boolean('show_result_immediately')->default(true);
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignUuid('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
