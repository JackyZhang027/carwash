<?php

use App\Http\Controllers\AppSettingsController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ProfitLossController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\PlPasswordMiddleware;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return \Inertia\Inertia::render('dashboard', [
            'stats' => [
                'today_income' => \App\Models\Transaction::published()->whereDate('date', today())->sum('final_price'),
                'today_expense' => \App\Models\Expense::published()->whereDate('date', today())->sum('amount'),
                'today_transaction_count' => \App\Models\Transaction::published()->whereDate('date', today())->count(),
                'draft_count' => \App\Models\Transaction::draft()->count() + \App\Models\Expense::draft()->count(),
            ],
        ]);
    })->name('dashboard');

    // M1 — Transaksi
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::patch('transactions/{transaction}/publish', [TransactionController::class, 'publish'])->name('transactions.publish');
    Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // M2 — Pricelist (admin only)
    Route::get('services', [ServiceController::class, 'index'])->name('services.index');
    Route::middleware('role:admin')->group(function () {
        Route::post('services', [ServiceController::class, 'store'])->name('services.store');
        Route::put('services/{service}', [ServiceController::class, 'update'])->name('services.update');
        Route::delete('services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
        Route::patch('services/{service}/restore', [ServiceController::class, 'restore'])->name('services.restore')->withTrashed();
    });

    // M4 — Pengeluaran
    Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::patch('expenses/{expense}/publish', [ExpenseController::class, 'publish'])->name('expenses.publish');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');

    // M3 — P/L
    Route::post('profit-loss/check-password', [ProfitLossController::class, 'checkPassword'])->name('profit-loss.check-password');
    Route::middleware('role:admin')->group(function () {
        Route::get('profit-loss', [ProfitLossController::class, 'index'])->name('profit-loss.index');
    });
    // kept for export flow
    Route::get('profit-loss/verify', [ProfitLossController::class, 'verify'])->name('profit-loss.verify');
    Route::post('profit-loss/authenticate', [ProfitLossController::class, 'authenticate'])->name('profit-loss.authenticate');

    // M5 — Export
    Route::middleware('role:admin')->group(function () {
        Route::get('export', [ExportController::class, 'index'])->name('export');
        Route::get('export/download', [ExportController::class, 'export'])->name('export.download');
    });

    // DataTables AJAX endpoints
    Route::prefix('api/dt')->name('dt.')->group(function () {
        Route::get('transactions/draft', [TransactionController::class, 'datatableDraft'])->name('transactions.draft');
        Route::get('transactions/published', [TransactionController::class, 'datatablePublished'])->name('transactions.published');
        Route::get('services', [ServiceController::class, 'datatable'])->name('services');
        Route::get('expenses/draft', [ExpenseController::class, 'datatableDraft'])->name('expenses.draft');
        Route::get('expenses/published', [ExpenseController::class, 'datatablePublished'])->name('expenses.published');
        Route::middleware('role:admin')->group(function () {
            Route::get('profit-loss/transactions', [ProfitLossController::class, 'datatableTransactions'])->name('pl.transactions');
            Route::get('profit-loss/expenses', [ProfitLossController::class, 'datatableExpenses'])->name('pl.expenses');
        });
    });

    // App Settings (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('app-settings', [AppSettingsController::class, 'edit'])->name('app-settings.edit');
        Route::put('app-settings', [AppSettingsController::class, 'update'])->name('app-settings.update');
        Route::put('app-settings/password', [AppSettingsController::class, 'updatePassword'])->name('app-settings.password');
        Route::post('app-settings/logo', [AppSettingsController::class, 'updateLogo'])->name('app-settings.logo');
        Route::post('app-settings/favicon', [AppSettingsController::class, 'updateFavicon'])->name('app-settings.favicon');
    });

    // Users (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/settings.php';
