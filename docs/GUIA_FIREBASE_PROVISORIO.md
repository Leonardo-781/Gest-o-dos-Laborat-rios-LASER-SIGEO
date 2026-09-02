# 🔥 Guia Prático: Banco de Dados Provisório no Firebase
## Sistema de Gestão dos Laboratórios LASER & SIGEO
**Departamento de Engenharia de Agrimensura e Cartografia**

Este guia ensina como ativar um **banco de dados em nuvem 100% gratuito** no Google Firebase Firestore em **menos de 2 minutos** para ser utilizado durante a apresentação do sistema.

---

### 🎯 Por que usar o Firebase na Apresentação?
* **Sincronização em Tempo Real (`WebSockets / onSnapshot`):**  
  Quando você (ou qualquer professor/avaliador na plateia) abrir o sistema pelo celular e fizer uma reserva ou chamado, a solicitação aparece **instantaneamente** na tela do computador/projetor sem precisar recarregar a página (`F5`).
* **Zero Custo e Sem Servidor:** Não requer configurar VPS, Docker ou backend complexo.
* **Resiliência:** Se a internet oscilar, o sistema continua funcionando perfeitamente em modo LocalStorage (modo offline).

---

## 🚀 Passo a Passo (2 Minutos)

### Passo 1: Criar o Projeto Gratuito no Firebase
1. Acesse: **[console.firebase.google.com](https://console.firebase.google.com)** com sua conta Google.
2. Clique no botão **"Adicionar projeto"** (ou *"Add project"*).
3. Digite o nome do projeto: `gestao-laser-sigeo` (ou o nome que preferir).
4. Desmarque o Google Analytics (opcional, para acelerar) e clique em **"Criar projeto"**.

---

### Passo 2: Ativar o Banco Firestore
1. No menu lateral esquerdo do Firebase Console, clique em **Criação** (Build) > **Firestore Database**.
2. Clique em **"Criar banco de dados"** (*Create database*).
3. Em *Local do banco de dados*, mantenha o padrão (ex: `southamerica-east1` [São Paulo] ou `us-central1`).
4. **IMPORTANTE (Regras de Segurança):**  
   Na tela de regras, selecione **"Iniciar no modo de teste"** (*Start in test mode*).  
   > *O modo de teste permite leitura e escrita imediatas sem necessidade de autenticação complexa, perfeito para a apresentação.*
5. Clique em **Ativar** (*Enable*).

---

### Passo 3: Obter as Credenciais do Aplicativo Web
1. No topo do menu esquerdo, clique no ícone de **Engrenagem ⚙️ (Configurações do projeto)**.
2. Na aba **Geral**, role até a seção **"Seus aplicativos"** e clique no ícone Web **`</>`**.
3. Dê um apelido ao app (ex: `laser-sigeo-web`) e clique em **"Registrar app"**.
4. Copie o bloco de código que aparece na tela, similar a este:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD-xpto...",
     authDomain: "gestao-laser-sigeo.firebaseapp.com",
     projectId: "gestao-laser-sigeo",
     storageBucket: "gestao-laser-sigeo.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef"
   };
   ```

---

### Passo 4: Conectar no Sistema
1. Abra a aplicação: **[http://localhost:3000](http://localhost:3000)**.
2. Faça login como **Técnico** ou **Coordenador** (clique em *Entrar* no topo e use os botões de 1 clique, ex: *Coordenador Geral*).
3. No menu, acerte na aba **"Painel Coordenação"** e vá na sub-aba **"Banco Online (Firebase)"**.
4. Cole o código copiado no campo **"Opção Rápida: Cole aqui o bloco do Firebase Console"** (o sistema extrai os campos automaticamente!).
5. Clique em **"Testar e Conectar ao Firebase"**.
6. Assim que a conexão for confirmada (cartão verde), clique no botão:  
   👉 **"Sincronizar Todas as Tabelas com o Firebase"**.

---

## 🎬 Roteiro de Demonstração ao Vivo na Apresentação

Para impressionar a banca ou os professores durante os slides da apresentação:

1. Deixe o computador principal (projetor) aberto na aba **"Grade Horária"** ou no **"Painel de Gestão"**.
2. Abra o link no seu celular ou em outra janela anônima do navegador.
3. No celular, clique em **"Solicitar Horário / Espaço"** ou **"Manutenção"** e envie uma solicitação (ex: *Problema no Mouse da Bancada 04*).
4. Mostre que no mesmo segundo a notificação e o protocolo aparecem na tela projetada sem que ninguém tenha recarregado a página!
5. No painel do técnico, clique em **Aprovar** ou **Colocar em Manutenção** e veja o status atualizar instantaneamente em ambos os dispositivos!
