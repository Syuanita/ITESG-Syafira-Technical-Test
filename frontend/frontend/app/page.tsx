"use client";

import { useState, useEffect } from "react";

export default function QCInspectionPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/inspections");
      const data = await res.json();
      if (res.ok) setHistory(data.data);
    } catch (error) {
      console.error("Gagal mengambil riwayat:", error);
    } finally {
      setTimeout(() => setIsFetching(false), 500);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Pilih gambar terlebih dahulu!");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("product_id", "1");
    formData.append("user_id", "1");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/inspections/analyze", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data);
        fetchHistory();
      } else {
        alert(data.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const totalInspections = history.length;
  const totalLolos = history.filter((item) => item.status === "Lolos").length;
  const totalCacat = history.filter((item) => item.status === "Cacat").length;
  const defectRate = totalInspections > 0 ? ((totalCacat / totalInspections) * 100).toFixed(1) : 0;

  return (
    // Background
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 font-sans print:bg-white print:p-0 selection:bg-indigo-200">
      {/* tombol cetak */}
      <div className="max-w-5xl mx-auto flex justify-end mb-6 print:hidden">
        <button
          onClick={handleExportPDF}
          disabled={isFetching || history.length === 0}
          className={`px-6 py-2.5 text-sm font-semibold rounded-full shadow-sm ring-1 ring-inset ring-slate-300 transition-all duration-200 flex items-center space-x-2 ${
            isFetching || history.length === 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
          <span>Unduh PDF</span>
        </button>
      </div>
      {/* HEADER */}
      <div className="text-center print:mt-8 flex flex-col items-center">
        {/* Logo Perusahaan */}
        <img src="/eagle.png" alt="Logo PT Eagle Sporting Goods" className="h-20 md:h-24 w-auto mb-4 object-contain drop-shadow-sm print:h-16" />
      </div>
      <div className="max-w-5xl mx-auto space-y-10">
        {/* HEADER TEXT*/}
        <div className="text-center print:mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Eagle Eye AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">QC Report</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-medium">Sistem Dokumen Kontrol Kualitas Produksi Otomatis</p>
          <p className="text-slate-400 text-xs mt-2 hidden print:block">Dicetak pada: {formatDate(new Date().toISOString())}</p>
        </div>

        {/* DASHBOARD*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isFetching &&
            [1, 2, 3].map((key) => (
              <div key={`dash-skel-${key}`} className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white flex flex-col justify-between h-36 animate-pulse shadow-sm">
                <div className="h-3 bg-slate-200 rounded-full w-1/2"></div>
                <div className="h-12 bg-slate-200 rounded-lg w-1/3 mt-4"></div>
              </div>
            ))}

          {!isFetching && (
            <>
              <div key="dash-total" className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white relative overflow-hidden group print:shadow-none print:border-slate-200 print:rounded-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-16 h-16 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Total Inspeksi</h3>
                <div className="text-4xl font-black text-slate-800 relative z-10">{totalInspections}</div>
              </div>

              <div key="dash-lolos" className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white relative overflow-hidden group print:shadow-none print:border-slate-200 print:rounded-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Lolos QC (Good)</h3>
                <div className="text-4xl font-black text-emerald-600 relative z-10">{totalLolos}</div>
              </div>

              <div key="dash-cacat" className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white relative overflow-hidden group print:shadow-none print:border-slate-200 print:rounded-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-16 h-16 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                  </svg>
                </div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Produk Cacat (Reject)</h3>
                <div className="flex items-end space-x-3 relative z-10">
                  <div className="text-4xl font-black text-rose-600">{totalCacat}</div>
                  <div className="text-sm font-bold text-rose-400 mb-1 bg-rose-50 px-2 py-0.5 rounded-md">{defectRate}%</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FORM UPLOAD */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100 print:hidden relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10"></div>}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Mulai Inspeksi Baru</h2>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">AI Powered</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors duration-300">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageChange}
                disabled={loading}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 disabled:opacity-50 file:transition-colors file:cursor-pointer disabled:cursor-not-allowed cursor-pointer"
              />
            </div>

            {preview && !result && (
              <div className="flex justify-center mt-6">
                <img src={preview} alt="Preview" className={`max-h-72 rounded-2xl shadow-md object-contain ring-1 ring-slate-900/5 transition ${loading ? "opacity-50 blur-sm scale-95" : "scale-100"}`} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !image}
              className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all duration-300 flex justify-center items-center space-x-2 shadow-lg ${
                loading || !image ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center space-x-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="tracking-wide">Memproses Analisis AI...</span>
                  </>
                ) : (
                  <span className="tracking-wide">Jalankan Pemindaian QC</span>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* UI SCANNING AI*/}
        {loading && (
          <div className="p-12 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 print:hidden flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-75 animate-pulse"></div>
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-indigo-50 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute"></div>
              <div className="w-12 h-12 bg-indigo-50 rounded-full absolute animate-pulse"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">AI Vision Engine Aktif</h3>
              <p className="text-slate-500 text-sm mt-1">Mengekstraksi fitur pola material dan menganalisis mikrodeformasi...</p>
            </div>
          </div>
        )}

        {/* HASIL ANALISIS*/}
        {result && !loading && (
          <div
            className={`p-8 bg-white rounded-3xl border-2 shadow-xl print:shadow-none print:rounded-xl print:break-inside-avoid animate-[fadeIn_0.4s_ease-out] ${result.status === "Lolos" ? "border-emerald-400 shadow-emerald-500/10" : "border-rose-400 shadow-rose-500/10"}`}
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 border-b border-slate-100 pb-5 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hasil Analisis Terakhir</h2>
                <p className="text-slate-400 text-sm mt-1">
                  ID Pemindaian: <span className="font-mono text-slate-500">#{result.id}</span> • {formatDate(result.created_at)}
                </p>
              </div>
              <div className={`px-5 py-2 rounded-full font-bold text-sm tracking-widest uppercase border ${result.status === "Lolos" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                {result.status}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sampel Visual</p>
                {preview && <img src={preview} alt="Bukti QC" className="w-full rounded-2xl shadow-sm border border-slate-200 object-contain bg-slate-50" />}
              </div>

              <div className="lg:col-span-3 space-y-5">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skor Akurasi AI</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {result.confidence_score}
                    <span className="text-lg text-slate-500">%</span>
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Temuan Kerusakan</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{result.defect_notes}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${result.status === "Lolos" ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"}`}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center space-x-2">
                    <span className={result.status === "Lolos" ? "text-emerald-600" : "text-rose-600"}>⚡ Instruksi Kerja</span>
                  </p>
                  <p className="text-slate-800 text-sm font-semibold leading-relaxed">
                    {result.saran_ai ||
                      (result.status === "Lolos"
                        ? "Produk memenuhi standar kualitas. Silakan lanjutkan ke unit pengemasan (packaging) dan persiapan distribusi."
                        : "Segera lakukan REJECT total, tandai produk cacat, dan pisahkan dari jalur perakitan utama untuk penanganan lebih lanjut.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATABASE RIWAYAT INSPEKSI */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden print:shadow-none print:border-slate-200 print:mt-8">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h2 className="text-xl font-bold text-slate-800">Riwayat Dokumentasi QC</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Visual</th>
                  <th className="px-6 py-4">Status & Skor</th>
                  <th className="px-6 py-4">Catatan Sistem</th>
                  <th className="px-6 py-4">Instruksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {/* LOADING */}
                {isFetching &&
                  [1, 2, 3].map((key) => (
                    <tr key={`tbl-skel-${key}`} className="animate-pulse bg-white">
                      <td className="px-6 py-4">
                        <div className="h-3 bg-slate-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-slate-200 rounded-full w-16"></div>
                      </td>
                    </tr>
                  ))}

                {/* ADA DATA */}
                {!isFetching &&
                  history.length > 0 &&
                  history.map((item) => (
                    <tr key={`hist-row-${item.id}`} className="hover:bg-slate-50 transition-colors duration-150 print:break-inside-avoid bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{formatDate(item.created_at)}</td>
                      <td className="px-6 py-4">
                        <img src={`http://127.0.0.1:8000/storage/${item.image_path}`} alt="Produk QC" className="h-10 w-10 object-cover rounded-xl shadow-sm ring-1 ring-slate-900/5" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status === "Lolos" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.status}</span>
                          <span className="text-xs font-semibold text-slate-400">{item.confidence_score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-xs text-slate-500 print:whitespace-normal" title={item.defect_notes}>
                        {item.defect_notes}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.status === "Lolos" ? <span className="text-emerald-600">Siap Kemas</span> : <span className="text-rose-600">Rework/Reject</span>}</td>
                    </tr>
                  ))}

                {/* DATA KOSONG */}
                {!isFetching && history.length === 0 && (
                  <tr key="empty-row">
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Belum ada data pemindaian terekam di dalam basis data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
