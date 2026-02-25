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
        Schema::table('question_statistics', function (Blueprint $table) {
            $table->index('times_attempted');
            $table->index('times_correct');
            $table->index(['times_attempted', 'times_correct']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_statistics', function (Blueprint $table) {
            $table->dropIndex(['times_attempted']);
            $table->dropIndex(['times_correct']);
            $table->dropIndex(['times_attempted', 'times_correct']);
        });
    }
};
