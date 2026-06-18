<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inspection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InspectionController extends Controller
{
    public function index()
    {
        // Mengambil semua data inspeksi 
        $inspections = Inspection::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'message' => 'Riwayat inspeksi berhasil diambil',
            'data' => $inspections
        ], 200);
    }
    public function analyze(Request $request)
    {
        // Validasi request 
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id'
        ]);

        // Simpan gambar ke storage lokal
        $imagePath = $request->file('image')->store('inspections', 'public');
        
        // Konversi gambar 
        $imageContent = base64_encode(file_get_contents($request->file('image')->path()));
        $mimeType = $request->file('image')->getClientMimeType();

        // Prompt sistem analis QC 
        $prompt = "Kamu adalah AI Quality Control Inspector senior di pabrik. Analisis gambar produk ini dengan sangat teliti. Apakah terdapat cacat fisik (seperti mengelupas, robek, noda, dll)? Kembalikan respons MURNI dalam format JSON tanpa backtick atau markdown. Wajib gunakan format persis seperti ini: {\"status\": \"Lolos\" atau \"Cacat\", \"confidence_score\": 98.5, \"defect_notes\": \"Jelaskan detail kerusakannya secara spesifik\", \"recommendation\": \"Saran tindakan operator\"}. 
        
        KETENTUAN WAJIB UNTUK KOLOM RECOMMENDATION:
        1. Jika status 'Lolos': Isi dengan kalimat 'Produk memenuhi standar kualitas standar produksi. Silakan lanjutkan ke unit pengemasan (packaging) dan persiapan distribusi.'.
        2. Jika status 'Cacat': Berikan saran penanganan spesifik berdasarkan kerusakan yang kamu lihat (misalnya: 'Kirim ke divisi rework untuk perbaikan lapisan kulit yang mengelupas' atau 'Segera lakukan REJECT total dan pisahkan dari jalur perakitan utama jika kerusakan meluas').";
        
        // Gemini API
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
           ])->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $imageContent
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            $result = $response->json();
            
            // Cek  error 
            if (isset($result['error'])) {
                Log::error('Gemini API Error: ' . json_encode($result['error']));
                return response()->json(['message' => 'API Key salah atau kuota habis.'], 500);
            }
            
            // Ambil teks JSON dari respons Gemini dan bersihkan sisa markdown
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $aiText = preg_replace('/```(?:json)?|```/i', '', $aiText);
            
            $aiData = json_decode(trim($aiText), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Gemini JSON Parse Error: ' . $aiText);
                return response()->json(['message' => 'Gagal memproses hasil AI.'], 500);
            }

            // Simpan hasil inspeksi ke database
            $inspection = Inspection::create([
                'user_id' => $request->user_id,
                'product_id' => $request->product_id,
                'image_path' => $imagePath,
                'status' => $aiData['status'] ?? 'Cacat',
                'defect_notes' => $aiData['defect_notes'] ?? null,
                'confidence_score' => $aiData['confidence_score'] ?? null,
            ]);

            return response()->json([
                'message' => 'Inspeksi berhasil',
                'data' => $inspection
            ], 201);

        } catch (\Exception $e) {
            Log::error('Inspection Error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan internal server.'], 500);
        }
    }
}