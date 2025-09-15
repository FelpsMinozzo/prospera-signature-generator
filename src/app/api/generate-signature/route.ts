import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

process.env.FONTCONFIG_PATH = '';
process.env.FONTCONFIG_FILE = '';
process.env.FC_CONFIG_FILE = '';

export const runtime = 'nodejs';

interface SignatureData {
  nome: string;
  telefone?: string;
  email: string;
}

interface FontConfig {
  family: string;
  size: number;
  color: string;
  weight: string;
}

const FONT_CONFIGS = {
  nome: { family: 'CustomArial, Arial, sans-serif', size: 40, color: '#333333', weight: 'bold' } as FontConfig,
  telefone: { family: 'CustomArial, Arial, sans-serif', size: 30, color: '#333333', weight: 'normal' } as FontConfig,
  email: { family: 'CustomArial, Arial, sans-serif', size: 30, color: '#333333', weight: 'normal' } as FontConfig,
};

export async function POST(req: Request) {
  try {
    const { nome, telefone, email }: SignatureData = await req.json();

    if (!nome || !email) {
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'signature-template.png'
    );

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { success: false, error: 'Template de assinatura não encontrado' },
        { status: 500 }
      );
    }

    const signatureBuffer = await generateSignatureImage({
      nome,
      telefone,
      email,
      templatePath,
    });

    return new Response(new Uint8Array(signatureBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="assinatura-${nome
          .replace(/\s+/g, '-')
          .toLowerCase()}.png"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar assinatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor ao gerar assinatura' },
      { status: 500 }
    );
  }
}

async function generateSignatureImage(params: {
  nome: string;
  telefone?: string;
  email: string;
  templatePath: string;
}): Promise<Buffer> {
  const { nome, telefone, email, templatePath } = params;
  
  try {
    // Carregar fonte customizada
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'ARIAL.TTF');
    let fontBase64 = '';
    
    if (fs.existsSync(fontPath)) {
      const fontBuffer = fs.readFileSync(fontPath);
      fontBase64 = fontBuffer.toString('base64');
    }

    const templateBuffer = fs.readFileSync(templatePath);
    const template = sharp(templateBuffer);
    const { width, height } = await template.metadata();

    if (!width || !height) {
      throw new Error('Não foi possível obter dimensões do template');
    }

    const leftMargin = 420;
    const startY = 180;
    const lineHeight = 40;

    const textPositions = {
      nome: { x: leftMargin, y: startY },
      email: { x: leftMargin, y: startY + lineHeight },
      telefone: { x: leftMargin, y: startY + lineHeight * 2 },
    };

    const textElements: string[] = [];

    // Nome
    textElements.push(`
      <text 
        x="${textPositions.nome.x}" 
        y="${textPositions.nome.y}" 
        font-family="${FONT_CONFIGS.nome.family}" 
        font-size="${FONT_CONFIGS.nome.size}" 
        font-weight="${FONT_CONFIGS.nome.weight}"
        fill="${FONT_CONFIGS.nome.color}"
        text-anchor="start"
        dominant-baseline="hanging"
      >${escapeXml(nome)}</text>
    `);

    // Email
    textElements.push(`
      <text 
        x="${textPositions.email.x}" 
        y="${textPositions.email.y}" 
        font-family="${FONT_CONFIGS.email.family}" 
        font-size="${FONT_CONFIGS.email.size}" 
        font-weight="${FONT_CONFIGS.email.weight}"
        fill="${FONT_CONFIGS.email.color}"
        text-anchor="start"
        dominant-baseline="hanging"
      >${escapeXml(email)}</text>
    `);

    // Telefone (se fornecido)
    if (telefone?.trim()) {
      textElements.push(`
        <text 
          x="${textPositions.telefone.x}" 
          y="${textPositions.telefone.y}" 
          font-family="${FONT_CONFIGS.telefone.family}" 
          font-size="${FONT_CONFIGS.telefone.size}" 
          font-weight="${FONT_CONFIGS.telefone.weight}"
          fill="${FONT_CONFIGS.telefone.color}"
          text-anchor="start"
          dominant-baseline="hanging"
        >${escapeXml(telefone)}</text>
      `);
    }

    // Criar SVG overlay com fonte customizada
    const textOverlaySvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            ${fontBase64 ? `
            @font-face {
              font-family: 'CustomArial';
              src: url('data:font/truetype;base64,${fontBase64}');
            }` : ''}
          </style>
        </defs>
        ${textElements.join('\n')}
      </svg>
    `;

    const textOverlayBuffer = Buffer.from(textOverlaySvg, 'utf-8');

    // Compor a imagem final
    return await template
      .composite([{ input: textOverlayBuffer, top: 0, left: 0 }])
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
      
  } catch (error) {
    console.error('Erro ao gerar imagem com Sharp:', error);
    throw new Error(`Falha ao gerar assinatura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
