<?php

namespace App\Traits;

use DateTimeInterface;
use Illuminate\Support\Carbon;

/**
 * Task 3: Timezone Best Practices
 * Apply this trait to Models to strictly serialize all timestamps to standardized UTC ISO-8601 format.
 * This guarantees the frontend always receives UTC, regardless of server settings.
 */
trait TimezoneSerializable
{
    protected function serializeDate(DateTimeInterface $date): string
    {
        return Carbon::instance($date)->setTimezone('UTC')->format('Y-m-d\TH:i:s.u\Z');
    }
}
