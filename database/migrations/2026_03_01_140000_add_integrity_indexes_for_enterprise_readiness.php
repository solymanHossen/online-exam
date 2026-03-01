<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->unique('name');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->unique('user_id');
            $table->index(['batch_id', 'status']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->unique('transaction_id');
            $table->index(['user_id', 'status']);
            $table->index(['gateway_name', 'status']);
        });

        Schema::table('exam_rankings', function (Blueprint $table) {
            $table->unique(['exam_id', 'user_id']);
            $table->index(['exam_id', 'rank']);
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->index(['status', 'start_time', 'end_time']);
            $table->index('batch_id');
        });

        Schema::table('exam_questions', function (Blueprint $table) {
            $table->unique(['exam_id', 'question_id']);
            $table->index(['exam_id', 'question_order']);
        });

        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->index(['exam_id', 'is_completed', 'total_score']);
            $table->index(['user_id', 'is_completed']);
            $table->index(['exam_id', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->dropIndex(['exam_id', 'is_completed', 'total_score']);
            $table->dropIndex(['user_id', 'is_completed']);
            $table->dropIndex(['exam_id', 'end_time']);
        });

        Schema::table('exam_questions', function (Blueprint $table) {
            $table->dropUnique(['exam_id', 'question_id']);
            $table->dropIndex(['exam_id', 'question_order']);
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropIndex(['status', 'start_time', 'end_time']);
            $table->dropIndex(['batch_id']);
        });

        Schema::table('exam_rankings', function (Blueprint $table) {
            $table->dropUnique(['exam_id', 'user_id']);
            $table->dropIndex(['exam_id', 'rank']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['transaction_id']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['gateway_name', 'status']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            $table->dropIndex(['batch_id', 'status']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
    }
};
