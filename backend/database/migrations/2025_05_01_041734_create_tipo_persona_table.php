<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipo_persona', function (Blueprint $table) {
            $table->id('id_tipo_persona');
            $table->enum('nombre_tipo', ['Docente', 'Administrativo', 'Autoridad']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipo_persona');
    }
};
