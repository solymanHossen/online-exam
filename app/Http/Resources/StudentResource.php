<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'roll_number' => $this->roll_number,
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'admission_date' => $this->admission_date ? $this->admission_date->toDateString() : null,
            'status' => $this->status,
            'user_id' => $this->user_id,
            'batch_id' => $this->batch_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user?->id,
                    'name' => $this->user?->name,
                    'email' => $this->user?->email,
                    'avatar' => $this->user?->avatar,
                    'is_active' => $this->user?->is_active,
                ];
            }),
            'batches' => $this->whenLoaded('batch', function () {
                if (! $this->batch) {
                    return [];
                }

                return [[
                    'id' => $this->batch->id,
                    'name' => $this->batch->name,
                ]];
            }),
            'total_exams_taken' => (int) ($this->total_exams_taken ?? 0),
            'average_score' => round((float) ($this->average_score ?? 0), 2),
            'created_at' => $this->created_at,
        ];
    }
}
