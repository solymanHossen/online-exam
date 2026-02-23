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
            'created_at' => $this->created_at,
        ];
    }
}
