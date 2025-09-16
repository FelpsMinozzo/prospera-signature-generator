import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

process.env.FONTCONFIG_PATH = '';
export const runtime = 'nodejs';

interface SignatureData {
  nome: string;
  telefone?: string;
  email: string;
}

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

    const templatePath = path.join(process.cwd(), 'public', 'templates', 'signature-template.png');
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { success: false, error: 'Template de assinatura não encontrado' },
        { status: 500 }
      );
    }

    const signatureBuffer = await generateSignatureImage({ nome, telefone, email, templatePath });

    return new Response(new Uint8Array(signatureBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="assinatura-${nome.replace(/\s+/g, '-').toLowerCase()}.png"`,
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

  const templateBuffer = fs.readFileSync(templatePath);
  const template = sharp(templateBuffer);
  const { width, height } = await template.metadata();

  if (!width || !height) {
    throw new Error('Não foi possível obter dimensões do template');
  }

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
  if (!fs.existsSync(fontPath)) {
    throw new Error('Fonte ARIAL.TTF não encontrada');
  }

  const fontData = fs.readFileSync(fontPath).toString('base64');

  const style = `
    .text {
      font-family: 'sans-serif';
      fill: #333333;
      font-weight: normal;
    }
  `;

  const leftMargin = 420;
  const startY = 180;
  const lineHeight = 40;

  const lines = [
    `<text x="${leftMargin}" y="${startY}" class="text" font-size="40">${nome}</text>`,
    `<text x="${leftMargin}" y="${startY + lineHeight}" class="text" font-size="30">${email}</text>`,
  ];

  if (telefone?.trim()) {
    lines.push(`<text x="${leftMargin}" y="${startY + lineHeight * 2}" class="text" font-size="30">${telefone}</text>`);
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <style type="text/css">
          ${style}
        </style>
      </defs>
      ${lines.join('\n')}
    </svg>
  `;

  const svgBuffer = Buffer.from(svg, 'utf-8');

  return await template
    .composite([{ input: svgBuffer, top: 0, left: 0 }])
    .png({ quality: 100, compressionLevel: 0 })
    .toBuffer();
}
