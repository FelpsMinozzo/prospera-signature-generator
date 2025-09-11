// import { NextResponse } from 'next/server';
// import sharp from 'sharp';
// import path from 'path';
// import fs from 'fs';

// interface SignatureData {
//   nome: string;
//   telefone?: string;
//   email: string;
// }

// interface FontConfig {
//   family: string;
//   size: number;
//   color: string;
//   weight: number;
// }

// const FONT_CONFIGS = {
//   nome: { family: 'DejaVu Sans, Arial, sans-serif', size: 40, color: '#333333', weight: 400 } as FontConfig,
//   telefone: { family: 'DejaVu Sans, Arial, sans-serif', size: 30, color: '#333333', weight: 400 } as FontConfig,
//   email: { family: 'DejaVu Sans, Arial, sans-serif', size: 30, color: '#333333', weight: 400 } as FontConfig,
// };

// export async function POST(req: Request) {

//   registerFont(path.join(process.cwd(), 'public', 'fonts', 'comicsans.ttf'), { family: 'Comic Sans' });

//   try {
//     const { nome, telefone, email }: SignatureData = await req.json();

//     if (!nome || !email) {
//       return NextResponse.json(
//         { success: false, error: 'Nome e email são obrigatórios' },
//         { status: 400 }
//       );
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return NextResponse.json(
//         { success: false, error: 'Formato de email inválido' },
//         { status: 400 }
//       );
//     }

//     const templatePath = path.join(
//       process.cwd(),
//       'public',
//       'templates',
//       'signature-template.png'
//     );

//     if (!fs.existsSync(templatePath)) {
//       return NextResponse.json(
//         { success: false, error: 'Template de assinatura não encontrado' },
//         { status: 500 }
//       );
//     }

//     const signatureBuffer = await generateSignatureImage({
//       nome,
//       telefone,
//       email,
//       templatePath,
//     });

//     return new Response(new Uint8Array(signatureBuffer), {
//       status: 200,
//       headers: {
//         'Content-Type': 'image/png',
//         'Content-Disposition': `attachment; filename="assinatura-${nome
//           .replace(/\s+/g, '-')
//           .toLowerCase()}.png"`,
//         'Cache-Control': 'no-cache',
//       },
//     });
//   } catch (error) {
//     console.error('Erro ao gerar assinatura:', error);
//     return NextResponse.json(
//       { success: false, error: 'Erro interno do servidor ao gerar assinatura' },
//       { status: 500 }
//     );
//   }
// }

// async function generateSignatureImage(params: {
//   nome: string;
//   telefone?: string;
//   email: string;
//   templatePath: string;
// }): Promise<Buffer> {
//   const { nome, telefone, email, templatePath } = params;
//   const templateBuffer = fs.readFileSync(templatePath);
//   const template = sharp(templateBuffer);
//   const { width, height } = await template.metadata();

//   if (!width || !height) throw new Error('Não foi possível obter dimensões do template');

//   const leftMargin = 420;
//   const startY = 180;
//   const lineHeight = 40;

//   const textPositions = {
//     nome: { x: leftMargin, y: startY },
//     email: { x: leftMargin, y: startY + lineHeight },
//     telefone: { x: leftMargin, y: startY + lineHeight * 2 },
//   };

//   const textElements: string[] = [];

//   textElements.push(`
//     <text 
//       x="${textPositions.nome.x}" 
//       y="${textPositions.nome.y}" 
//       font-family="${FONT_CONFIGS.nome.family}" 
//       font-size="${FONT_CONFIGS.nome.size}" 
//       font-weight="${FONT_CONFIGS.nome.weight}"
//       fill="${FONT_CONFIGS.nome.color}"
//       text-anchor="start"
//       dominant-baseline="hanging"
//     >${escapeXml(nome)}</text>
//   `);

//   textElements.push(`
//     <text 
//       x="${textPositions.email.x}" 
//       y="${textPositions.email.y}" 
//       font-family="${FONT_CONFIGS.email.family}" 
//       font-size="${FONT_CONFIGS.email.size}" 
//       font-weight="${FONT_CONFIGS.email.weight}"
//       fill="${FONT_CONFIGS.email.color}"
//       text-anchor="start"
//       dominant-baseline="hanging"
//     >${escapeXml(email)}</text>
//   `);

//   if (telefone?.trim()) {
//     textElements.push(`
//       <text 
//         x="${textPositions.telefone.x}" 
//         y="${textPositions.telefone.y}" 
//         font-family="${FONT_CONFIGS.telefone.family}" 
//         font-size="${FONT_CONFIGS.telefone.size}" 
//         font-weight="${FONT_CONFIGS.telefone.weight}"
//         fill="${FONT_CONFIGS.telefone.color}"
//         text-anchor="start"
//         dominant-baseline="hanging"
//       >${escapeXml(telefone)}</text>
//     `);
//   }

//   const textOverlaySvg = `
//     <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
//       ${textElements.join('\n')}
//     </svg>
//   `;

//   const textOverlayBuffer = Buffer.from(textOverlaySvg, 'utf-8');

//   return await template
//     .composite([{ input: textOverlayBuffer, top: 0, left: 0 }])
//     .png({ quality: 100, compressionLevel: 0 })
//     .toBuffer();
// }

// function escapeXml(text: string): string {
//   return text
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#39;');
// }
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

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

    const signatureBuffer = await generateSignatureWithSharp({
      nome,
      telefone,
      email,
      templatePath,
    });

    return new Response(
      signatureBuffer.buffer.slice(
        signatureBuffer.byteOffset,
        signatureBuffer.byteOffset + signatureBuffer.byteLength
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="assinatura-${nome
            .replace(/\s+/g, '-')
            .toLowerCase()}.png"`,
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao gerar assinatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor ao gerar assinatura' },
      { status: 500 }
    );
  }
}

async function generateTextSvg(
  text: string,
  fontSize: number,
  color: string,
  weight: string
): Promise<Buffer> {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="60">
      <text x="0" y="${fontSize}" font-family="Inter, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${color}">
        ${escapedText}
      </text>
    </svg>
  `;
  return Buffer.from(svg);
}

async function generateSignatureWithSharp(params: {
  nome: string;
  telefone?: string;
  email: string;
  templatePath: string;
}): Promise<Buffer> {
  const { nome, telefone, email, templatePath } = params;

  try {
    const templateBuffer = fs.readFileSync(templatePath);
    const compositeElements: sharp.OverlayOptions[] = [];

    const nomeBuffer = await generateTextSvg(nome, 40, '#333', 'bold');
    compositeElements.push({ input: nomeBuffer, top: 120, left: 420 });

    const emailBuffer = await generateTextSvg(email, 30, '#333', 'normal');
    compositeElements.push({ input: emailBuffer, top: 170, left: 420 });

    if (telefone && telefone.trim() !== '') {
      const telefoneBuffer = await generateTextSvg(telefone, 30, '#333', 'normal');
      compositeElements.push({ input: telefoneBuffer, top: 220, left: 420 });
    }

    const result = await sharp(templateBuffer)
      .composite(compositeElements)
      .png()
      .toBuffer();

    return result;
  } catch (error) {
    console.error('Error generating signature with Sharp:', error);
    throw new Error(
      `Failed to generate signature: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
