/**
 * SILAB - Serviço de Notificações por E-mail Institucional
 * Dispara e-mails formatados e gerencia a caixa de saída em tempo real
 */

import { EmailNotification, Reservation, MaintenanceRequest, SoftwareRequest } from '../types';
import { syncDocToFirestore, getFirestoreDB } from './firebaseClient';

const STORAGE_EMAILS_KEY = 'silab_sent_emails_v3';

export function getStoredEmails(): EmailNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredEmails(emails: EmailNotification[]) {
  localStorage.setItem(STORAGE_EMAILS_KEY, JSON.stringify(emails));
}

/**
 * Cria o cabeçalho e rodapé oficial institucional do e-mail SILAB / UFU
 */
function buildHtmlEmailTemplate(title: string, recipientName: string, bodyContent: string, actionButton?: { text: string; url: string }): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f1f5f9; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 32px 28px; }
    .salutation { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .text-body { font-size: 14px; line-height: 1.6; color: #334155; }
    .info-card { background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 8px; font-size: 13px; line-height: 1.5; }
    .info-card strong { color: #0f172a; }
    .badge-status { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
    .status-aprovada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .status-recusada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .status-pendente { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; margin: 16px 0; text-align: center; }
    .footer { background: #f8fafc; padding: 20px 24px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: center; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ SILAB • GESTÃO DOS LABORATÓRIOS</h1>
      <p>LASER (Sala 1B309) • SIGEO (Sala 1B307) • Técnicos (Sala 1B308)</p>
    </div>
    <div class="content">
      <div class="salutation">Olá, ${recipientName}!</div>
      <div class="text-body">${bodyContent}</div>
      ${actionButton ? `<div style="text-align: center;"><a href="${actionButton.url}" class="button">${actionButton.text}</a></div>` : ''}
    </div>
    <div class="footer">
      <p><strong>Universidade Federal de Uberlândia (UFU)</strong> • Engenharia de Agrimensura e Cartografia</p>
      <p>Este é um e-mail oficial e automatizado emitido pelo SILAB. Não responda diretamente a esta mensagem.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispara e armazena uma notificação de e-mail no sistema e no Firestore
 */
export async function dispatchEmail(email: Omit<EmailNotification, 'id' | 'sentAt' | 'read'>): Promise<EmailNotification> {
  const newEmail: EmailNotification = {
    ...email,
    id: `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sentAt: new Date().toISOString(),
    read: false
  };

  // Salva no LocalStorage
  const list = getStoredEmails();
  const updated = [newEmail, ...list];
  saveStoredEmails(updated);

  // Sincroniza com o Firestore
  try {
    syncDocToFirestore('emails_enviados', newEmail);
  } catch (err) {
    console.warn('Não foi possível gravar e-mail no Firestore:', err);
  }

  return newEmail;
}

/**
 * 1. E-mail de Alerta de Novo Acesso / Login
 */
export async function sendLoginAlertEmail(user: { name: string; email: string; role: string }): Promise<EmailNotification> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');

  const body = `
    <p>Detectamos um <strong>novo acesso realizado com sucesso</strong> na sua conta do <strong>SILAB</strong>.</p>
    <div class="info-card">
      <p><strong>Usuário:</strong> ${user.name}</p>
      <p><strong>E-mail:</strong> ${user.email}</p>
      <p><strong>Perfil de Acesso:</strong> ${user.role.toUpperCase()}</p>
      <p><strong>Data e Horário:</strong> ${dateStr} às ${timeStr}</p>
      <p><strong>IP / Origem:</strong> Sessão local autenticada no navegador</p>
    </div>
    <p>Se você reconhece este login, nenhuma ação adicional é necessária. Caso não tenha sido você, contate imediatamente o Administrador Master ou a Sala dos Técnicos (Sala 1B308).</p>
  `;

  const html = buildHtmlEmailTemplate(
    'Alerta de Segurança: Novo Login Detectado',
    user.name,
    body
  );

  return dispatchEmail({
    to: user.email,
    recipientName: user.name,
    subject: `[SILAB] Alerta de Segurança: Novo acesso detectado (${dateStr} às ${timeStr})`,
    preview: `Novo login realizado em ${dateStr} às ${timeStr} no SILAB.`,
    htmlBody: html,
    category: 'login'
  });
}

/**
 * 2. E-mail de Confirmação de Solicitação de Horário Recebida
 */
export async function sendReservationCreatedEmail(reservation: Reservation): Promise<EmailNotification> {
  const labName = reservation.labId === 'laser' ? 'LASER (Sala 1B309)' : 'SIGEO (Sala 1B307)';
  const formattedDate = new Date(reservation.date + 'T00:00:00').toLocaleDateString('pt-BR');

  const body = `
    <p>Sua solicitação de uso do laboratório foi <strong>registrada com sucesso</strong> no sistema e já foi encaminhada para a análise da equipe técnica da Sala 1B308.</p>
    <div class="info-card">
      <div class="badge-status status-pendente">Aguardando Avaliação Técnica</div>
      <p><strong>Protocolo Oficial:</strong> ${reservation.protocol}</p>
      <p><strong>Laboratório Solicitado:</strong> ${labName}</p>
      <p><strong>Data da Atividade:</strong> ${formattedDate}</p>
      <p><strong>Horário Solicitado:</strong> ${reservation.startTime} às ${reservation.endTime}</p>
      <p><strong>Título da Atividade:</strong> ${reservation.title}</p>
      <p><strong>Finalidade:</strong> ${reservation.purposeType.replace('_', ' ').toUpperCase()}</p>
      ${reservation.userTeacher ? `<p><strong>Professor em Uso (Público):</strong> ${reservation.userTeacher}</p>` : ''}
      ${(reservation.responsibleTeacher || reservation.supervisorName) ? `<p><strong>Professor Responsável (Interno):</strong> ${reservation.responsibleTeacher || reservation.supervisorName}</p>` : ''}
      ${reservation.applicantPhone ? `<p><strong>Telefone para Contato:</strong> ${reservation.applicantPhone}</p>` : ''}
    </div>
    <p>Você receberá um novo e-mail assim que o coordenador ou a equipe técnica emitir o parecer formal de aprovação.</p>
  `;

  const html = buildHtmlEmailTemplate(
    `Solicitação Recebida - Protocolo ${reservation.protocol}`,
    reservation.applicantName,
    body,
    {
      text: 'Acompanhar Status da Solicitação',
      url: `http://localhost:3000/?protocol=${reservation.protocol}`
    }
  );

  return dispatchEmail({
    to: reservation.applicantEmail,
    recipientName: reservation.applicantName,
    subject: `[SILAB] Confirmação de Solicitação de Horário • Protocolo ${reservation.protocol}`,
    preview: `Sua solicitação para ${formattedDate} (${labName}) foi registrada com o protocolo ${reservation.protocol}.`,
    htmlBody: html,
    category: 'solicitacao_criada',
    protocol: reservation.protocol
  });
}

/**
 * 3. E-mail de Atualização / Parecer da Solicitação (Aprovada ou Recusada)
 */
export async function sendReservationReviewedEmail(
  reservation: Reservation,
  reviewerName: string
): Promise<EmailNotification> {
  const isApproved = reservation.status === 'aprovada';
  const labName = reservation.labId === 'laser' ? 'LASER (Sala 1B309)' : 'SIGEO (Sala 1B307)';
  const formattedDate = new Date(reservation.date + 'T00:00:00').toLocaleDateString('pt-BR');

  let statusHtml = isApproved 
    ? '<div class="badge-status status-aprovada">✓ SOLICITAÇÃO APROVADA</div>'
    : '<div class="badge-status status-recusada">✕ SOLICITAÇÃO RECUSADA</div>';

  let instructions = isApproved ? `
    <p style="color: #15803d; font-weight: 700;">Instruções para acesso ao laboratório:</p>
    <ul>
      <li>Retire a chave do laboratório na <strong>Sala dos Técnicos (Sala 1B308)</strong> apresentando seu documento com foto e o protocolo <strong>${reservation.protocol}</strong>.</li>
      <li>Verifique o termo de cautela caso haja uso de instrumentos de precisão (Laser Scanner, RTK, Estações Totais).</li>
      <li>Ao encerrar a atividade, certifique-se de desligar os equipamentos e devolver as chaves na Sala 1B308.</li>
    </ul>
  ` : `
    <p style="color: #b91c1c; font-weight: 700;">Motivo da Não Aprovação:</p>
    <p>${reservation.rejectionReason || 'Conflito de agenda ou indisponibilidade de bancadas/instrumentos no período solicitado.'}</p>
    <p>Caso necessário, consulte a grade no SILAB e submeta uma nova solicitação para um horário livre.</p>
  `;

  const body = `
    <p>Houve uma <strong>atualização formal</strong> na sua solicitação de horário pelo corpo técnico/gestor do SILAB.</p>
    <div class="info-card">
      ${statusHtml}
      <p><strong>Protocolo:</strong> ${reservation.protocol}</p>
      <p><strong>Laboratório:</strong> ${labName}</p>
      <p><strong>Data Agendada:</strong> ${formattedDate} (${reservation.startTime} às ${reservation.endTime})</p>
      <p><strong>Avaliador Responsável:</strong> ${reviewerName}</p>
      ${reservation.adminNotes ? `<p><strong>Parecer Técnico:</strong> ${reservation.adminNotes}</p>` : ''}
    </div>
    ${instructions}
  `;

  const html = buildHtmlEmailTemplate(
    `Decisão da Solicitação - Protocolo ${reservation.protocol}`,
    reservation.applicantName,
    body,
    {
      text: 'Ver Protocolo no SILAB',
      url: `http://localhost:3000/?protocol=${reservation.protocol}`
    }
  );

  return dispatchEmail({
    to: reservation.applicantEmail,
    recipientName: reservation.applicantName,
    subject: `[SILAB] ${isApproved ? 'APROVADA' : 'RECUSADA'} - Solicitação ${reservation.protocol} (${labName})`,
    preview: `Sua solicitação ${reservation.protocol} para ${formattedDate} foi ${isApproved ? 'APROVADA' : 'RECUSADA'} por ${reviewerName}.`,
    htmlBody: html,
    category: 'solicitacao_atualizada',
    protocol: reservation.protocol
  });
}

/**
 * 4. E-mail de Chamado de Manutenção
 */
export async function sendMaintenanceEmail(req: MaintenanceRequest, isResolved = false): Promise<EmailNotification> {
  const labName = req.labId === 'laser' ? 'LASER (Sala 1B309)' : 'SIGEO (Sala 1B307)';

  const body = `
    <p>Seu chamado de manutenção de equipamento foi ${isResolved ? '<strong>concluído com sucesso</strong>' : '<strong>aberto e atribuído à equipe técnica</strong>'}.</p>
    <div class="info-card">
      <p><strong>Protocolo:</strong> ${req.protocol}</p>
      <p><strong>Equipamento:</strong> ${req.equipmentName}</p>
      <p><strong>Laboratório:</strong> ${labName}</p>
      <p><strong>Urgência:</strong> ${req.urgency.toUpperCase()}</p>
      <p><strong>Status:</strong> ${req.status.replace('_', ' ').toUpperCase()}</p>
      ${req.assignedTechnician ? `<p><strong>Técnico Encarregado:</strong> ${req.assignedTechnician} (Sala 1B308)</p>` : ''}
      ${req.technicianNotes ? `<p><strong>Parecer Técnico:</strong> ${req.technicianNotes}</p>` : ''}
    </div>
  `;

  const html = buildHtmlEmailTemplate(
    `Manutenção - Protocolo ${req.protocol}`,
    req.applicantName,
    body
  );

  return dispatchEmail({
    to: req.applicantEmail,
    recipientName: req.applicantName,
    subject: `[SILAB] Chamado de Manutenção ${req.protocol} • ${isResolved ? 'CONCLUÍDO' : 'EM ANDAMENTO'}`,
    preview: `Chamado de manutenção do ${req.equipmentName} (${req.protocol}) atualizado para ${req.status}.`,
    htmlBody: html,
    category: 'manutencao',
    protocol: req.protocol
  });
}

/**
 * 5. E-mail de Demanda de Software
 */
export async function sendSoftwareEmail(req: SoftwareRequest, isInstalled = false): Promise<EmailNotification> {
  const body = `
    <p>Sua demanda de software e plugins foi ${isInstalled ? '<strong>homologada e instalada nas máquinas</strong>' : '<strong>recebida pela TI e técnicos</strong>'}.</p>
    <div class="info-card">
      <p><strong>Protocolo:</strong> ${req.protocol}</p>
      <p><strong>Software:</strong> ${req.softwareName} (${req.softwareVersion || 'Versão Padrão'})</p>
      <p><strong>Escopo:</strong> ${req.targetScope.replace('_', ' ').toUpperCase()}</p>
      <p><strong>Status:</strong> ${req.status.replace('_', ' ').toUpperCase()}</p>
      ${req.technicianNotes ? `<p><strong>Parecer Técnico:</strong> ${req.technicianNotes}</p>` : ''}
    </div>
  `;

  const html = buildHtmlEmailTemplate(
    `Demanda de Software - Protocolo ${req.protocol}`,
    req.applicantName,
    body
  );

  return dispatchEmail({
    to: req.applicantEmail,
    recipientName: req.applicantName,
    subject: `[SILAB] Demanda de Software ${req.protocol} • ${isInstalled ? 'INSTALADO' : 'RECEBIDO'}`,
    preview: `Demanda de software ${req.softwareName} (${req.protocol}) atualizada.`,
    htmlBody: html,
    category: 'software',
    protocol: req.protocol
  });
}
