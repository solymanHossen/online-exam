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
            'status' => $this->status?->value,
            'duration_minutes' => $this->duration_minutes,
            'total_marks' => $this->total_marks,
            'pass_marks' => $this->pass_marks,
            'price' => $this->price,
            'negative_enabled' => $this->negative_enabled,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'batch' => $this->whenLoaded('batch', fn () => [
                'id' => $this->batch?->id,
                'name' => $this->batch?->name,
            ]),
            'created_at' => $this->created_at,
            // Map the nested questions through the resources safely
            'questions' => $this->relationLoaded('questions')
                ? QuestionResource::collection($this->questions->pluck('question'))
                : [],
        ];
    }
}
