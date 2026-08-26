# Gestão dos Laboratórios LASER & SIGEO 🏛️

Sistema Integrado de Gestão de Horários, Solicitação de Espaços, Equipamentos de Alta Precisão e Apoio Técnico desenvolvido para o **Departamento de Engenharia de Agrimensura e Cartografia**.

---

## 📍 Laboratórios Integrados

* 📐 **LASER:** **Laboratório de Sensoriamento Remoto** — *Sala 1B209*
* 🛰️ **SIGEO:** **Laboratório de SIG e Geoprocessamento** — *Sala 1B307*
* 🛠️ **Sala dos Técnicos:** Atendimento e Apoio Técnico — *Sala 1B308*

---

## ✨ Funcionalidades

- 📅 **Grade Semestral Oficial:** Visualização interativa e semanal com intervalos de aulas reais do departamento.
- 🗓 **Mini Calendário Mensal:** Navegação ágil por dias, semanas e meses na barra lateral.
- 📝 **Portal de Solicitações:** Formulário aberto a qualquer pessoa com detecção automática de conflitos de horários em tempo real.
- 🛠 **Solicitação de Apoio Técnico:** Opção para solicitar suporte e presença de técnico de laboratório.
- 🔎 **Rastreamento por Protocolo:** Linha do tempo pública para acompanhar o status de aprovação.
- 📄 **Leitor Inteligente de PDF:** Importação e classificação automática de horários de disciplinas a partir de PDFs da coordenação.
- ✏️ **Gestão e Edição de Aulas:** Painel exclusivo para coordenadores e técnicos adicionarem ou modificarem dados das aulas.
- 📋 **Trilha de Auditoria & Governança:** Registro auditável de quem solicitou e de qual gestor aprovou/recusou com exportação em planilha CSV.
- 📊 **Estatísticas Restritas:** Métricas de ocupação e utilização visíveis exclusivamente para gestores.
- ☁️ **Integração com Supabase (PostgreSQL):** Esquema pronto para persistência e sincronização em nuvem.

---

## 🚀 Como Executar Localmente

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Executar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Gerar Versão de Produção:**
   ```bash
   npm run build
   ```

---

## 🛠 Tecnologias Utilizadas

* **React 18** + **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide Icons**
* **PDF.js (`pdfjs-dist`)**
* **Supabase Client**
