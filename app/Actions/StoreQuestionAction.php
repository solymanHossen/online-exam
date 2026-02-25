<?php

namespace App\Actions;

use App\Models\Question;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreQuestionAction
{
    /**
     * Store a question and its options inside a transaction.
     *
     * @param  array  $questionData  Ensure 'created_by' is included
     * @param  array  $optionsData  Array of options. Format: [['option_text' => '...', 'is_correct' => true], ...]
     *
     * @throws Exception
     */
    public function execute(array $questionData, array $optionsData): Question
    {
        // Validation: Ensure at least one option is marked as correct
        $hasCorrectOption = collect($optionsData)->containsStrict('is_correct', true);
        if (! $hasCorrectOption) {
            throw new Exception('A question must have at least one correct option.');
        }

        return DB::transaction(function () use ($questionData, $optionsData) {
            $question = Question::create($questionData);

            $options = [];
            foreach ($optionsData as $opt) {
                // Ensure required keys exist
                $options[] = [
                    'question_id' => $question->id,
                    'id' => (string) Str::uuid(),
                    'option_text' => $opt['option_text'] ?? null,
                    'option_image' => $opt['option_image'] ?? null,
                    'is_correct' => $opt['is_correct'] ?? false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Insert options efficiently in bulk
            $question->options()->insert($options);

            return $question->load('options');
        });
    }
}
