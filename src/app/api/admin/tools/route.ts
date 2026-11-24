import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const toolsBin = path.join(
      process.cwd(),
      'tools',
      'lovestory-tools',
      'target',
      'release',
      'lovestory-tools.exe'
    );

    const devBin = path.join(
      process.cwd(),
      'tools',
      'lovestory-tools',
      'target',
      'debug',
      'lovestory-tools.exe'
    );

    // Pick release binary if compiled, otherwise debug binary, otherwise cargo run
    let runnerCmd = '';
    if (fs.existsSync(toolsBin)) {
      runnerCmd = `"${toolsBin}"`;
    } else if (fs.existsSync(devBin)) {
      runnerCmd = `"${devBin}"`;
    } else {
      runnerCmd = `cargo run --manifest-path tools/lovestory-tools/Cargo.toml --`;
    }

    if (action === 'crawl') {
      const { url, concurrency = 16 } = body;
      if (!url || typeof url !== 'string') {
        return NextResponse.json(
          { success: false, error: 'URL không hợp lệ' },
          { status: 400 }
        );
      }

      const outputDir = path.join(process.cwd(), 'public', 'assets', 'crawled');
      const cmd = `${runnerCmd} crawl --url "${url}" --output "${outputDir}" --concurrency ${concurrency}`;

      const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });

      return NextResponse.json({
        success: true,
        message: 'Cào template & stock tự động thành công!',
        output: stdout,
        logs: stderr,
      });
    }

    if (action === 'compress') {
      const { inputPath, maxWidth = 1920, quality = 85 } = body;
      const targetInput = inputPath
        ? path.resolve(process.cwd(), inputPath)
        : path.join(process.cwd(), 'public', 'assets', 'wedding', 'photos');

      const outputDir = path.join(process.cwd(), 'public', 'assets', 'compressed');

      const cmd = `${runnerCmd} compress --input "${targetInput}" --output "${outputDir}" --max-width ${maxWidth} --quality ${quality}`;

      const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });

      return NextResponse.json({
        success: true,
        message: 'Nén ảnh cưới đa luồng thành công!',
        output: stdout,
        logs: stderr,
      });
    }

    if (action === 'export-print') {
      const { templateSlug = 'envelope-chamomile', widthMm = 148, heightMm = 210, bleedMm = 3 } = body;

      const outputPdf = path.join(
        process.cwd(),
        'public',
        'assets',
        'prints',
        `${templateSlug}_300dpi_print.pdf`
      );

      const templateJson = path.join(
        process.cwd(),
        'src',
        'data',
        'harvested_templates',
        `${templateSlug}.json`
      );

      const templateArg = fs.existsSync(templateJson) ? `--template "${templateJson}"` : '';
      const cmd = `${runnerCmd} export-print ${templateArg} --output "${outputPdf}" --width-mm ${widthMm} --height-mm ${heightMm} --bleed-mm ${bleedMm}`;

      const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });

      return NextResponse.json({
        success: true,
        message: 'Xuất file in ấn 300 DPI CMYK thành công!',
        pdfUrl: `/assets/prints/${templateSlug}_300dpi_print.pdf`,
        output: stdout,
        logs: stderr,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Hành động không hợp lệ' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Tools API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Lỗi xử lý công cụ Rust',
      },
      { status: 500 }
    );
  }
}
