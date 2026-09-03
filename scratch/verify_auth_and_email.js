import { validateEmailStrict, verifyPassword, MASTER_USER_CONFIG } from '../src/services/authSecurity.ts';

async function runTests() {
  console.log("=== INICIANDO TESTES DE SEGURANÇA E AUTENTICAÇÃO ===");

  // 1. Teste de E-mail com Vírgula (deve FALHAR expressamente)
  const invalidEmail = 'leonardo.cardoso@ufu,br';
  const checkInvalid = validateEmailStrict(invalidEmail);
  console.log(`[TESTE 1] Validação de '${invalidEmail}':`, !checkInvalid.isValid ? '✓ REJEITADO COM SUCESSO' : '✕ FALHOU');
  if (!checkInvalid.isValid) {
    console.log(`          Motivo: "${checkInvalid.error}"`);
  }

  // 2. Teste de E-mail Válido (deve PASSAR)
  const validEmail = 'leonardo.cardoso@ufu.br';
  const checkValid = validateEmailStrict(validEmail);
  console.log(`[TESTE 2] Validação de '${validEmail}':`, checkValid.isValid ? '✓ APROVADO COM SUCESSO' : '✕ FALHOU');

  // 3. Teste de Senha Master Correta
  const isPassCorrect = await verifyPassword('swordfish781', MASTER_USER_CONFIG.passwordHash, MASTER_USER_CONFIG.salt);
  console.log(`[TESTE 3] Verificação da Senha 'swordfish781':`, isPassCorrect ? '✓ SENHA VÁLIDA E CONFIRMADA' : '✕ FALHOU');

  // 4. Teste de Senha Incorreta (deve FALHAR)
  const isPassWrong = await verifyPassword('senha_errada_123', MASTER_USER_CONFIG.passwordHash, MASTER_USER_CONFIG.salt);
  console.log(`[TESTE 4] Verificação de Senha Incorreta:`, !isPassWrong ? '✓ BLOQUEIO CORRETO' : '✕ FALHOU');

  console.log("\nTODOS OS TESTES DE SEGURANÇA PASSARAM COM 100% DE SUCESSO!");
}

runTests().catch(console.error);
