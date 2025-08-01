<?php

namespace App\Http\Controllers;

use App\Models\MallaCurricular;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MallaCurricularController extends Controller
{
    public function show()
    {
        $malla = MallaCurricular::with('semestres.materias.contenidos')->first();
        return response()->json($malla?->append(['imagen_url', 'archivo_pdf_url']));
    }

    public function update(Request $request)
    {
        $malla = MallaCurricular::first();

        $request->validate([
            'imagen' => 'nullable|image|max:2048',
            'archivo_pdf' => 'nullable|file|mimes:pdf|max:5120',
            'quitar_imagen' => 'nullable|boolean',
            'quitar_pdf' => 'nullable|boolean',
        ], [
            'archivo_pdf.mimes' => 'El archivo debe ser un PDF.',
            'archivo_pdf.max' => 'El archivo PDF no debe superar los 5MB.',
            'imagen.image' => 'La imagen debe ser un archivo de tipo imagen.',
            'imagen.max' => 'La imagen no debe superar los 2MB.',
        ]);

        DB::beginTransaction();
        try {
            // Crear si no existe
            if (!$malla) {
                $malla = MallaCurricular::create([]);
            }

            // Eliminar archivos si se solicita
            if ($request->boolean('quitar_imagen') && $malla->imagen) {
                Storage::disk('public')->deleteDirectory("malla/imagen/{$malla->id_malla}");
                $malla->update(['imagen' => null]);
            }

            if ($request->boolean('quitar_pdf') && $malla->archivo_pdf) {
                Storage::disk('public')->deleteDirectory("malla/archivo/{$malla->id_malla}");
                $malla->update(['archivo_pdf' => null]);
            }

            // Subir nuevos archivos si llegan
            if ($request->hasFile('imagen')) {
                Storage::disk('public')->deleteDirectory("malla/imagen/{$malla->id_malla}");
                $path = $request->file('imagen')->store("malla/imagen/{$malla->id_malla}", 'public');
                $malla->update(['imagen' => $path]);
            }

            if ($request->hasFile('archivo_pdf')) {
                Storage::disk('public')->deleteDirectory("malla/archivo/{$malla->id_malla}");
                $path = $request->file('archivo_pdf')->store("malla/archivo/{$malla->id_malla}", 'public');
                $malla->update(['archivo_pdf' => $path]);
            }

            DB::commit();
            return response()->json($malla->append(['imagen_url', 'archivo_pdf_url']));
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Error al actualizar la malla curricular', 'error' => $e->getMessage()], 500);
        }
    }

    public function descargarMalla()
    {
        try {
            $malla = MallaCurricular::first();

            if (!$malla->archivo_pdf || !Storage::exists('public/' . $malla->archivo_pdf)) {
                return response()->json(['error' => 'Malla no encontrada.'], 404);
            }

            return response()->file(storage_path('app/public/' . $malla->archivo_pdf));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al descargar la malla.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
