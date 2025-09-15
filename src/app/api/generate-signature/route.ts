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

    // Ajustar posições baseado na análise da imagem
    const leftMargin = 500; // Era 420, vamos mover mais para direita
    const startY = 140;     // Era 180, vamos subir um pouco
    const lineHeight = 35;  // Era 40, vamos diminuir espaçamento

    const textPositions = {
      nome: { x: leftMargin, y: startY },
      email: { x: leftMargin, y: startY + lineHeight },
      telefone: { x: leftMargin, y: startY + lineHeight * 2 },
    };

    // Voltar ao texto real com configurações mais robustas
    const compositeElements: sharp.OverlayOptions[] = [];

    // Nome - usando configurações mais básicas e compatíveis
    const nomeSvg = `
      <svg width="600" height="60" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="0" 
          y="40" 
          font-size="36" 
          fill="black"
          font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
        >${escapeXml(nome)}</text>
      </svg>
    `;
    
    compositeElements.push({
      input: Buffer.from(nomeSvg),
      left: textPositions.nome.x,
      top: textPositions.nome.y
    });

    // Email
    const emailSvg = `
      <svg width="600" height="40" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="0" 
          y="30" 
          font-size="26" 
          fill="black"
          font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
        >${escapeXml(email)}</text>
      </svg>
    `;
    
    compositeElements.push({
      input: Buffer.from(emailSvg),
      left: textPositions.email.x,
      top: textPositions.email.y
    });

    // Telefone (se fornecido)
    if (telefone?.trim()) {
      const telefoneSvg = `
        <svg width="600" height="40" xmlns="http://www.w3.org/2000/svg">
          <text 
            x="0" 
            y="30" 
            font-size="26" 
            fill="black"
            font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif"
          >${escapeXml(telefone)}</text>
        </svg>
      `;
      
      compositeElements.push({
        input: Buffer.from(telefoneSvg),
        left: textPositions.telefone.x,
        top: textPositions.telefone.y
      });
    }

    console.log('Testando com texto real e fontes do sistema Linux');
    console.log('Nome a renderizar:', nome);
    console.log('Email a renderizar:', email);

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
