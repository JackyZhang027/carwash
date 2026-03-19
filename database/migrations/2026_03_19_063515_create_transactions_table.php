<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->date('date')->index();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->enum('vehicle_type', ['car', 'motorcycle']);
            $table->string('service_name', 100);
            $table->string('plate_no', 20)->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('adj_price', 12, 2)->default(0);
            $table->decimal('final_price', 12, 2);
            $table->enum('payment_method', ['cash', 'qris']);
            $table->enum('status', ['draft', 'published'])->default('draft')->index();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
