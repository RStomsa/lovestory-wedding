import { NextRequest, NextResponse } from 'next/server';
import {
  AiDesignRequest,
  AiDesignResult,
  generateAlgorithmicTemplate,
  restyleCanvasPalette,
  generateWeddingWording,
} from '@/lib/ai/aiStudioService';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiDesignRequest;

    if (!body || !body.mode) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin chế độ thiết kế (mode).' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // -------------------------------------------------------------
    // MODE 1: Restyle Palette
    // -------------------------------------------------------------
    if (body.mode === 'restyle_palette') {
      const targetPalette = body.targetPalette || 'korean_pastel';
      const result = restyleCanvasPalette(body.currentElements || [], targetPalette);
      return NextResponse.json({
        success: true,
        message: `Đã áp dụng bảng màu "${result.paletteName}" thành công!`,
        paletteName: result.paletteName,
        elements: result.elements,
        config: {
          background: result.background,
        },
        aiEngineUsed: 'algorithmic_studio_engine',
      } as AiDesignResult);
    }

    // -------------------------------------------------------------
    // MODE 2: Rewrite Wording
    // -------------------------------------------------------------
    if (body.mode === 'rewrite_wording') {
      const tone = body.wordingTone || 'romantic';
      const groom = body.groomName?.trim() || 'Minh Thành';
      const bride = body.brideName?.trim() || 'Bảo Ngọc';

      if (geminiApiKey) {
        try {
          const tonePromptMap = {
            formal: 'trang trọng, tôn nghiêm, kính cẩn kính mời trưởng bối và quan khách hai họ',
            romantic: 'ngọt ngào, lãng mạn, kể về tình yêu son sắt và sự đồng hành trọn đời',
            modern: 'trẻ trung, tươi vui, gần gũi, chia sẻ niềm hạnh phúc cùng bạn bè',
            minimal: 'tinh tế, súc tích, ngắn gọn nhưng đọng lại nhiều chiều sâu cảm xúc',
          };

          const aiPrompt = `Bạn là chuyên gia cố vấn thiệp cưới cao cấp của LoveStory. Hãy viết 1 đoạn văn lời mời cưới ngắn (khoảng 35-55 từ) với giọng điệu ${tonePromptMap[tone] || 'lãng mạn'}. Chú rể: ${groom}, Cô dâu: ${bride}. Lưu ý: Không dùng markdown hoa mỹ, không dùng dấu sao, chỉ trả về đúng nội dung văn bản thuần túy tiếng Việt chuẩn xác.`;

          const aiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: aiPrompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 200,
                },
              }),
            }
          );

          if (aiRes.ok) {
            const data = await aiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              return NextResponse.json({
                success: true,
                message: 'AI Gemini đã tạo lời mời cưới thành công!',
                generatedText: text,
                aiEngineUsed: 'gemini',
              } as AiDesignResult);
            }
          }
        } catch (e) {
          console.warn('[Gemini API] Failed, falling back to algorithmic engine:', e);
        }
      }

      // Algorithmic Fallback
      const text = generateWeddingWording(tone, groom, bride);
      return NextResponse.json({
        success: true,
        message: 'Đã tạo lời mời cưới bằng Studio Engine!',
        generatedText: text,
        aiEngineUsed: 'algorithmic_studio_engine',
      } as AiDesignResult);
    }

    // -------------------------------------------------------------
    // MODE 3: Generate Full Template
    // -------------------------------------------------------------
    if (body.mode === 'generate_template') {
      const generated = generateAlgorithmicTemplate(body);

      // If Gemini API is available, optionally enrich wedding wording & quotes
      if (geminiApiKey && body.prompt) {
        try {
          const enrichPrompt = `Bạn là Giám đốc Sáng tạo thiệp cưới của LoveStory Studio. 
Khách hàng yêu cầu: "${body.prompt}".
Chú rể: ${body.groomName || 'Minh Thành'}, Cô dâu: ${body.brideName || 'Bảo Ngọc'}.
Hãy đề xuất:
1) Một tiêu đề thiệp nghệ thuật (tối đa 6 từ).
2) Một câu slogan tình yêu (tối đa 12 từ).
3) Đoạn lời ngỏ mời cưới ngọt ngào (khoảng 35-50 từ).
Trả về dạng JSON: {"title": "...", "quote": "...", "wording": "..."}`;

          const aiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: enrichPrompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.7,
                  maxOutputTokens: 300,
                },
              }),
            }
          );

          if (aiRes.ok) {
            const data = await aiRes.json();
            const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawJson) {
              const parsed = JSON.parse(rawJson);
              if (parsed.title) {
                generated.name = parsed.title;
                if (generated.config) generated.config.title = parsed.title;
              }
              // Enrich corresponding elements
              if (generated.elements) {
                generated.elements = generated.elements.map((el) => {
                  if (el.id === 'el-title-main' && parsed.title) {
                    return { ...el, text: parsed.title };
                  }
                  if (el.id === 'el-quote' && parsed.quote) {
                    return { ...el, text: `"${parsed.quote}"` };
                  }
                  if (el.id === 'el-invitation-body' && parsed.wording) {
                    return { ...el, text: parsed.wording };
                  }
                  return el;
                });
              }
              generated.aiEngineUsed = 'gemini';
              generated.message = `AI Gemini & Studio Engine đã thiết kế hoàn mỹ mẫu "${generated.name}"!`;
            }
          }
        } catch (e) {
          console.warn('[Gemini Enrichment] Fallback to standard algorithmic design:', e);
        }
      }

      return NextResponse.json(generated);
    }

    return NextResponse.json(
      { success: false, message: 'Chế độ (mode) không hợp lệ.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('AI Studio API Error:', error);
    const msg = error instanceof Error ? error.message : 'Lỗi nội bộ AI Studio';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
