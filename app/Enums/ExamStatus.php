<?php

namespace App\Enums;

enum ExamStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
}
