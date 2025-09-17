import { NextResponse } from 'next/server';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

interface SignatureData {
  nome: string;
  telefone?: string;
  email: string;
}

interface FontConfig {
  family: string;
  size: number;
  color: string;
  weight: number;
}

const FONT_CONFIGS = {
  nome: { family: 'OpenSans', size: 40, color: '#333333', weight: 400 } as FontConfig,
  telefone: { family: 'OpenSans', size: 35, color: '#333333', weight: 400 } as FontConfig,
  email: { family: 'OpenSans', size: 30, color: '#333333', weight: 400 } as FontConfig,
};

const fontPath = path.join(process.cwd(), 'public', 'fonts', 'OpenSans-Regular.ttf');
if (!fs.existsSync(fontPath)) {
  throw new Error('Fonte OpenSans não encontrada no servidor');
}
registerFont(fontPath, { family: 'OpenSans' });

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

  const template = await loadImage(templatePath);
  const canvas = createCanvas(template.width!, template.height!);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(template, 0, 0);

  const leftMargin = 420;
  const startY = 160;
  const lineHeight = 55;

  function drawText(text: string, fontConfig: FontConfig, x: number, y: number) {
    ctx.font = `${fontConfig.size}px ${fontConfig.family}`;
    ctx.fillStyle = fontConfig.color;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }

  drawText(nome, FONT_CONFIGS.nome, leftMargin, startY);
  drawText(email, FONT_CONFIGS.email, leftMargin, startY + lineHeight);
  if (telefone?.trim()) {
    drawText(telefone, FONT_CONFIGS.telefone, leftMargin, startY + lineHeight * 2);
  }

  return canvas.toBuffer('image/png');
}
