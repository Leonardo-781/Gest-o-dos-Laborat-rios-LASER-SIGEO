/**
 * SILAB - Módulo de Segurança e Autenticação Criptográfica
 * Utiliza Web Crypto API (SHA-256 + Salt) para proteção de credenciais
 */

// Regex estrito para validação de e-mail institucional (NÃO permite vírgulas nem caracteres inválidos)
export const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validação estrita de e-mail
 * Retorna true se for um e-mail válido e sem vírgulas
 */
export function validateEmailStrict(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'O e-mail é obrigatório.' };
  }

  const trimmed = email.trim();

  // Verificação explícita de vírgula (solicitado expressamente pelo usuário)
  if (trimmed.includes(',')) {
    return { 
      isValid: false, 
      error: 'E-mail inválido: contém vírgula (,). Utilize ponto (.) para o domínio (ex: leonardo.cardoso@ufu.br).' 
    };
  }

  if (trimmed.includes(' ')) {
    return { isValid: false, error: 'O e-mail não pode conter espaços.' };
  }

  if (!STRICT_EMAIL_REGEX.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Formato de e-mail inválido. Utilize o formato correto (exemplo: usuario@ufu.br).' 
    };
  }

  return { isValid: true };
}

/**
 * Gera um salt aleatório em hexadecimal para reforçar o hash da senha
 */
export function generateSalt(length = 16): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback seguro baseado em timestamp e Math.random
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Computa o hash SHA-256 com salt de uma senha
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const combined = `${salt}:${password}:silab_salt_2026`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback para ambientes sem crypto.subtle direto
  return fallbackSha256(combined);
}

/**
 * Verifica se a senha fornecida corresponde ao hash e salt salvos
 */
export async function verifyPassword(password: string, storedHash?: string, salt?: string): Promise<boolean> {
  if (!storedHash || !salt) return false;
  const computed = await hashPassword(password, salt);
  return computed === storedHash;
}

/**
 * Implementação leve e pura de SHA-256 para fallback síncrono/compatibilidade
 */
function fallbackSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const maxWord = Math.pow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let i = 0;
  for (i = 0; i < ascii.length; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (8 * (3 - (i % 4)));
  }
  words[i >> 2] |= 0x80 << (8 * (3 - (i % 4)));
  words[(((ascii.length + 8) >> 6) << 4) + 15] = asciiBitLength;

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (let kIdx = 0; kIdx < 64; kIdx++) {
      if (kIdx >= 16) {
        const gamma0 = rightRotate(w[kIdx - 15], 7) ^ rightRotate(w[kIdx - 15], 18) ^ (w[kIdx - 15] >>> 3);
        const gamma1 = rightRotate(w[kIdx - 2], 17) ^ rightRotate(w[kIdx - 2], 19) ^ (w[kIdx - 2] >>> 10);
        w[kIdx] = (w[kIdx - 16] + gamma0 + w[kIdx - 7] + gamma1) >>> 0;
      }
      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const sigma0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const sigma1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const temp1 = (h + sigma1 + ch + k[kIdx] + w[kIdx]) >>> 0;
      const temp2 = (sigma0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }

  for (let hIdx = 0; hIdx < hash.length; hIdx++) {
    for (let bIdx = 3; bIdx >= 0; bIdx--) {
      const byte = (hash[hIdx] >> (8 * bIdx)) & 0xff;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

// Salt fixo institucional para as contas padrão do sistema
export const DEFAULT_INSTITUTIONAL_SALT = 'silab_ufu_agrimensura_2026';

// Hash pré-calculado para a senha Master: swordfish781
export const MASTER_USER_CONFIG = {
  id: 'usr-master',
  name: 'Leonardo Cardoso (Administrador Master)',
  email: 'leonardo.cardoso@ufu.br',
  role: 'tecnico' as const,
  roleTitle: 'Administrador Master / Técnico Geral',
  documentId: 'SIAPE 781001 / Coordenação Técnica UFU',
  department: 'Engenharia de Agrimensura e Cartografia - UFU',
  status: 'ativo' as const,
  avatarInitials: 'LC',
  salt: DEFAULT_INSTITUTIONAL_SALT,
  // Hash de 'swordfish781' com salt 'silab_ufu_agrimensura_2026'
  passwordHash: fallbackSha256(`${DEFAULT_INSTITUTIONAL_SALT}:swordfish781:silab_salt_2026`),
  emailVerified: true
};

// Hash pré-calculado para a senha padrão de teste dos outros usuários: 123456
export const DEFAULT_TEST_PASSWORD_HASH = fallbackSha256(`${DEFAULT_INSTITUTIONAL_SALT}:123456:silab_salt_2026`);
