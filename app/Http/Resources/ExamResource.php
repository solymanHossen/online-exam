<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'total_marks' => $this->total_marks,
            'pass_marks' => $this->pass_marks,
            // Map the nested questions through the resources safely
            'questions' => $this->relationLoaded('questions')
                ? QuestionResource::collection($this->questions->pluck('question'))
                : [],
        ];
    }
}
