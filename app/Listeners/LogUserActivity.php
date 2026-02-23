<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;
use App\Models\ActivityLog;

class LogUserActivity
{
    protected Request $request;

    /**
     * Create the event listener.
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        ActivityLog::create([
            'user_id' => $event->user->getAuthIdentifier(),
            'action' => 'User Logged In',
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
        ]);

        if (method_exists($event->user, 'update')) {
            $event->user->update([
                'last_login_at' => now(),
            ]);
        }
    }
}
