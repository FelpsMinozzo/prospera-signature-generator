const fs = require('fs');
const path = require('path');

// Script para verificar estrutura do projeto
function checkProjectStructure() {
  const requiredDirs = [
    'components',
    'lib', 
    'types',
    'styles/components',
    'public/templates',
    'pages/api'
  ];

  const requiredFiles = [
    'tsconfig.json',
    'next.config.js',
    'middleware.ts'
  ];

  console.log('🔍 Verificando estrutura do projeto...\n');

  // Verificar diretórios
  requiredDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Diretório existe: ${dir}`);
    } else {
      console.log(`❌ Diretório ausente: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Criado: ${dir}`);
    }
  });

  // Verificar arquivos
  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Arquivo existe: ${file}`);
    } else {
      console.log(`❌ Arquivo ausente: ${file}`);
    }
  });

  // Verificar template
  const templatePath = path.join(process.cwd(), 'public/templates/signature-template.png');
  if (fs.existsSync(templatePath)) {
    console.log('✅ Template de assinatura encontrado');
  } else {
    console.log('⚠️  Template de assinatura não encontrado em public/templates/');
    console.log('   Por favor, adicione seu arquivo signature-template.png');
  }

  console.log('\n🎉 Verificação concluída!');
}

if (require.main === module) {
  checkProjectStructure();
}

module.exports = { checkProjectStructure };