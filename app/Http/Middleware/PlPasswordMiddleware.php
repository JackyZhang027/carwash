<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PlPasswordMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authenticatedAt = $request->session()->get('pl_authenticated_at');

        if (! $authenticatedAt || (now()->timestamp - $authenticatedAt) >= 1800) {
            $request->session()->forget('pl_authenticated_at');
            $request->session()->put('pl_intended_url', $request->url());

            return redirect()->route('profit-loss.verify');
        }

        return $next($request);
    }
}
