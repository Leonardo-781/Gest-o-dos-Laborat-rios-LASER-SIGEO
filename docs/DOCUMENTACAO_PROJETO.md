# 🏛️ SILAB • Sistema Integrado de Gestão dos Laboratórios
## Laboratórios LASER & SIGEO
**Departamento de Engenharia de Agrimensura e Cartografia**

---

## 📌 1. Resumo Executivo

O **SILAB (Sistema Integrado de Gestão dos Laboratórios)** é uma solução web desenvolvida sob medida para o Departamento de Engenharia de Agrimensura e Cartografia para unificar a gestão dos laboratórios **LASER** e **SIGEO**. O objetivo primordial da plataforma é modernizar, centralizar e desburocratizar o controle de uso, horários de aulas, agendamento de espaços práticos, chamados de manutenção de computadores/instrumentos e demandas de instalação de softwares nos laboratórios:

* 📐 **LASER:** *Laboratório de Sensoriamento Remoto* (Sala 1B209) — Especializado em escaneamento a laser 3D terrestre/aéreo, GNSS RTK de alta precisão, estações totais robotizadas e fotogrametria.
* 🛰️ **SIGEO:** *Laboratório de SIG e Geoprocessamento* (Sala 1B307) — Especializado em 24 Workstations de alto desempenho para processamento de nuvens de pontos, SIG (QGIS/ArcGIS), modelagem digital e impressão de cartas em Plotter A0.
* 🛠️ **Sala dos Técnicos:** (Sala 1B308) — Ponto focal de atendimento presencial, calibração, manutenção e entrega de instrumentos.

---

## 🎯 2. O Problema (Cenário Anterior) vs. A Solução (Cenário Proposto)

| Desafio / Cenário Anterior | Solução Proposta pelo Sistema |
| :--- | :--- |
| **Conflito de Horários & Aulas Sobrepostas:** Grade horária afixada em murais físicos ou dispersa em planilhas/PDFs desatualizados. | **Grade Digital Interativa:** Visualização em tempo real dos 12 tempos de aula diários (07:10 às 18:30) com validação automática anti-choque de horários. |
| **Burocracia na Solicitação:** Necessidade de procurar professores ou técnicos nos corredores para pedir reserva de bancada ou scanner. | **Portal Aberto de Solicitações:** Qualquer aluno, docente ou pesquisador solicita espaço/apoio em menos de 1 minuto, gerando protocolo com rastreamento público (`REQ-`). |
| **Máquinas Quebradas sem Registro:** Computadores travando ou instrumentos descalibrados sem histórico formal de quem identificou e quem consertou. | **Módulo de Manutenção & Averiguação:** Fila de chamados (`MAN-`) com urgência e painel exclusivo para o corpo técnico registrar diagnóstico, isolar máquinas e liberá-las após reparo. |
| **Instalação Desorganizada de Softwares:** Aulas práticas interrompidas por falta de plugins ou softwares necessários nas bancadas. | **Fila de Instalação & Licenças (`SFT-`):** Coleta antecipada de requisitos de software com campo obrigatório para seriais/chaves de licença e script de deploy. |
| **Falta de Governança e Métricas:** Ausência de registros auditáveis de quem autorizou acessos ou métricas de ocupação para prestação de contas. | **Auditoria e Estatísticas 100% Transparentes:** Trilha auditável com exportação para planilha (.CSV) e gráficos de utilização restritos à gestão. |

---

## 👥 3. Atores do Sistema & Matriz de Permissões (RBAC)

* **Visitante / Aluno / Público Geral:**
  * Visualiza grade horária semanal e diária.
  * Consulta inventário de equipamentos e normas dos laboratórios.
  * Solicita reserva de horário ou apoio técnico (`REQ-`).
  * Abre chamado de manutenção/defeito de máquina (`MAN-`).
  * Solicita instalação/atualização de software (`SFT-`).
  * Rastreia o andamento de qualquer protocolo publicamente.

* **Professor / Docente:**
  * Mesmas funções do aluno com categorização docente para aulas práticas, reposições e projetos de pesquisa.

* **Técnico de Laboratório (Sala 1B308):**
  * Analisa, aprova ou recusa solicitações de horários e apoio presencial.
  * Gerencia o painel de **Máquinas em Manutenção** (isolar/liberar equipamentos).
  * Atende à fila de averiguação de defeitos e registra diagnósticos técnicos.
  * Homologa instalações de softwares e copia chaves/licenças fornecidas.
  * Adiciona e edita informações das aulas na grade semestral.

* **Coordenador de Laboratório / Curso:**
  * Gestão total da grade semestral (inclusão, edição e leitor de PDF).
  * Aprovação de contas de novos usuários/gestores.
  * Acesso completo à **Trilha de Auditoria** com exportação de relatórios em CSV.
  * Visualização de gráficos estatísticos e métricas de ocupação dos laboratórios.

---

## 🧩 4. Arquitetura Modular da Aplicação

1. **Grade Semestral Oficial:** Baseada nos horários das fotos reais dos laboratórios, com divisão precisa de tempos e suporte a matérias externas com destaque cromático.
2. **Prevenção Ativa de Conflitos:** Algoritmo matemático que cruza horários de início e fim contra aulas cadastradas e reservas prévias antes de submeter qualquer pedido.
3. **Triagem Técnica de Equipamentos:** Controle de ciclo de vida de ativos (*Disponível -> Em Averiguação -> Em Manutenção -> Disponível*).
4. **Governança de Licenciamento de Software:** Diferenciação clara entre softwares livres (Open Source) e softwares comerciais/institucionais com validação de chaves.
5. **Leitor de Grade PDF:** Extração automatizada e vinculação de disciplinas aos respectivos laboratórios.
6. **Persistência Híbrida:** LocalStorage resiliente com esquema completo de banco de dados PostgreSQL / Supabase pronto para implantação em nuvem.

---

## 🚀 5. Como Executar e Apresentar

```bash
# Instalar dependências
npm install

# Iniciar aplicação em modo de desenvolvimento
npm run dev

# Gerar build final de produção
npm run build
```

Link local da aplicação: **`http://localhost:3000`**  
Repositório GitHub: **`https://github.com/Leonardo-781/Gest-o-dos-Laborat-rios-LASER-SIGEO`**
