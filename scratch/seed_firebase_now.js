import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Proposta Técnica e Institucional - SILAB UFU</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 15mm 14mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      line-height: 1.45;
      font-size: 9pt;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .inst-header {
      border-bottom: 2px solid #0f2b48;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .inst-titles h1 {
      font-size: 10.5pt;
      font-weight: 800;
      color: #0f2b48;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .inst-titles h2 {
      font-size: 9pt;
      font-weight: 600;
      color: #334155;
      margin: 0 0 2px 0;
      text-transform: uppercase;
    }
    .inst-titles h3 {
      font-size: 8pt;
      font-weight: 500;
      color: #64748b;
      margin: 0;
    }
    .badge-doc {
      background: #0f2b48;
      color: #fff;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 7.5pt;
      font-weight: 700;
      text-align: right;
      line-height: 1.3;
    }
    .doc-title-block {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 5px solid #2563eb;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .doc-title-block h2 {
      margin: 0 0 3px 0;
      color: #0f2b48;
      font-size: 12.5pt;
      font-weight: 800;
    }
    .doc-title-block p {
      margin: 0;
      font-size: 8.5pt;
      color: #475569;
      font-weight: 500;
    }
    .metadata-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 14px;
      font-size: 8pt;
    }
    h3.section-title {
      font-size: 10.5pt;
      color: #0f2b48;
      font-weight: 800;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    h4.subsection-title {
      font-size: 9pt;
      color: #1e40af;
      font-weight: 700;
      margin-top: 8px;
      margin-bottom: 4px;
    }
    p {
      margin: 0 0 6px 0;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 8pt;
    }
    th {
      background: #0f2b48;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 5px 7px;
      border: 1px solid #0f2b48;
      text-transform: uppercase;
      font-size: 7pt;
      letter-spacing: 0.3px;
    }
    td {
      padding: 5px 7px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      line-height: 1.35;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .highlight-card {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      border-radius: 6px;
      padding: 7px 10px;
      margin: 8px 0;
      font-size: 8pt;
      color: #166534;
    }
    .info-card {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      border-radius: 6px;
      padding: 7px 10px;
      margin: 8px 0;
      font-size: 8pt;
      color: #1e40af;
    }
    .lab-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 9px;
      margin-bottom: 6px;
      background: #fafafa;
      font-size: 8pt;
      line-height: 1.35;
    }
    .lab-laser { border-left: 4px solid #2563eb; }
    .lab-sigeo { border-left: 4px solid #16a34a; }
    .lab-tech { border-left: 4px solid #d97706; }
    .signature-container {
      margin-top: 14px;
      page-break-inside: avoid;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      margin-top: 25px;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      border-top: 1.5px solid #334155;
      margin-bottom: 5px;
    }
    .signature-name {
      font-weight: 700;
      font-size: 9pt;
      color: #0f2b48;
    }
    .signature-role {
      font-size: 7.5pt;
      color: #64748b;
      line-height: 1.3;
    }
    .page-break {
      page-break-before: always;
    }
    .avoid-break {
      page-break-inside: avoid;
    }
    ul, ol {
      margin: 3px 0 6px 0;
      padding-left: 16px;
    }
    li {
      margin-bottom: 2.5px;
    }
  </style>
</head>
<body>

  <!-- CABEÇALHO INSTITUCIONAL -->
  <div class="inst-header">
    <div class="inst-titles">
      <h1>Universidade Federal de Uberlândia — UFU</h1>
      <h2>Instituto de Geografia, Geociências e Saúde Coletiva — IGESC</h2>
      <h3>Colegiado do Curso de Engenharia de Agrimensura e Cartografia</h3>
    </div>
    <div class="badge-doc">
      PROPOSTA TÉCNICA<br>Nº 01 / 2026
    </div>
  </div>

  <!-- TÍTULO PRINCIPAL -->
  <div class="doc-title-block">
    <h2>Proposta de Implantação e Homologação do SILAB</h2>
    <p>Sistema Integrado de Gestão dos Laboratórios LASER (1B209) e SIGEO (1B307) • Apoio Técnico (1B308)</p>
  </div>

  <!-- METADADOS -->
  <div class="metadata-grid">
    <div>
      <strong>Proponente:</strong> Leonardo Cardoso<br>
      <strong>Cargo/Função:</strong> Técnico de Laboratório / Responsável Técnico<br>
      <strong>E-mail Institucional:</strong> leonardo.cardoso@ufu.br
    </div>
    <div>
      <strong>Destinatário:</strong> Coordenação e Colegiado de Curso<br>
      <strong>Unidade Acadêmica:</strong> IGESC • Agrimensura e Cartografia<br>
      <strong>Data de Emissão:</strong> 07 de Setembro de 2026
    </div>
  </div>

  <!-- 1. RESUMO EXECUTIVO -->
  <h3 class="section-title">1. Resumo Executivo</h3>
  <p>
    Submete-se à criteriosa apreciação da <strong>Coordenação do Curso de Engenharia de Agrimensura e Cartografia</strong> a proposta formal de homologação e implantação oficial do <strong>SILAB (Sistema Integrado de Gestão dos Laboratórios)</strong> como a plataforma institucional oficial para governança operacional, visualização de horários, reservas de espaços práticos e controle patrimonial dos laboratórios <strong>LASER</strong> (Sala 1B209) e <strong>SIGEO</strong> (Sala 1B307).
  </p>
  <p>
    Desenvolvido para sanar os recorrentes gargalos de comunicação, sobreposição de aulas e falta de histórico de manutenção de equipamentos, o SILAB centraliza 100% das rotinas em um ambiente web ágil, seguro e em conformidade com as diretrizes da UFU. O sistema já foi <strong>plenamente desenvolvido, testado, validado com a grade real do semestre e encontra-se pronto para uso imediato</strong>, com <strong>impacto orçamentário zero</strong> para a universidade.
  </p>

  <!-- 2. DIAGNÓSTICO DO CENÁRIO ATUAL -->
  <h3 class="section-title">2. Diagnóstico do Cenário Atual vs. Cenário com SILAB</h3>
  <p>
    A gestão cotidiana dos laboratórios fundamenta-se atualmente em práticas manuais e descentralizadas que sobrecarregam o corpo técnico e docente:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 24%;">Processo</th>
        <th style="width: 38%;">Cenário Atual (Manual)</th>
        <th style="width: 38%;">Cenário com o SILAB</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Grade de Horários</strong></td>
        <td>Planilhas impressas em murais físicos nas portas das salas, desatualizadas diante de permutas de aulas.</td>
        <td><strong>Grade Digital em Tempo Real:</strong> visualização semanal e diária em página contínua, acessível de celulares e PCs.</td>
      </tr>
      <tr>
        <td><strong>Reserva de Laboratório</strong></td>
        <td>Pedidos informais em corredores ou mensagens de texto sem verificação automática de choque de salas.</td>
        <td><strong>Fluxo Padronizado com Protocolo:</strong> validação matemática antecipada anti-choque e geração de protocolo auditável (<code>REQ-</code>).</td>
      </tr>
      <tr>
        <td><strong>Manutenção de Ativos</strong></td>
        <td>Máquinas inoperantes sem histórico formal; ausência de registro de calibração de instrumentos de campo (Estações, GNSS).</td>
        <td><strong>Fila Técnica de Manutenção:</strong> chamados formais (<code>MAN-</code>), isolamento preventivo no mapa e histórico de calibração.</td>
      </tr>
      <tr>
        <td><strong>Softwares e Licenças</strong></td>
        <td>Docentes solicitam pacotes no dia da aula, causando atrasos no início das atividades nas 24 bancadas.</td>
        <td><strong>Fila Prévia de Homologação:</strong> solicitação antecipada (<code>SFT-</code>) com verificação de licenças e deploy nas máquinas.</td>
      </tr>
      <tr>
        <td><strong>Prestação de Contas</strong></td>
        <td>Dificuldade em mensurar a taxa real de ocupação e horas de uso prático dos laboratórios.</td>
        <td><strong>Auditoria e Métricas Transparentes:</strong> exportação em formato aberto (.CSV) para relatórios do MEC/INEP e do IGESC.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- 3. OBJETIVOS DO PROJETO -->
  <h3 class="section-title">3. Objetivos do Projeto</h3>
  
  <h4 class="subsection-title">3.1. Objetivo Geral</h4>
  <p>
    Modernizar, padronizar e otimizar a governança acadêmica e operacional dos Laboratórios LASER e SIGEO por meio de um sistema web institucional integrado, promovendo transparência, eficiência e zelo pelo patrimônio público.
  </p>

  <h4 class="subsection-title">3.2. Objetivos Específicos</h4>
  <ul>
    <li>Disponibilizar acesso público e transparente à grade horária semestral para todos os discentes e docentes;</li>
    <li>Extinguir conflitos e sobreposições de horários entre graduação, pós-graduação, monitorias e TCCs;</li>
    <li>Formalizar o processo de requisição de espaços e cautela de instrumentos com notificação automática por e-mail;</li>
    <li>Criar histórico contínuo de intervenções técnicas, reparos e calibração de instrumentos de alta precisão;</li>
    <li>Prover à Coordenação de Curso relatórios consolidados e auditáveis para embasamento de decisões administrativas e pedagógicas.</li>
  </ul>

  <!-- 4. ESCOPO DOS LABORATÓRIOS -->
  <h3 class="section-title">4. Escopo dos Laboratórios Atendidos</h3>

  <div class="lab-box lab-laser">
    <strong>📐 LASER — Laboratório de Sensoriamento Remoto (Sala 1B209)</strong><br>
    Espaço voltado a atividades práticas de Topografia, Fotogrametria, Geodésia e Sensoriamento Remoto. Equipamentos contemplados: Laser Scanner Terrestre 3D (Leica BLK360), Estações Totais de precisão (1" e 2"), Pares de Receptores GNSS RTK multi-frequência, Nível Digital de alta precisão e Drones com sensores LiDAR.
  </div>

  <div class="lab-box lab-sigeo">
    <strong>🛰️ SIGEO — Laboratório de SIG e Geoprocessamento (Sala 1B307)</strong><br>
    Laboratório computacional de alta performance voltado a Cartografia Digital, Processamento Digital de Imagens (PDI), Sistemas de Informação Geográfica (SIG) e Topografia Computacional. Contempla 24 Workstations dedicadas com GPUs RTX, Servidor Metashape e Plotter colorida A0.
  </div>

  <div class="lab-box lab-tech">
    <strong>🛠️ Sala de Apoio Técnico dos Laboratórios (Sala 1B308)</strong><br>
    Ponto focal operacional do corpo técnico responsável: atendimento presencial a professores e alunos, guarda e cautela de chaves e acessórios, bancada de diagnósticos e manutenção de equipamentos.
  </div>

  <!-- 5. RECURSOS DO SISTEMA -->
  <h3 class="section-title">5. Recursos e Módulos do Sistema SILAB</h3>

  <div class="info-card">
    <strong>Destaques da Engenharia do Sistema:</strong> Desenvolvido com React, TypeScript, Tailwind CSS e banco de dados na nuvem (Firebase Firestore). Interface responsiva, rápida e totalmente otimizada para desktops, tablets e smartphones.
  </div>

  <ul>
    <li><strong>Grade Semanal Oficial em Página Única:</strong> Todos os 12 horários diários (das 07:10 às 18:30) exibidos de forma contínua e sem barras de rolagem internas, com distinção clara entre turnos e intervalo de almoço;</li>
    <li><strong>Motor Algorítmico Anti-Choque de Horários:</strong> Cruzamento matemático que bloqueia automaticamente requisições que coincidam com disciplinas curriculares já homologadas;</li>
    <li><strong>Notificações Automáticas por E-mail Institucional:</strong> Alertas em tempo real enviados aos solicitantes a cada atualização de status de protocolo (Confirmação, Parecer de Deferimento/Indeferimento e Conclusão);</li>
    <li><strong>Módulo de Manutenção Preventiva e Corretiva:</strong> Classificação por gravidade (Baixa, Média, Alta, Crítica) e opção de bloqueio visual da máquina no mapa do laboratório;</li>
    <li><strong>Governança de Licenças e Softwares:</strong> Campo obrigatório de justificativa pedagógica e serial/chave de ativação para softwares comerciais (ArcGIS, Agisoft Metashape) ou homologação direta de softwares livres (QGIS, CloudCompare);</li>
    <li><strong>Trilha de Auditoria e Exportação CSV:</strong> Registro imutável de todas as ações de aprovação, alteração de grade e cadastros de usuários.</li>
  </ul>

  <div class="page-break"></div>

  <!-- 6. SEGURANÇA E LGPD -->
  <h3 class="section-title">6. Segurança da Informação e Conformidade com a LGPD</h3>
  <p>
    O sistema foi arquitetado com base em princípios modernos de segurança e respeito à Lei Geral de Proteção de Dados (LGPD):
  </p>
  <ul>
    <li><strong>Validação Institucional Estrita:</strong> Exigência de e-mail institucional e checagem rígida contra erros de digitação (ex: bloqueio a vírgulas como <code>ufu,br</code>);</li>
    <li><strong>Criptografia Forte com Salt:</strong> Senhas hasheadas via algoritmo <strong>SHA-256</strong> com salt criptográfico individualizado, garantindo que senhas nunca sejam armazenadas ou trafegadas em texto plano;</li>
    <li><strong>Privacidade de Credenciais:</strong> Telas públicas e de demonstração não exibem contas pré-selecionadas ou botões de acesso automático;</li>
    <li><strong>Acesso Granular (RBAC):</strong> Perfis bem delimitados (Visitante, Aluno, Professor, Técnico e Administrador Master), com painel exclusivo para delegação de permissões pelo responsável técnico.</li>
  </ul>

  <!-- 7. BENEFÍCIOS -->
  <h3 class="section-title">7. Benefícios para a Comunidade Acadêmica</h3>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Público</th>
        <th style="width: 75%;">Benefícios Diretos</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Coordenação & Colegiado</strong></td>
        <td>
          • Visão panorâmica da taxa de ocupação dos laboratórios por semestre;<br>
          • Dados consolidados para subsidiar relatórios de autoavaliação institucional e auditorias do MEC;<br>
          • Redução drástica de atritos e disputas por horários de laboratório.
        </td>
      </tr>
      <tr>
        <td><strong>Corpo Docente</strong></td>
        <td>
          • Garantia de que o espaço físico e os equipamentos estarão reservados e disponíveis para a aula;<br>
          • Certeza de que os softwares necessários foram previamente testados nas 24 estações de trabalho;<br>
          • Canal ágil para solicitação de apoio técnico e instrumentos para aulas de campo.
        </td>
      </tr>
      <tr>
        <td><strong>Discentes (Alunos)</strong></td>
        <td>
          • Transparência para consultar horários livres de estudos pelo celular a qualquer hora;<br>
          • Acesso formal e democrático a computadores e instrumentos para TCCs e pesquisas de Iniciação Científica;<br>
          • Acompanhamento transparente do status do seu pedido via e-mail e protocolo.
        </td>
      </tr>
      <tr>
        <td><strong>Corpo Técnico</strong></td>
        <td>
          • Fim de pedidos informais e interrupções em sala de aula;<br>
          • Registro histórico e rastreável de todas as manutenções e calibrações executadas;<br>
          • Organização profissional dos atendimentos na Sala 1B308.
        </td>
      </tr>
    </tbody>
  </table>

  <!-- 8. PLANO DE IMPLANTAÇÃO -->
  <h3 class="section-title">8. Plano de Implantação e Cronograma Proposto</h3>
  <p>
    Por se tratar de uma solução já finalizada e validada tecnicamente, a implantação é imediata:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 24%;">Etapa</th>
        <th style="width: 56%;">Ações Previstas</th>
        <th style="width: 20%;">Prazo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Fase 1: Homologação</strong></td>
        <td>Apreciação pelo Colegiado de Curso e autorização formal da Coordenação para adoção do SILAB como sistema oficial.</td>
        <td>Semana 1</td>
      </tr>
      <tr>
        <td><strong>Fase 2: Período Piloto</strong></td>
        <td>Apresentação do fluxo aos docentes do semestre corrente e início das solicitações de apoio e manutenções na plataforma.</td>
        <td>15 a 30 dias</td>
      </tr>
      <tr>
        <td><strong>Fase 3: Adoção Integral</strong></td>
        <td>Divulgação aos discentes através dos canais oficiais do curso (e-mail, redes e site) e fixação de QR Code nas portas das salas.</td>
        <td>Definitivo</td>
      </tr>
    </tbody>
  </table>

  <div class="highlight-card">
    <strong>Impacto Orçamentário Zero:</strong> Todo o desenvolvimento foi realizado com tecnologias abertas. A hospedagem e sincronização em nuvem não geram nenhum custo financeiro para o IGESC ou UFU.
  </div>

  <!-- 9. CONSIDERAÇÕES FINAIS E ASSINATURA -->
  <div class="signature-container">
    <h3 class="section-title">9. Considerações Finais e Encaminhamento</h3>
    <p>
      O SILAB posiciona o Curso de Engenharia de Agrimensura e Cartografia da Universidade Federal de Uberlândia na vanguarda da governança digital universitária, transformando a gestão de seus laboratórios em modelo de referência de eficiência, transparência e zelo pelo patrimônio público.
    </p>
    <p>
      Diante do exposto, solicita-se cordialmente a esta Coordenação:
    </p>
    <ol>
      <li>A inclusão desta proposta em pauta para apreciação pelo Colegiado do Curso;</li>
      <li>A homologação do SILAB como sistema oficial dos Laboratórios LASER e SIGEO;</li>
      <li>O apoio institucional na divulgação do link oficial aos docentes e discentes.</li>
    </ol>
    <p>
      Reitero minha total disponibilidade para demonstração presencial da plataforma em reunião de Colegiado.
    </p>

    <div class="info-card" style="margin-top: 20px; font-size: 8.5pt;">
      <strong>Despacho e Parecer da Coordenação do Curso:</strong><br>
      <div style="margin-top: 8px; line-height: 1.8;">
        (&nbsp;&nbsp;&nbsp;) <strong>Aprovado</strong> para inclusão em pauta e apreciação pelo Colegiado de Curso.<br>
        (&nbsp;&nbsp;&nbsp;) <strong>Homologado</strong> para início da Fase Piloto de utilização no semestre letivo corrente.<br>
        Observações da Coordenação: ____________________________________________________________________<br>
        _____________________________________________________________________________________________
      </div>
    </div>

    <div class="signature-grid" style="margin-top: 35px;">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-name">Leonardo Cardoso</div>
        <div class="signature-role">
          Técnico de Laboratório — Responsável Técnico LASER/SIGEO<br>
          Instituto de Geografia, Geociências e Saúde Coletiva — IGESC / UFU<br>
          leonardo.cardoso@ufu.br
        </div>
      </div>

      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-name">Coordenação do Curso</div>
        <div class="signature-role">
          Engenharia de Agrimensura e Cartografia<br>
          Instituto de Geografia, Geociências e Saúde Coletiva — IGESC / UFU<br>
          <em>(Carimbo e Assinatura)</em>
        </div>
      </div>
    </div>

    <div style="margin-top: 45px; border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center; font-size: 7.5pt; color: #64748b;">
      Universidade Federal de Uberlândia — UFU • Instituto de Geografia, Geociências e Saúde Coletiva — IGESC<br>
      Campus Santa Mônica • Bloco 1B • Av. João Naves de Ávila, 2121 • Uberlândia - MG • CEP 38408-100
    </div>
  </div>

</body>
</html>`;

const workspaceDir = 'C:/Users/Leonardo/OneDrive/Documentos/VS Code/Agrimensura';
const artifactsDir = 'C:/Users/Leonardo/.gemini/antigravity/brain/43f5cd44-c7eb-481f-842d-995e1a972285';
const htmlPath = path.join(workspaceDir, 'scratch', 'proposta_silab.html');
const pdfPathWorkspace = path.join(workspaceDir, 'Proposta_Implantacao_SILAB_Coordenacao.pdf');
const pdfPathArtifacts = path.join(artifactsDir, 'Proposta_Implantacao_SILAB_Coordenacao.pdf');
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('✓ HTML gerado em:', htmlPath);

const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPathWorkspace}" "${htmlPath}"`;
console.log('✓ Executando conversão via Microsoft Edge...');
execSync(cmd);

if (fs.existsSync(pdfPathWorkspace)) {
  const stats = fs.statSync(pdfPathWorkspace);
  console.log(`✓ PDF gerado com sucesso no Workspace: ${pdfPathWorkspace} (${stats.size} bytes)`);
  
  // Copia também para a pasta de artefatos
  fs.copyFileSync(pdfPathWorkspace, pdfPathArtifacts);
  console.log(`✓ PDF copiado com sucesso para Artifacts: ${pdfPathArtifacts}`);
} else {
  console.error('ERRO: PDF não foi gerado.');
  process.exit(1);
}

