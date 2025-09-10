const { exec } = require('child_process');
const fs = require('fs');

// Script para verificar se tudo está funcionando
function runDevCheck() {
  console.log('🚀 Executando verificações de desenvolvimento...\n');

  // Verificar dependências
  console.log('📦 Verificando dependências...');
  exec('npm list sharp formidable @types/formidable', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Algumas dependências estão ausentes');
      console.log('Execute: npm install sharp formidable @types/formidable');
    } else {
      console.log('✅ Todas as dependências estão instaladas');
    }
  });

  // Verificar TypeScript
  console.log('🔍 Verificando TypeScript...');
  exec('npx tsc --noEmit', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Erros de TypeScript encontrados:');
      console.log(stderr);
    } else {
      console.log('✅ Nenhum erro de TypeScript');
    }
  });

  // Verificar lint
  console.log('🧹 Verificando ESLint...');
  exec('npx eslint . --ext .ts,.tsx', (error, stdout, stderr) => {
    if (error && error.code === 1) {
      console.log('⚠️  Avisos de lint encontrados:');
      console.log(stdout);
    } else {
      console.log('✅ Nenhum problema de lint');
    }
  });

  setTimeout(() => {
    console.log('\n✨ Verificações concluídas!');
    console.log('Para iniciar o servidor: npm run dev');
  }, 2000);
}

if (require.main === module) {
  runDevCheck();
}

module.exports = { runDevCheck };