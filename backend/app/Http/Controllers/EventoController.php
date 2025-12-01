<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Evento;
use App\Models\Expositor;
use App\Models\Inscripcion;
use App\Models\Carrera;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use App\Mail\NotificarAsistenteSimple;
use App\Mail\NotificarCertificado;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class EventoController extends Controller
{
    public function index(): JsonResponse
    {
        $eventos = Evento::with(['enlaces', 'expositores'])
            ->get()
            ->each->append('imagen_evento_url')
            ->each->append('qr_pago_url');

        return response()->json($eventos);
    }

    public function indexPublic(): JsonResponse
    {
        $eventos = Evento::with(['enlaces', 'expositores'])
            ->where('es_publico', true)
            ->get()
            ->each->append('imagen_evento_url')
            ->each->append('qr_pago_url');

        return response()->json($eventos);
    }

    public function indexDashboard(): JsonResponse
    {
        $eventos = Evento::with(['inscripciones'])
            ->get()
            ->each->append('imagen_evento_url')
            ->each->append('qr_pago_url');

        return response()->json($eventos);
    }

    public function getEventoPorSlug(string $slug): JsonResponse
    {
        try {
            $evento = Evento::where('slug', $slug)
                ->where('es_publico', true)
                ->firstOrFail()
                ->append('imagen_evento_url')
                ->append('qr_pago_url');

            return response()->json([
                'message' => 'Evento encontrado',
                'evento' => $evento,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Evento no encontrado o no es público'
            ], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'titulo_evento' => 'required|string|max:255',
            'fecha_evento' => 'required|date',
            'ubicacion' => 'required|string|max:255',
            'modalidad' => 'required|in:Presencial,Virtual',
            'es_pago' => 'boolean',
            'costo' => 'nullable|numeric',
            'es_publico' => 'boolean',
            'formulario' => 'boolean',
            'imagen_evento' => 'nullable|image|max:5120',
            'qr_pago' => 'nullable|image|max:5120',
            'enlaces' => 'nullable|array',
            'enlaces.*.plataforma' => 'required|in:Google Meet,Zoom',
            'enlaces.*.url_enlace' => 'required|string|max:500',
            'enlaces.*.password_enlace' => 'nullable|string|max:255',
            'expositores' => 'nullable|array',
            'expositores.*' => 'required|string|distinct',
        ]);

        DB::beginTransaction();

        try {
            $slugBase = Str::slug($request->titulo_evento);
            $slug = $slugBase;
            $count = 1;
            while (Evento::where('slug', $slug)->exists()) {
                $slug = "{$slugBase}-{$count}";
                $count++;
            }

            $evento = Evento::create([
                'titulo_evento' => $request->titulo_evento,
                'fecha_evento' => $request->fecha_evento,
                'ubicacion' => $request->ubicacion,
                'modalidad' => $request->modalidad,
                'es_pago' => $request->boolean('es_pago'),
                'costo' => $request->costo,
                'es_publico' => $request->boolean('es_publico'),
                'formulario' => $request->boolean('formulario'),
                'slug' => $slug,
                'imagen_evento' => '',
                'qr_pago' => ''
            ]);

            $rutaBase = public_path("assets/eventos/{$evento->id_evento}");

            if ($request->hasFile('imagen_evento')) {
                $imagen = $request->file('imagen_evento');
                $nombre = uniqid('portada_') . '.' . $imagen->getClientOriginalExtension();
                $destino = "{$rutaBase}/portada";
                @mkdir($destino, 0777, true);
                $imagen->move($destino, $nombre);
                $evento->imagen_evento = "eventos/{$evento->id_evento}/portada/{$nombre}";
            }

            if ($request->hasFile('qr_pago')) {
                $qr = $request->file('qr_pago');
                $nombreQR = uniqid('qr_') . '.' . $qr->getClientOriginalExtension();
                $destinoQR = "{$rutaBase}/qr";
                @mkdir($destinoQR, 0777, true);
                $qr->move($destinoQR, $nombreQR);
                $evento->qr_pago = "eventos/{$evento->id_evento}/qr/{$nombreQR}";
            }

            $evento->save();

            if ($request->filled('expositores')) {
                $idsExpositores = $this->procesarExpositores($request->expositores);
                $evento->expositores()->sync($idsExpositores);
            }

            if ($request->has('enlaces')) {
                foreach ($request->enlaces as $enlace) {
                    $evento->enlaces()->create($enlace);
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Evento creado exitosamente',
                'evento' => $evento->load('enlaces')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            if (isset($evento)) {
                @rmdir(public_path("assets/eventos/{$evento->id_evento}"));
                $evento->delete();
            }
            return response()->json([
                'error' => 'Error al crear el evento',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $evento = Evento::findOrFail($id);

        $validated = $request->validate([
            'titulo_evento' => 'required|string|max:255',
            'fecha_evento' => 'required|date',
            'ubicacion' => 'required|string|max:255',
            'modalidad' => 'required|in:Presencial,Virtual',
            'es_pago' => 'boolean',
            'costo' => 'nullable|numeric',
            'es_publico' => 'boolean',
            'formulario' => 'boolean',
            'imagen_evento' => 'nullable|file|image|max:5120',
            'qr_pago' => 'nullable|file|image|max:5120',
            'quitar_imagen' => 'boolean',
            'quitar_qr' => 'boolean',
            'enlaces' => 'nullable|array',
            'enlaces.*.id_enlace' => 'nullable|integer|exists:enlace,id_enlace',
            'enlaces.*.plataforma' => 'required_with:enlaces|string|in:Google Meet,Zoom',
            'enlaces.*.url_enlace' => 'required_with:enlaces|string|max:500',
            'enlaces.*.password_enlace' => 'nullable|string|max:255',
            'expositores' => 'nullable|array',
            'expositores.*' => 'required|string|distinct',
        ]);

        DB::beginTransaction();
        try {
            // 🔄 Actualizar slug si cambia título
            if ($evento->titulo_evento !== $validated['titulo_evento']) {
                $slugBase = Str::slug($validated['titulo_evento']);
                $slug = $slugBase;
                $count = 1;
                while (Evento::where('slug', $slug)->where('id_evento', '!=', $evento->id_evento)->exists()) {
                    $slug = "{$slugBase}-{$count}";
                    $count++;
                }
                $evento->slug = $slug;
            }

            $evento->fill($validated);

            $rutaBase = public_path("assets/eventos/{$evento->id_evento}");

            // 🗑️ Eliminar portada si se marca quitar
            if ($request->boolean('quitar_imagen') && $evento->imagen_evento) {
                $dirPortada = "{$rutaBase}/portada";
                if (is_dir($dirPortada)) {
                    collect(scandir($dirPortada))
                        ->filter(fn($f) => !in_array($f, ['.', '..']))
                        ->each(fn($f) => @unlink("{$dirPortada}/{$f}"));
                    @rmdir($dirPortada);
                }
                $evento->imagen_evento = null;
            }

            // 🗑️ Eliminar QR si se marca quitar
            if ($request->boolean('quitar_qr') && $evento->qr_pago) {
                $dirQR = "{$rutaBase}/qr";
                if (is_dir($dirQR)) {
                    collect(scandir($dirQR))
                        ->filter(fn($f) => !in_array($f, ['.', '..']))
                        ->each(fn($f) => @unlink("{$dirQR}/{$f}"));
                    @rmdir($dirQR);
                }
                $evento->qr_pago = null;
            }

            // ✅ Reemplazar portada
            if ($request->hasFile('imagen_evento')) {
                // Eliminar imagen anterior si existe
                $dirPortada = "{$rutaBase}/portada";
                if (is_dir($dirPortada)) {
                    collect(scandir($dirPortada))
                        ->filter(fn($f) => !in_array($f, ['.', '..']))
                        ->each(fn($f) => @unlink("{$dirPortada}/{$f}"));
                } else {
                    mkdir($dirPortada, 0755, true);
                }

                $imagen = $request->file('imagen_evento');
                $nombreImagen = time() . '_' . $imagen->getClientOriginalName();
                $imagen->move($dirPortada, $nombreImagen);
                $evento->imagen_evento = "eventos/{$evento->id_evento}/portada/{$nombreImagen}";
            }

            // ✅ Reemplazar QR
            if ($request->hasFile('qr_pago')) {
                // Eliminar QR anterior si existe
                $dirQR = "{$rutaBase}/qr";
                if (is_dir($dirQR)) {
                    collect(scandir($dirQR))
                        ->filter(fn($f) => !in_array($f, ['.', '..']))
                        ->each(fn($f) => @unlink("{$dirQR}/{$f}"));
                } else {
                    mkdir($dirQR, 0755, true);
                }

                $qr = $request->file('qr_pago');
                $nombreQR = time() . '_' . $qr->getClientOriginalName();
                $qr->move($dirQR, $nombreQR);
                $evento->qr_pago = "eventos/{$evento->id_evento}/qr/{$nombreQR}";
            }


            $evento->save();

            // 🔁 Expositores
            if ($request->filled('expositores')) {
                $idsExpositores = $this->procesarExpositores($request->expositores);
                $evento->expositores()->sync($idsExpositores);
            }

            // 🔁 Enlaces
            if (is_array($request->enlaces)) {
                $evento->enlaces()->delete(); // Limpieza completa
                foreach ($request->enlaces as $enlace) {
                    $evento->enlaces()->create([
                        'plataforma' => $enlace['plataforma'],
                        'url_enlace' => $enlace['url_enlace'],
                        'password_enlace' => $enlace['password_enlace'] ?? null,
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Evento actualizado correctamente',
                'data' => $evento
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al actualizar el evento',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        DB::beginTransaction();

        try {
            $evento = Evento::with('inscripciones')->findOrFail($id);

            // 🔥 Eliminar inscripciones con Eloquent para ejecutar eventos (ej. deleting)
            foreach ($evento->inscripciones as $inscripcion) {
                $inscripcion->delete();
            }

            // 🧹 Eliminar carpeta de archivos del evento en public/assets
            $rutaBase = public_path("assets/eventos/{$evento->id_evento}");
            if (is_dir($rutaBase)) {
                collect(scandir($rutaBase))
                    ->filter(fn($item) => !in_array($item, ['.', '..']))
                    ->each(function ($folder) use ($rutaBase) {
                        $subfolderPath = "{$rutaBase}/{$folder}";
                        if (is_dir($subfolderPath)) {
                            collect(scandir($subfolderPath))
                                ->filter(fn($file) => !in_array($file, ['.', '..']))
                                ->each(fn($f) => @unlink("{$subfolderPath}/{$f}"));
                            @rmdir($subfolderPath);
                        }
                    });
                @rmdir($rutaBase);
            }

            $evento->delete();

            DB::commit();
            return response()->json(['message' => 'Evento eliminado correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al eliminar el evento',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function procesarExpositores(array $expositores): array
    {
        $ids = [];

        foreach ($expositores as $entrada) {
            if (is_numeric($entrada)) {
                $ids[] = (int) $entrada;
            } elseif (is_string($entrada)) {
                $expositor = Expositor::firstOrCreate([
                    'nombre_expositor' => $entrada
                ]);
                $ids[] = $expositor->id_expositor;
            }
        }

        return $ids;
    }

    public function notificarAsistentes(Request $request, $id): JsonResponse
    {
        $request->validate([
            'asunto' => 'required|string|max:255',
            'mensaje' => 'required|string',
            'con_certificado' => 'required|boolean',
            'destinatarios' => 'required|array',
            'destinatarios.*.id_inscripcion' => 'required|exists:inscripcion,id_inscripcion',
            'destinatarios.*.certificado' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        try {
            $evento = Evento::findOrFail($id);

            foreach ($request->destinatarios as $index => $data) {
                $inscripcion = Inscripcion::with('asistente')->findOrFail($data['id_inscripcion']);

                $nombre = $inscripcion->asistente->nombre_asistente;
                $email = $inscripcion->email_inscripcion;

                if (!$email) {
                    continue;
                }

                $rutaCertificadoRel = null;
                $rutaCertificadoAbs = null;

                if ($request->con_certificado && $request->hasFile("destinatarios.$index.certificado")) {
                    $archivo = $request->file("destinatarios.$index.certificado");

                    $nombreArchivo = $archivo->hashName(); // genera nombre único
                    $rutaCertificadoRel = "certificados/{$id}/{$inscripcion->id_inscripcion}/{$nombreArchivo}";
                    $archivo->storeAs("certificados/{$id}/{$inscripcion->id_inscripcion}", $nombreArchivo, 'private');

                    // Marcar como entregado
                    $inscripcion->certificado_entregado = true;
                    $inscripcion->save();

                    // Ruta absoluta
                    $rutaCertificadoAbs = storage_path('app/private/' . $rutaCertificadoRel);
                }

                if ($request->con_certificado && $rutaCertificadoAbs) {
                    clearstatcache(); // limpiar cache de estado del archivo

                    if (file_exists($rutaCertificadoAbs)) {
                        Mail::to($email)->send(new NotificarCertificado(
                            $nombre,
                            $evento->titulo_evento,
                            $evento->fecha_evento,
                            $request->asunto,
                            $request->mensaje,
                            $rutaCertificadoAbs
                        ));

                        // 1. Eliminar el archivo
                        Storage::disk('private')->delete($rutaCertificadoRel);

                        // 2. Eliminar carpeta del asistente si está vacía
                        $rutaCarpetaAsistente = "certificados/{$id}/{$inscripcion->id_inscripcion}";
                        if (empty(Storage::disk('private')->files($rutaCarpetaAsistente))) {
                            Storage::disk('private')->deleteDirectory($rutaCarpetaAsistente);
                        }

                        // 3. Eliminar carpeta del evento si está vacía
                        $rutaCarpetaEvento = "certificados/{$id}";
                        if (empty(Storage::disk('private')->allFiles($rutaCarpetaEvento))) {
                            Storage::disk('private')->deleteDirectory($rutaCarpetaEvento);
                        }
                    } else {
                        return response()->json([
                            'error' => 'Archivo no encontrado',
                            'ruta' => $rutaCertificadoAbs
                        ], 500);
                    }
                } else {
                    Mail::to($email)->send(new NotificarAsistenteSimple(
                        $nombre,
                        $evento->titulo_evento,
                        $request->asunto,
                        $request->mensaje
                    ));
                }
            }

            return response()->json(['message' => 'Correos enviados correctamente']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al enviar correos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function descargarAsistentesPDF($id)
    {
        $evento = Evento::findOrFail($id);
        $asistentes = Inscripcion::with('asistente')
            ->where('id_evento', $id)
            ->get();

        $carrera = Carrera::with(['correos', 'telefonos'])->first();
        $correo = $carrera?->correos->first()?->correo_carrera ?? '';
        $telefono = $carrera?->telefonos->first()?->telefono ?? '';

        $pdf = Pdf::loadView('pdf.asistentes_evento', [
            'evento' => $evento,
            'asistentes' => $asistentes,
            'correo' => $correo,
            'telefono' => $telefono,
        ])->setPaper('A4', 'portrait');

        return $pdf->download("asistentes_{$evento->titulo_evento}.pdf");
    }

    public function dashboard(): JsonResponse
    {
        $eventos = Evento::with('inscripciones')->get();

        $porEvento = $eventos->map(function ($evento) {
            $total = $evento->inscripciones->count();
            $participantes = $evento->inscripciones->filter(
                fn($i) =>
                $i->certificado_entregado === 1 ||
                    ($i->entrada === 1 && $i->salida === 1)
            )->count();

            return [
                'titulo_evento' => $evento->titulo_evento,
                'fecha_evento' => Carbon::parse($evento->fecha_evento)->format('d/m/Y'),
                'total_inscripciones' => $total,
                'porcentaje_certificados' => $total ? round(($participantes * 100) / $total, 2) : 0,
            ];
        });

        $porModalidad = $eventos->groupBy('modalidad')->map(function ($grupo, $modalidad) {
            $total = $grupo->flatMap->inscripciones->count();
            $participantes = $grupo->flatMap->inscripciones->filter(
                fn($i) =>
                $i->certificado_entregado === 1 ||
                    ($i->entrada === 1 && $i->salida === 1)
            )->count();

            return [
                'modalidad' => $modalidad,
                'total_inscripciones' => $total,
                'porcentaje_participacion' => $total ? round(($participantes * 100) / $total, 2) : 0,
            ];
        })->values();

        return response()->json([
            'eventos' => $porEvento,
            'modalidad' => $porModalidad,
        ]);
    }

    public function descargarQR($id)
    {
        try {
            $evento = Evento::findOrFail($id);

            if (!$evento->qr_pago) {
                return response()->json(['error' => 'QR no disponible para este evento.'], 404);
            }

            // Obtener ruta absoluta en public/assets
            $rutaAbsoluta = public_path('assets/' . $evento->qr_pago);

            if (!file_exists($rutaAbsoluta)) {
                return response()->json(['error' => 'Archivo QR no encontrado.'], 404);
            }

            return response()->file($rutaAbsoluta);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al descargar el QR.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
