<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LocalizationController extends Controller
{
    /**
     * Handle the incoming request to switch the application locale.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'max:5'],
        ]);

        $locale = $validated['locale'];

        // Optionally, check against supported locales before setting:
        // $supportedLocales = ['en', 'es', 'ar'];
        // if (!in_array($locale, $supportedLocales)) { abort(400); }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        return back();
    }
}
