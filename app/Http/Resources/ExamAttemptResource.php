<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamAttemptResource extends JsonResource
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
            'exam_id' => $this->exam_id,
            'is_completed' => $this->is_completed,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'answers' => clone $this->whenLoaded('answers'), // Pass simple relationship collection
        ];
    }
}
