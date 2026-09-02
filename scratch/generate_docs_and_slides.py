import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# -----------------------------------------------------------------------------
# 1. GERAR APRESENTAÇÃO .PPTX (16:9)
# -----------------------------------------------------------------------------
def create_pptx(output_path):
    prs = Presentation()
    # 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Paleta de Cores
    C_NAVY = RGBColor(15, 23, 42)      # Slate 900
    C_BLUE = RGBColor(29, 78, 216)     # Blue 700
    C_EMERALD = RGBColor(5, 150, 105)  # Emerald 600
    C_AMBER = RGBColor(217, 119, 6)    # Amber 600
    C_PURPLE = RGBColor(126, 34, 206)  # Purple 700
    C_GRAY_BG = RGBColor(248, 250, 252)# Slate 50
    C_CARD_BG = RGBColor(255, 255, 255)# White
    C_BORDER = RGBColor(226, 232, 240) # Slate 200
    C_TEXT_DARK = RGBColor(30, 41, 59) # Slate 800
    C_TEXT_MUTED = RGBColor(100, 116, 139) # Slate 500
    C_WHITE = RGBColor(255, 255, 255)

    def add_header(slide, title_text, category_text="SILAB • GESTÃO DOS LABORATÓRIOS LASER & SIGEO"):
        # Top bar line
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = C_BLUE
        top_bar.line.fill.background()

        # Category / Department
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_BLUE

        # Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.8))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.size = Pt(24)
        p_t.font.bold = True
        p_t.font.color.rgb = C_NAVY

    # -------------------------------------------------------------------------
    # SLIDE 1: Capa
    # -------------------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_NAVY
    bg1.line.fill.background()

    # Accent Stripe
    stripe = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.2), Inches(3.8))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = C_BLUE
    stripe.line.fill.background()

    # Title & Subtitle Box
    tbox = s1.shapes.add_textbox(Inches(1.3), Inches(1.6), Inches(11.0), Inches(4.2))
    tf1 = tbox.text_frame
    tf1.word_wrap = True
    
    p1 = tf1.paragraphs[0]
    p1.text = "SILAB"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    p1.space_after = Pt(6)

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Sistema Integrado de Gestão dos Laboratórios LASER & SIGEO"
    p1_sub.font.size = Pt(22)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = RGBColor(96, 165, 250)
    p1_sub.space_after = Pt(14)

    p2 = tf1.add_paragraph()
    p2.text = "Governança de Horários, Equipamentos de Precisão, Suporte Técnico e Softwares"
    p2.font.size = Pt(15)
    p2.font.color.rgb = RGBColor(148, 163, 184)
    p2.space_after = Pt(22)

    p3 = tf1.add_paragraph()
    p3.text = "Departamento de Engenharia de Agrimensura e Cartografia • Sala 1B209 (LASER) | Sala 1B307 (SIGEO) | Sala 1B308 (Técnicos)"
    p3.font.size = Pt(12)
    p3.font.bold = True
    p3.font.color.rgb = RGBColor(147, 197, 253)

    # -------------------------------------------------------------------------
    # SLIDE 2: As Dores e o Cenário Atual
    # -------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "O Cenário Atual: Gargalos no Uso dos Laboratórios")

    # 3 Cards de Problemas
    cards_data = [
        ("📅 Conflitos & Horários Ocultos", "Grade horária impressa e desatualizada. Aulas práticas sobrepostas e falta de previsibilidade para alunos e professores.", C_BLUE),
        ("🛠️ Máquinas Inoperantes sem Registro", "Computadores travando e instrumentos ópticos/GNSS descalibrados sem abertura formal de chamado técnico.", C_AMBER),
        ("💻 Softwares Faltando nas Aulas", "Turmas chegam para a aula prática e os plugins/softwares (QGIS, Metashape) não estão instalados ou ativados.", C_PURPLE)
    ]
    for i, (ctitle, cdesc, ccolor) in enumerate(cards_data):
        left = Inches(0.8 + i * 3.95)
        top = Inches(1.8)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.75), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = C_GRAY_BG
        card.line.color.rgb = C_BORDER
        card.line.width = Pt(1.5)

        tb = s2.shapes.add_textbox(left + Inches(0.25), top + Inches(0.3), Inches(3.25), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = ctitle
        pt.font.size = Pt(17)
        pt.font.bold = True
        pt.font.color.rgb = ccolor
        pt.space_after = Pt(16)

        pd = tf.add_paragraph()
        pd.text = cdesc
        pd.font.size = Pt(13)
        pd.font.color.rgb = C_TEXT_DARK
        pd.line_spacing = 1.3

    # -------------------------------------------------------------------------
    # SLIDE 3: A Solução Proposta
    # -------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "A Solução: Plataforma Centralizada, Aberta e Inteligente")

    sol_cards = [
        ("🌐 Acesso Democrático & Ágil", "Consulta da grade em tempo real sem necessidade de login. Qualquer aluno, docente ou visitante solicita horários ou apoio com 1 clique.", C_BLUE),
        ("🤖 Validação Anti-Choque", "Algoritmo inteligente que impede agendamentos em horários com aulas regulares ou reservas já aprovadas.", C_EMERALD),
        ("🎫 Rastreamento Unificado", "Protocolos transparentes para acompanhar em tempo real:\n• REQ- Reservas de Horários\n• MAN- Manutenções de Máquinas\n• SFT- Instalações de Softwares", C_PURPLE)
    ]
    for i, (ctitle, cdesc, ccolor) in enumerate(sol_cards):
        left = Inches(0.8 + i * 3.95)
        top = Inches(1.8)
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.75), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = C_GRAY_BG
        card.line.color.rgb = C_BORDER
        card.line.width = Pt(1.5)

        tb = s3.shapes.add_textbox(left + Inches(0.25), top + Inches(0.3), Inches(3.25), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = ctitle
        pt.font.size = Pt(17)
        pt.font.bold = True
        pt.font.color.rgb = ccolor
        pt.space_after = Pt(16)

        pd = tf.add_paragraph()
        pd.text = cdesc
        pd.font.size = Pt(13)
        pd.font.color.rgb = C_TEXT_DARK
        pd.line_spacing = 1.3

    # -------------------------------------------------------------------------
    # SLIDE 4: Os Laboratórios Integrados
    # -------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Mapeamento Oficial das Instalações Integradas")

    labs_data = [
        ("📐 LASER (Sala 1B209)", "Laboratório de Sensoriamento Remoto", "• Scanners 3D Laser Terrestres (Leica BLK360 & FARO)\n• Receptores GNSS RTK Trimble R8s\n• Estações Totais Manuais & Robotizadas\n• Drone DJI Matrice 300 com sensor LiDAR\n• 6 Bancadas de processamento em campo", C_BLUE),
        ("🛰️ SIGEO (Sala 1B307)", "Laboratório de SIG e Geoprocessamento", "• 24 Workstations de Alto Desempenho (RTX 4070)\n• Servidor Central de Processamento Metashape\n• Plotter Colorida HP DesignJet T830 (A0)\n• Kits de Estereoscopia 3D com óculos polarizados\n• Aulas práticas de SIG, PDI e Cartografia", C_EMERALD),
        ("🛠️ TÉCNICOS (Sala 1B308)", "Sala de Atendimento Técnico", "• Ponto central de plantão e entrega de instrumentos\n• Triagem e isolamento de máquinas com defeito\n• Homologação e instalação de softwares e licenças\n• Suporte presencial aos alunos e docentes", C_AMBER)
    ]
    for i, (ltitle, lsub, litems, lcolor) in enumerate(labs_data):
        left = Inches(0.8 + i * 3.95)
        top = Inches(1.8)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.75), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = lcolor
        card.line.width = Pt(2.0)

        tb = s4.shapes.add_textbox(left + Inches(0.25), top + Inches(0.25), Inches(3.25), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = ltitle
        pt.font.size = Pt(16)
        pt.font.bold = True
        pt.font.color.rgb = lcolor
        
        ps = tf.add_paragraph()
        ps.text = lsub
        ps.font.size = Pt(11)
        ps.font.bold = True
        ps.font.color.rgb = C_TEXT_MUTED
        ps.space_after = Pt(12)

        pi = tf.add_paragraph()
        pi.text = litems
        pi.font.size = Pt(12)
        pi.font.color.rgb = C_TEXT_DARK
        pi.line_spacing = 1.25

    # -------------------------------------------------------------------------
    # SLIDE 5: Grade Horária & Leitor Inteligente de PDF
    # -------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Grade Semestral Oficial & Leitor Inteligente de PDF")

    # 2 Colunas
    # Coluna 1: Grade Dinâmica
    c1 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = C_GRAY_BG
    c1.line.color.rgb = C_BORDER
    tb1 = s5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "📅 Grade de Horários em Tempo Real"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_BLUE
    p.space_after = Pt(10)
    p2 = tf1.add_paragraph()
    p2.text = "• 12 tempos diários de aula (07:10 até 18:30).\n• Divisão oficial: Aulas da Agrimensura e cursos externos (Florestal e Agronomia destacados).\n• Mini calendário mensal integrado para troca imediata de semanas.\n• Edição in-loco para coordenadores e técnicos sem precisar recarregar o sistema."
    p2.font.size = Pt(13)
    p2.font.color.rgb = C_TEXT_DARK
    p2.line_spacing = 1.3

    # Coluna 2: Leitor PDF
    c2 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = C_GRAY_BG
    c2.line.color.rgb = C_BORDER
    tb2 = s5.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "📄 Leitor Inteligente de Grade PDF"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_PURPLE
    p.space_after = Pt(10)
    p2 = tf2.add_paragraph()
    p2.text = "• Extração automatizada de disciplinas a partir do PDF oficial da coordenação.\n• Classificação heurística de laboratório (SIGEO para matérias SIG/PDI e LASER para Sensoriamento/Modelagem).\n• Importação em lote em poucos segundos com registro em auditoria."
    p2.font.size = Pt(13)
    p2.font.color.rgb = C_TEXT_DARK
    p2.line_spacing = 1.3

    # -------------------------------------------------------------------------
    # SLIDE 6: Gestão de Máquinas em Manutenção
    # -------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Módulo de Manutenção & Averiguação de Máquinas")

    m_data = [
        ("⚠️ Solicitação Aberta (MAN-)", "Qualquer usuário reporta defeitos em computadores ou sensores com níveis de gravidade: Baixa, Média, Alta e Crítica.", C_AMBER),
        ("🔧 Isolamento Técnico", "Técnicos colocam a máquina com status 'Em Manutenção', registrando o motivo, data de entrada e técnico encarregado.", C_BLUE),
        ("✅ Conclusão & Desbloqueio", "Após o conserto ou calibração, o técnico registra o parecer e libera a máquina de volta para a grade com 1 clique.", C_EMERALD)
    ]
    for i, (mtitle, mdesc, mcolor) in enumerate(m_data):
        left = Inches(0.8 + i * 3.95)
        top = Inches(1.8)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.75), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = C_GRAY_BG
        card.line.color.rgb = C_BORDER
        card.line.width = Pt(1.5)

        tb = s6.shapes.add_textbox(left + Inches(0.25), top + Inches(0.3), Inches(3.25), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = mtitle
        pt.font.size = Pt(17)
        pt.font.bold = True
        pt.font.color.rgb = mcolor
        pt.space_after = Pt(16)

        pd = tf.add_paragraph()
        pd.text = mdesc
        pd.font.size = Pt(13)
        pd.font.color.rgb = C_TEXT_DARK
        pd.line_spacing = 1.3

    # -------------------------------------------------------------------------
    # SLIDE 7: Softwares & Gestão de Licenças
    # -------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Módulo de Softwares & Gestão de Licenças")

    s_data = [
        ("💻 Demanda Antecipada (SFT-)", "Alunos e professores solicitam a instalação de novos programas, bibliotecas Python ou plugins (QGIS, Metashape, CloudCompare, Blender).", C_PURPLE),
        ("🔑 Coleta de Chave / Serial", "Campo obrigatório e destacado quando o software requer licença comercial, acadêmica ou convênio para permitir homologação regular.", C_BLUE),
        ("⚡ Deploy Rápido pela TI", "Painel técnico com botão de 'Copiar Chave' com 1 clique para agilizar a instalação em lote nas 24 bancadas do laboratório.", C_EMERALD)
    ]
    for i, (stitle, sdesc, scolor) in enumerate(s_data):
        left = Inches(0.8 + i * 3.95)
        top = Inches(1.8)
        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(3.75), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = C_GRAY_BG
        card.line.color.rgb = C_BORDER
        card.line.width = Pt(1.5)

        tb = s7.shapes.add_textbox(left + Inches(0.25), top + Inches(0.3), Inches(3.25), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = stitle
        pt.font.size = Pt(17)
        pt.font.bold = True
        pt.font.color.rgb = scolor
        pt.space_after = Pt(16)

        pd = tf.add_paragraph()
        pd.text = sdesc
        pd.font.size = Pt(13)
        pd.font.color.rgb = C_TEXT_DARK
        pd.line_spacing = 1.3

    # -------------------------------------------------------------------------
    # SLIDE 8: Governança, Níveis de Acesso & Auditoria
    # -------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Segurança, Controle de Acesso (RBAC) & Auditoria")

    # 2 Colunas
    c1 = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = C_GRAY_BG
    c1.line.color.rgb = C_BORDER
    tb1 = s8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "👥 Perfis de Acesso Bem Definidos"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.space_after = Pt(10)
    p2 = tf1.add_paragraph()
    p2.text = "• Visitante / Aluno: Visualiza grade, inventário e abre chamados.\n• Professor: Solicita apoio para aulas práticas e projetos de pesquisa.\n• Técnico: Aprova/recusa reservas, opera manutenção e instala softwares.\n• Coordenador: Gestão total da grade, aprovação de contas e auditoria.\n• Zero-Trust: Inicia sempre deslogado por padrão de segurança."
    p2.font.size = Pt(12)
    p2.font.color.rgb = C_TEXT_DARK
    p2.line_spacing = 1.25

    c2 = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = C_GRAY_BG
    c2.line.color.rgb = C_BORDER
    tb2 = s8.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "📋 Trilha de Auditoria & Exportação"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_after = Pt(10)
    p2 = tf2.add_paragraph()
    p2.text = "• Registro imutável de todas as aprovações, recusas e alterações de aula.\n• Identificação do responsável, solicitante, data/hora e justificativa.\n• Exportação em 1 clique para planilha CSV formatada para prestação de contas.\n• Estatísticas restritas de ocupação para subsidiar relatórios departamentais."
    p2.font.size = Pt(12)
    p2.font.color.rgb = C_TEXT_DARK
    p2.line_spacing = 1.25

    # -------------------------------------------------------------------------
    # SLIDE 9: Demonstração Prática
    # -------------------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Demonstração Prática do Sistema em Operação")

    steps = [
        ("1. Consulta Pública", "Acesso aos horários e normas sem login no navegador.", C_BLUE),
        ("2. Abertura de Solicitação", "Reserva de laboratório, chamado de manutenção ou software.", C_AMBER),
        ("3. Rastreamento por Protocolo", "Consulta pública da linha do tempo com código REQ-, MAN- ou SFT-.", C_PURPLE),
        ("4. Gestão Técnica na Sala 1B308", "Aprovação, controle de máquinas e homologação no painel.", C_EMERALD)
    ]
    for i, (stitle, sdesc, scolor) in enumerate(steps):
        left = Inches(0.8 + i * 2.95)
        top = Inches(2.0)
        card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(2.75), Inches(4.4))
        card.fill.solid()
        card.fill.fore_color.rgb = C_GRAY_BG
        card.line.color.rgb = scolor
        card.line.width = Pt(1.5)

        tb = s9.shapes.add_textbox(left + Inches(0.2), top + Inches(0.3), Inches(2.35), Inches(3.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = stitle
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = scolor
        pt.space_after = Pt(12)

        pd = tf.add_paragraph()
        pd.text = sdesc
        pd.font.size = Pt(12)
        pd.font.color.rgb = C_TEXT_DARK
        pd.line_spacing = 1.25

    # -------------------------------------------------------------------------
    # SLIDE 10: Conclusão & Encerramento
    # -------------------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    bg10 = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg10.fill.solid()
    bg10.fill.fore_color.rgb = C_NAVY
    bg10.line.fill.background()

    tb10 = s10.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.3), Inches(4.8))
    tf10 = tb10.text_frame
    tf10.word_wrap = True
    
    p = tf10.paragraphs[0]
    p.text = "Resultados & Prontidão Institucional"
    p.font.size = Pt(32)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_after = Pt(20)

    p2 = tf10.add_paragraph()
    p2.text = "✓ Zero conflito de horários nos laboratórios LASER (1B209) e SIGEO (1B307)\n✓ Chamados de manutenção e softwares 100% formalizados e rastreáveis\n✓ Transparência total com trilha de auditoria e relatórios exportáveis\n✓ Código versionado no GitHub e esquema PostgreSQL pronto para deploy em nuvem"
    p2.font.size = Pt(15)
    p2.font.color.rgb = RGBColor(226, 232, 240)
    p2.line_spacing = 1.35
    p2.space_after = Pt(28)

    p3 = tf10.add_paragraph()
    p3.text = "Obrigado! • Repositório: https://github.com/Leonardo-781/Gest-o-dos-Laborat-rios-LASER-SIGEO"
    p3.font.size = Pt(14)
    p3.font.bold = True
    p3.font.color.rgb = RGBColor(96, 165, 250)

    prs.save(output_path)
    print(f"[OK] Apresentação PPTX salva em: {output_path}")


# -----------------------------------------------------------------------------
# 2. GERAR SLIDES EM PDF (Paisagem / 16:9 / Letter Landscape)
# -----------------------------------------------------------------------------
def create_slides_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'SlideTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold',
        spaceAfter=6
    )

    category_style = ParagraphStyle(
        'SlideCategory',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1D4ED8'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'SlideBody',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica'
    )

    card_title_style = ParagraphStyle(
        'CardTitle',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold',
        spaceAfter=6
    )

    story = []

    slides_content = [
        ("Capa", "SILAB • Sistema Integrado de Gestão dos Laboratórios", "Plataforma de Governança dos Laboratórios LASER & SIGEO\n\nDepartamento de Engenharia de Agrimensura e Cartografia\n• LASER: Sala 1B209\n• SIGEO: Sala 1B307\n• Sala dos Técnicos: Sala 1B308"),
        ("Diagnóstico", "O Cenário Atual: Gargalos no Uso dos Laboratórios", "• Conflito de Horários & Aulas Sobrepostas: Grade estática afixada em murais físicos.\n• Máquinas Inoperantes sem Registro: Equipamentos descalibrados ou travando sem abertura formal de chamado.\n• Softwares Faltando nas Aulas: Disciplinas que necessitam de plugins (QGIS, Metashape) sem tempo hábil para instalação."),
        ("Solução", "A Proposta: Plataforma Centralizada, Aberta e Inteligente", "• Acesso Democrático: Consulta da grade em tempo real sem necessidade de login prévio.\n• Validação Anti-Choque: Bloqueio automático de pedidos conflitantes com aulas da grade.\n• Rastreamento Unificado: Códigos públicos REQ- (Horários), MAN- (Manutenções) e SFT- (Softwares)."),
        ("Instalações", "Mapeamento Oficial das Instalações Integradas", "• LASER (Sala 1B209): Scanners 3D Laser (Leica BLK360/FARO), GNSS RTK Trimble, Estações Totais e Drones LiDAR.\n• SIGEO (Sala 1B307): 24 Workstations RTX 4070, Servidor Metashape e Plotter Colorida A0.\n• TÉCNICOS (Sala 1B308): Ponto de plantão técnico, calibração de instrumentos, triagem de chamados e suporte presencial."),
        ("Grade & PDF", "Grade Semestral Oficial & Leitor de Grade PDF", "• 12 tempos de aula diários (07:10 às 18:30) com destaque cromático para cursos externos (Florestal e Agronomia).\n• Mini calendário mensal para navegação rápida entre semanas.\n• Leitor Inteligente de PDF para importação automatizada da grade enviada pela coordenação."),
        ("Manutenção", "Módulo de Manutenção & Averiguação de Máquinas", "• Abertura de Chamados (MAN-): Qualquer usuário reporta defeitos em computadores e sensores com níveis de gravidade (Baixa, Média, Alta, Crítica).\n• Painel de Isolamento: Técnicos retiram equipamentos da grade com motivo e data.\n• Conclusão & Parecer: Retorno ao status 'Disponível' com parecer técnico registrado."),
        ("Softwares", "Módulo de Softwares & Gestão de Licenças", "• Demandas Antecipadas (SFT-): Pedido de novos programas, bibliotecas e plugins para aulas práticas.\n• Chave / Serial Obrigatório: Campo obrigatório para softwares comerciais/institucionais garantindo legalidade.\n• Deploy Rápido: Botão de cópia rápida para facilitar a ativação nas 24 bancadas do laboratório."),
        ("Governança", "Segurança, Controle de Acesso (RBAC) & Auditoria", "• Princípio do Menor Privilégio: Sistema inicia deslogado; alunos/visitantes solicitam e técnicos/coordenadores homologam.\n• Trilha de Auditoria Imutável: Registro detalhado de aprovações, recusas e alterações de grade.\n• Exportação CSV: Relatórios tabulares prontos para prestação de contas departamental."),
        ("Demonstração", "Roteiro de Demonstração Prática ao Vivo", "1. Consulta pública da grade de horários do SIGEO e LASER.\n2. Envio de reserva de horário e chamado de manutenção com protocolos REQ- e MAN-.\n3. Consulta do status pela barra de busca pública.\n4. Login do corpo técnico e aprovação no painel restrito da Sala 1B308."),
        ("Encerramento", "Resultados Obtidos & Conclusão", "✓ Eliminação de conflitos de horários nos laboratórios.\n✓ Formalização de chamados de manutenção e demandas de software.\n✓ Governança e transparência total com auditoria exportável.\n✓ Repositório GitHub: https://github.com/Leonardo-781/Gest-o-dos-Laborat-rios-LASER-SIGEO")
    ]

    for i, (cat, title, content) in enumerate(slides_content):
        story.append(Paragraph(f"SLIDE {i+1} • {cat.upper()} — SILAB • LABORATÓRIOS LASER & SIGEO", category_style))
        story.append(Paragraph(title, title_style))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1D4ED8'), spaceAfter=14))
        
        # Format content
        paragraphs = content.split('\n')
        for p_text in paragraphs:
            if p_text.strip():
                story.append(Paragraph(p_text.replace('\n', '<br/>'), body_style))
                story.append(Spacer(1, 6))
        
        if i < len(slides_content) - 1:
            story.append(PageBreak())

    doc.build(story)
    print(f"[OK] Slides em PDF salvos em: {output_path}")


# -----------------------------------------------------------------------------
# 3. GERAR DOCUMENTAÇÃO COMPLETA DO PROJETO EM PDF (Retrato / A4)
# -----------------------------------------------------------------------------
def create_docs_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    doc_title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )

    doc_sub_style = ParagraphStyle(
        'DocSub',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1D4ED8'),
        fontName='Helvetica-Bold',
        spaceAfter=14
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold',
        spaceBefore=14,
        spaceAfter=6
    )

    p_style = ParagraphStyle(
        'DocP',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        fontName='Helvetica',
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica',
        leftIndent=12,
        spaceAfter=4
    )

    story = []

    # Capa / Cabeçalho
    story.append(Paragraph("SILAB • Sistema Integrado de Gestão dos Laboratórios", doc_title_style))
    story.append(Paragraph("Laboratórios LASER & SIGEO • Departamento de Engenharia de Agrimensura e Cartografia", doc_sub_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1D4ED8'), spaceAfter=12))

    # 1. Resumo Executivo
    story.append(Paragraph("1. Resumo Executivo", h2_style))
    story.append(Paragraph("O <strong>SILAB (Sistema Integrado de Gestão dos Laboratórios)</strong> é uma solução web integrada concebida para centralizar a gestão de horários de aulas práticas, agendamento de espaços, chamados de manutenção de computadores/instrumentos e demandas de instalação de softwares nos laboratórios LASER e SIGEO do Departamento de Engenharia de Agrimensura e Cartografia.", p_style))
    story.append(Paragraph("• <strong>LASER (Sala 1B209):</strong> Laboratório de Sensoriamento Remoto, Scanners 3D Laser Terrestres (Leica/FARO), GNSS RTK Trimble, Estações Totais e Drones com LiDAR.", bullet_style))
    story.append(Paragraph("• <strong>SIGEO (Sala 1B307):</strong> Laboratório de SIG e Geoprocessamento com 24 Workstations de alta performance (RTX 4070), Servidor Metashape e Plotter A0.", bullet_style))
    story.append(Paragraph("• <strong>Sala dos Técnicos (Sala 1B308):</strong> Ponto de atendimento presencial, calibração, homologação de softwares e apoio técnico.", bullet_style))

    # 2. Tabela de Dores vs Soluções
    story.append(Paragraph("2. Comparativo: Desafios Anteriores vs. Soluções Propostas", h2_style))
    
    table_data = [
        [Paragraph("<strong>Desafio Anterior</strong>", p_style), Paragraph("<strong>Solução Proposta pelo Sistema</strong>", p_style)],
        [Paragraph("Conflito de horários e sobreposição de aulas", bullet_style), Paragraph("Grade interativa em tempo real com prevenção ativa anti-choque", bullet_style)],
        [Paragraph("Burocracia e solicitações por corredores", bullet_style), Paragraph("Portal aberto com protocolo rastreável (REQ-) gerado na hora", bullet_style)],
        [Paragraph("Máquinas e sensores quebrados sem registro", bullet_style), Paragraph("Fila de chamados (MAN-) e painel de isolamento/liberação técnica", bullet_style)],
        [Paragraph("Falta de softwares instalados nas aulas", bullet_style), Paragraph("Fila de instalação (SFT-) com coleta obrigatória de chave de licença", bullet_style)],
        [Paragraph("Ausência de métricas e governança", bullet_style), Paragraph("Trilha de auditoria 100% imutável com exportação em CSV", bullet_style)]
    ]

    t = Table(table_data, colWidths=[240, 270])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # 3. Matriz de Permissões
    story.append(Paragraph("3. Matriz de Atores & Níveis de Acesso (RBAC)", h2_style))
    story.append(Paragraph("• <strong>Visitante / Aluno / Docente:</strong> Consulta horários, normas, inventário e abre chamados de reserva (REQ-), manutenção (MAN-) e software (SFT-).", bullet_style))
    story.append(Paragraph("• <strong>Técnico de Laboratório (Sala 1B308):</strong> Analisa e aprova reservas, isola máquinas em manutenção, resolve chamados e homologa softwares.", bullet_style))
    story.append(Paragraph("• <strong>Coordenador de Laboratório:</strong> Gestão total da grade semestral (leitor de PDF), aprovação de contas de gestores e auditoria.", bullet_style))

    # 4. Módulos do Sistema
    story.append(Paragraph("4. Detalhamento dos Módulos Funcionais", h2_style))
    story.append(Paragraph("• <strong>Grade Semestral Oficial:</strong> 12 tempos de aula (07:10 às 18:30) com destaque para cursos externos (Florestal e Agronomia).", bullet_style))
    story.append(Paragraph("• <strong>Chamados de Manutenção de Máquinas:</strong> Registro de sintomas com urgência (Baixa, Média, Alta, Crítica) e emissão de protocolo MAN-2026-XXXX.", bullet_style))
    story.append(Paragraph("• <strong>Instalação de Softwares & Licenças:</strong> Módulo para pedir programas/plugins com inserção de chave de ativação para softwares comerciais/institucionais.", bullet_style))
    story.append(Paragraph("• <strong>Leitor de Grade PDF:</strong> Extração automatizada e vinculação de turmas a partir do PDF da universidade.", bullet_style))
    story.append(Paragraph("• <strong>Auditoria & Exportação CSV:</strong> Histórico de todas as decisões com download de relatório para prestação de contas.", bullet_style))

    # 5. Informações Técnicas & Repositório
    story.append(Paragraph("5. Informações Técnicas & Repositório", h2_style))
    story.append(Paragraph("• <strong>Tecnologias:</strong> React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, PDF.js, Supabase (PostgreSQL).", bullet_style))
    story.append(Paragraph("• <strong>Ambiente Local:</strong> http://localhost:3000", bullet_style))
    story.append(Paragraph("• <strong>Repositório GitHub:</strong> https://github.com/Leonardo-781/Gest-o-dos-Laborat-rios-LASER-SIGEO", bullet_style))

    doc.build(story)
    print(f"[OK] Documentação PDF salva em: {output_path}")


if __name__ == "__main__":
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(docs_dir, exist_ok=True)

    pptx_path = os.path.join(docs_dir, "Apresentacao_Gestao_Laboratorios_LASER_SIGEO.pptx")
    slides_pdf_path = os.path.join(docs_dir, "Apresentacao_Gestao_Laboratorios_LASER_SIGEO.pdf")
    doc_pdf_path = os.path.join(docs_dir, "Documentacao_Completa_Gestao_LASER_SIGEO.pdf")

    create_pptx(pptx_path)
    create_slides_pdf(slides_pdf_path)
    create_docs_pdf(doc_pdf_path)
    print("[CONCLUÍDO] Todos os arquivos PPTX e PDF foram gerados com sucesso!")
