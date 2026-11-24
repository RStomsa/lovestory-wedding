'use client';

import React, { useState } from 'react';
import {
  Zap,
  Globe,
  Sliders,
  FileDown,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  FolderOpen,
  Maximize2,
  Image as ImageIcon,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ToolsManagerClient() {
  const [activeTab, setActiveTab] = useState<'crawler' | 'compressor' | 'print'>('crawler');

  // Crawler State
  const [crawlUrl, setCrawlUrl] = useState('https://m-invite.com/templates/thiep-cuoi');
  const [crawlConcurrency, setCrawlConcurrency] = useState(16);
  const [isCrawling, setIsCrawling] = useState(false);

  // Compressor State
  const [compressInput, setCompressInput] = useState('public/assets/wedding/photos');
  const [compressMaxWidth, setCompressMaxWidth] = useState(1920);
  const [compressQuality, setCompressQuality] = useState(85);
  const [isCompressing, setIsCompressing] = useState(false);

  // Print Exporter State
  const [printSlug, setPrintSlug] = useState('envelope-chamomile');
  const [printFormat, setPrintFormat] = useState<'A5' | 'SQUARE' | 'A6'>('A5');
  const [printBleed, setPrintBleed] = useState(3.0);
  const [isExportingPrint, setIsExportingPrint] = useState(false);
  const [downloadPdfUrl, setDownloadPdfUrl] = useState<string | null>(null);

  // Console Logs Output
  const [logs, setLogs] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleRunCrawler = async () => {
    setIsCrawling(true);
    setStatusMessage(null);
    setLogs('🚀 Đang khởi động LoveStory Rust Crawler đa luồng...\n');

    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'crawl',
          url: crawlUrl,
          concurrency: crawlConcurrency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cào template thất bại');
      }

      setLogs((prev) => prev + (data.output || '') + '\n' + (data.logs || ''));
      setStatusMessage({ text: data.message || 'Cào mẫu thành công!', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
      setLogs((prev) => prev + `\n❌ Lỗi: ${err.message}\n`);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleRunCompressor = async () => {
    setIsCompressing(true);
    setStatusMessage(null);
    setLogs('⚡ Đang kích hoạt Rust Rayon Image Compressor trên toàn bộ lõi CPU...\n');

    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'compress',
          inputPath: compressInput,
          maxWidth: compressMaxWidth,
          quality: compressQuality,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nén ảnh thất bại');
      }

      setLogs((prev) => prev + (data.output || '') + '\n' + (data.logs || ''));
      setStatusMessage({ text: data.message || 'Nén ảnh cưới thành công!', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
      setLogs((prev) => prev + `\n❌ Lỗi: ${err.message}\n`);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRunPrintExport = async () => {
    setIsExportingPrint(true);
    setStatusMessage(null);
    setDownloadPdfUrl(null);
    setLogs('🖨️ Đang tạo bản in 300 DPI CMYK với bù xén Bleed và Crop marks...\n');

    const widthMm = printFormat === 'A5' ? 148 : printFormat === 'SQUARE' ? 150 : 105;
    const heightMm = printFormat === 'A5' ? 210 : printFormat === 'SQUARE' ? 150 : 148;

    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export-print',
          templateSlug: printSlug,
          widthMm,
          heightMm,
          bleedMm: printBleed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Xuất bản in thất bại');
      }

      setDownloadPdfUrl(data.pdfUrl);
      setLogs((prev) => prev + (data.output || '') + '\n' + (data.logs || ''));
      setStatusMessage({ text: 'Xuất file in ấn 300 DPI CMYK thành công!', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
      setLogs((prev) => prev + `\n❌ Lỗi: ${err.message}\n`);
    } finally {
      setIsExportingPrint(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Rust Native Engines v1.0
            </span>
            <span className="text-xs text-stone-400">• rustc 1.100.0</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">
            Bộ Công Cụ Hiệu Năng Cao (Rust Tooling Suite)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Cào template & stock tự động, nén ảnh cưới đa luồng và kết xuất file PDF in ấn 300 DPI chuẩn công nghiệp.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab('crawler')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'crawler'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Tool Cào Mẫu</span>
          </button>
          <button
            onClick={() => setActiveTab('compressor')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'compressor'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Nén Ảnh Cưới</span>
          </button>
          <button
            onClick={() => setActiveTab('print')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'print'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>3. Xuất Bản In 300 DPI</span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Feature Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: CRAWLER */}
          {activeTab === 'crawler' && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Cào Template & Stock Tự Động
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Tokio Async Runtime • Tải đồng thời 16–32 luồng siêu tốc
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Đường dẫn thiệp cưới / mẫu cần cào (URL)
                  </label>
                  <input
                    type="text"
                    value={crawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Gợi ý: Dán URL từ m-invite.com, melipage.com hoặc bất kỳ trang thiệp online nào.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Số luồng tải song song (Concurrency)
                    </label>
                    <span className="text-xs font-mono font-bold text-stone-900">
                      {crawlConcurrency} workers
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="4"
                    value={crawlConcurrency}
                    onChange={(e) => setCrawlConcurrency(Number(e.target.value))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
                  <div className="font-semibold text-stone-800">Quy trình tự động hóa:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-stone-500">
                    <li>Bóc tách cấu trúc DOM & JSON canvas từ trang nguồn.</li>
                    <li>Tải toàn bộ hình ảnh, font chữ, âm thanh mp3 về thư mục <code className="text-stone-800">public/assets/crawled/</code>.</li>
                    <li>Tự động tạo preset JSON chuẩn hóa sẵn sàng mở trong Studio.</li>
                  </ul>
                </div>

                <button
                  onClick={handleRunCrawler}
                  disabled={isCrawling}
                  className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isCrawling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang cào dữ liệu & tải đa luồng...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Bắt Đầu Cào Tự Động Bằng Rust</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COMPRESSOR */}
          {activeTab === 'compressor' && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Nén Ảnh Cưới Siêu Tốc (Rayon Multi-core)
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Nén hàng loạt ảnh từ 25MB → 350KB WebP • Giữ nguyên độ sắc nét
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Thư mục ảnh đầu vào (Input Directory)
                  </label>
                  <input
                    type="text"
                    value={compressInput}
                    onChange={(e) => setCompressInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Thư mục chứa ảnh cưới gốc chất lượng cao (.jpg, .png, .tiff, .bmp).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Độ phân giải tối đa (Max Width)
                    </label>
                    <select
                      value={compressMaxWidth}
                      onChange={(e) => setCompressMaxWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                    >
                      <option value={1920}>1920px (Full HD Cưới - Chuẩn)</option>
                      <option value={2560}>2560px (2K QHD Retina)</option>
                      <option value={3840}>3840px (4K Ultra High-Res)</option>
                      <option value={1200}>1200px (Mobile Web Tối Ưu)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-stone-700">
                        Chất lượng WebP (Quality)
                      </label>
                      <span className="text-xs font-mono font-bold text-stone-900">
                        {compressQuality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      step="5"
                      value={compressQuality}
                      onChange={(e) => setCompressQuality(Number(e.target.value))}
                      className="w-full accent-stone-900 cursor-pointer mt-2"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunCompressor}
                  disabled={isCompressing}
                  className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang nén đa luồng trên CPU...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Bắt Đầu Nén Toàn Bộ Ảnh Cưới</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRINT EXPORTER */}
          {activeTab === 'print' && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Xuất File In Ấn 300 DPI CMYK Chuẩn Xưởng
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Bù xén Bleed 2–3mm • Dấu cắt Crop marks • Dải kiểm màu CMYK
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Mẫu thiệp cần xuất in ấn (Template Slug)
                  </label>
                  <input
                    type="text"
                    value={printSlug}
                    onChange={(e) => setPrintSlug(e.target.value)}
                    placeholder="envelope-chamomile"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Kích thước bản in giấy
                    </label>
                    <select
                      value={printFormat}
                      onChange={(e) => setPrintFormat(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                    >
                      <option value="A5">Khổ A5 Chuẩn (148 × 210 mm)</option>
                      <option value="SQUARE">Thiệp Vuông Hiện Đại (150 × 150 mm)</option>
                      <option value="A6">Khổ Nhỏ A6 (105 × 148 mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Bù lề xén mép dao (Bleed)
                    </label>
                    <select
                      value={printBleed}
                      onChange={(e) => setPrintBleed(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                    >
                      <option value={2.0}>+2.0 mm (Máy cắt CNC tự động)</option>
                      <option value={3.0}>+3.0 mm (Chuẩn xưởng in Việt Nam)</option>
                      <option value={5.0}>+5.0 mm (Bản in kích thước lớn)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunPrintExport}
                    disabled={isExportingPrint}
                    className="flex-1 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {isExportingPrint ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xuất file in ấn 300 DPI...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Xuất File PDF In Ấn (300 DPI CMYK)</span>
                      </>
                    )}
                  </button>

                  {downloadPdfUrl && (
                    <a
                      href={downloadPdfUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải PDF</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Output Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-stone-900 text-stone-100 shadow-xl border border-stone-800 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-stone-200">
                  RUST ENGINE OUTPUT CONSOLE
                </span>
              </div>
              <button
                onClick={() => setLogs('')}
                className="text-[10px] text-stone-500 hover:text-stone-300 font-mono transition-colors"
              >
                Xóa log
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto pt-3 font-mono text-[11px] leading-relaxed text-stone-300 whitespace-pre-wrap select-text">
              {logs || 'Chờ lệnh từ bộ công cụ Rust...\nChọn một tác vụ bên trái và nhấn Bắt Đầu để thực thi.'}
            </pre>

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-500 font-mono">
              <span>Status: {isCrawling || isCompressing || isExportingPrint ? 'RUNNING' : 'IDLE'}</span>
              <span>Buffer: UTF-8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
