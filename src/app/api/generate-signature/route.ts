import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Configurar variável de ambiente para evitar erro do fontconfig
process.env.FONTCONFIG_PATH = '';

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
  nome: { family: 'Arial, sans-serif', size: 40, color: '#000000', weight: '700' } as FontConfig,
  telefone: { family: 'Arial, sans-serif', size: 30, color: '#000000', weight: '400' } as FontConfig,
  email: { family: 'Arial, sans-serif', size: 30, color: '#000000', weight: '400' } as FontConfig,
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

    // Vamos tentar com método mais simples - SVGs sem font-family específica
    const compositeElements: sharp.OverlayOptions[] = [];

    // Nome - usando sans-serif genérica
    const nomeSvg = `
      <svg width="800" height="80" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="10" 
          y="50" 
          font-family="sans-serif" 
          font-size="40" 
          font-weight="bold"
          fill="#000000"
          stroke="#000000"
          stroke-width="0.5"
        >${escapeXml(nome)}</text>
      </svg>
    `;
    
    compositeElements.push({
      input: Buffer.from(nomeSvg),
      left: textPositions.nome.x,
      top: textPositions.nome.y - 20
    });

    // Email
    const emailSvg = `
      <svg width="800" height="60" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="10" 
          y="40" 
          font-family="sans-serif" 
          font-size="30" 
          font-weight="normal"
          fill="#000000"
          stroke="#000000"
          stroke-width="0.3"
        >${escapeXml(email)}</text>
      </svg>
    `;
    
    compositeElements.push({
      input: Buffer.from(emailSvg),
      left: textPositions.email.x,
      top: textPositions.email.y - 15
    });

    // Telefone (se fornecido)
    if (telefone?.trim()) {
      const telefoneSvg = `
        <svg width="800" height="60" xmlns="http://www.w3.org/2000/svg">
          <text 
            x="10" 
            y="40" 
            font-family="sans-serif" 
            font-size="30" 
            font-weight="normal"
            fill="#000000"
            stroke="#000000"
            stroke-width="0.3"
          >${escapeXml(telefone)}</text>
        </svg>
      `;
      
      compositeElements.push({
        input: Buffer.from(telefoneSvg),
        left: textPositions.telefone.x,
        top: textPositions.telefone.y - 15
      });
    }

    // Debug logs mais detalhados
    console.log('Número de elementos compostos:', compositeElements.length);
    console.log('Nome SVG completo:', nomeSvg);
    console.log('Posições calculadas:', {
      nome: { left: textPositions.nome.x, top: textPositions.nome.y - 20 },
      email: { left: textPositions.email.x, top: textPositions.email.y - 15 }
    });

    // Compor a imagem final
    return await template
      .composite(compositeElements)
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
