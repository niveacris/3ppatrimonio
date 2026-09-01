import { jsPDF } from 'jspdf';
import { EBOOK_META, EBOOK_CHAPTERS } from '../data/ebookContent';

export function generateEbookPdf(readerName?: string, readerEmail?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Color Palette
  const darkNavy = [11, 20, 38]; // #0b1426
  const goldAmber = [217, 119, 6]; // #d97706
  const softSlate = [100, 116, 139]; // #64748b
  const darkText = [30, 41, 59]; // #1e293b
  const lightBg = [248, 250, 252]; // #f8fafc

  let currentPage = 1;

  // Helper: Draw Header & Footer on Content Pages
  const addHeaderAndFooter = (chapterTitle?: string) => {
    // Header
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(0, 0, pageWidth, 16, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(goldAmber[0], goldAmber[1], goldAmber[2]);
    doc.text('3P PATRIMÔNIO', margin, 11);

    if (chapterTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(softSlate[0], softSlate[1], softSlate[2]);
      const truncChapter = chapterTitle.length > 40 ? chapterTitle.substring(0, 37) + '...' : chapterTitle;
      doc.text(truncChapter, pageWidth - margin, 11, { align: 'right' });
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 15, pageWidth - margin, 15);

    // Footer
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(softSlate[0], softSlate[1], softSlate[2]);
    doc.text('Como Construir Patrimônio Utilizando Consórcios • Carlos Yoshimori', margin, pageHeight - 9);
    doc.text(`Página ${currentPage}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative Accent bar
  doc.setFillColor(goldAmber[0], goldAmber[1], goldAmber[2]);
  doc.rect(margin, 35, 6, 60, 'F');

  // Author on top
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(EBOOK_META.author.toUpperCase(), margin + 14, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text('3P Patrimônio Consultoria', margin + 14, 52);

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  
  const titleLines = doc.splitTextToSize("COMO CONSTRUIR\nPATRIMÔNIO\nUTILIZANDO\nCONSÓRCIOS", contentWidth - 20);
  doc.text(titleLines, margin, 120);

  // Subtitle / Box
  doc.setFillColor(20, 32, 58);
  doc.roundedRect(margin, 195, contentWidth, 38, 3, 3, 'F');
  doc.setDrawColor(goldAmber[0], goldAmber[1], goldAmber[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, 195, contentWidth, 38, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(goldAmber[0], goldAmber[1], goldAmber[2]);
  doc.text('ESTRATÉGIA & PLANEJAMENTO', margin + 8, 206);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240);
  const subLines = doc.splitTextToSize("Descubra como investidores utilizam planejamento e estratégia para acelerar a formação de patrimônio sem juros abusivos.", contentWidth - 16);
  doc.text(subLines, margin + 8, 215);

  // Exclusivity / Reader info
  if (readerName) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Exemplar digital gerado exclusivamente para: ${readerName}`, margin, pageHeight - 22);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('www.3ppatrimonio.com.br • Edição 2026', margin, pageHeight - 15);

  // ==========================================
  // PAGE 2: COPYRIGHT & TABLE OF CONTENTS (SUMÁRIO)
  // ==========================================
  doc.addPage();
  currentPage++;
  addHeaderAndFooter('Sumário');

  let y = 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('SUMÁRIO', margin, y);
  y += 10;

  doc.setDrawColor(goldAmber[0], goldAmber[1], goldAmber[2]);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + 30, y);
  y += 10;

  EBOOK_CHAPTERS.forEach((chap, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);

    const prefix = chap.number ? `${chap.number}: ` : '';
    const itemTitle = `${prefix}${chap.title}`;
    const dots = ' .....................................................................................................';
    
    doc.text(itemTitle, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(softSlate[0], softSlate[1], softSlate[2]);
    doc.text(dots.substring(0, 50 - itemTitle.length / 2), margin + 80, y);
    doc.text(`Cap. ${idx + 1}`, pageWidth - margin, y, { align: 'right' });

    y += 7;
  });

  y += 12;
  // Copyright Notice Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(EBOOK_META.copyright, margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(softSlate[0], softSlate[1], softSlate[2]);
  const legalText = "Nenhuma parte deste livro pode ser reproduzida de qualquer forma ou por qualquer meio eletrônico ou mecânico, incluindo sistemas de armazenamento e recuperação de informações, sem a permissão por escrito do autor, exceto para o uso de breves citações em uma resenha do livro.";
  const legalLines = doc.splitTextToSize(legalText, contentWidth - 12);
  doc.text(legalLines, margin + 6, y + 15);

  // ==========================================
  // CHAPTERS RENDERING
  // ==========================================
  EBOOK_CHAPTERS.forEach((chapter) => {
    doc.addPage();
    currentPage++;
    addHeaderAndFooter(chapter.title);

    let cy = 28;

    // Chapter Number badge if any
    if (chapter.number) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(goldAmber[0], goldAmber[1], goldAmber[2]);
      doc.text(chapter.number.toUpperCase(), margin, cy);
      cy += 6;
    }

    // Chapter Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    const chTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
    doc.text(chTitleLines, margin, cy);
    cy += chTitleLines.length * 7 + 3;

    // Subtitle if any
    if (chapter.subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(softSlate[0], softSlate[1], softSlate[2]);
      const subLines = doc.splitTextToSize(chapter.subtitle, contentWidth);
      doc.text(subLines, margin, cy);
      cy += subLines.length * 5 + 4;
    }

    // Divider line
    doc.setDrawColor(goldAmber[0], goldAmber[1], goldAmber[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, cy, margin + 25, cy);
    cy += 8;

    // Sections
    chapter.sections.forEach((sec) => {
      // Check page overflow
      if (cy > pageHeight - 35) {
        doc.addPage();
        currentPage++;
        addHeaderAndFooter(chapter.title);
        cy = 26;
      }

      // Heading
      if (sec.heading) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
        const hLines = doc.splitTextToSize(sec.heading, contentWidth);
        doc.text(hLines, margin, cy);
        cy += hLines.length * 5 + 2;
      }

      // Subheading (e.g. Falso / Verdade)
      if (sec.subheading) {
        const isTrue = sec.subheading.toLowerCase().includes('verdade');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        if (isTrue) {
          doc.setTextColor(16, 185, 129); // emerald
        } else {
          doc.setTextColor(225, 29, 72); // rose
        }
        doc.text(sec.subheading, margin, cy);
        cy += 5;
      }

      // Section Content
      if (sec.type === 'callout') {
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.roundedRect(margin, cy, contentWidth, 22, 2, 2, 'F');
        doc.setDrawColor(goldAmber[0], goldAmber[1], goldAmber[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cy, contentWidth, 22, 2, 2, 'S');

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        const text = typeof sec.content === 'string' ? sec.content : sec.content.join(' ');
        const lines = doc.splitTextToSize(text, contentWidth - 10);
        doc.text(lines, margin + 5, cy + 7);
        cy += 28;
      } else if (sec.type === 'points') {
        doc.setFillColor(241, 245, 249);
        const pts = Array.isArray(sec.content) ? sec.content : [sec.content];
        const allText = pts.join('\n\n');
        const lines = doc.splitTextToSize(allText, contentWidth - 12);
        const boxHeight = lines.length * 4.8 + 12;

        if (cy + boxHeight > pageHeight - 25) {
          doc.addPage();
          currentPage++;
          addHeaderAndFooter(chapter.title);
          cy = 26;
        }

        doc.roundedRect(margin, cy, contentWidth, boxHeight, 2, 2, 'F');
        doc.setDrawColor(goldAmber[0], goldAmber[1], goldAmber[2]);
        doc.setLineWidth(0.6);
        doc.roundedRect(margin, cy, contentWidth, boxHeight, 2, 2, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
        doc.text(lines, margin + 6, cy + 7);
        cy += boxHeight + 6;
      } else if (sec.type === 'list' || Array.isArray(sec.content)) {
        const items = Array.isArray(sec.content) ? sec.content : [sec.content];
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);

        items.forEach((item) => {
          if (cy > pageHeight - 25) {
            doc.addPage();
            currentPage++;
            addHeaderAndFooter(chapter.title);
            cy = 26;
          }
          const itemLines = doc.splitTextToSize(item, contentWidth - 4);
          doc.text(itemLines, margin + 2, cy);
          cy += itemLines.length * 4.8 + 3;
        });
        cy += 2;
      } else {
        // Normal paragraph or QA
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        const pLines = doc.splitTextToSize(sec.content, contentWidth);

        if (cy + pLines.length * 4.8 > pageHeight - 25) {
          doc.addPage();
          currentPage++;
          addHeaderAndFooter(chapter.title);
          cy = 26;
        }

        doc.text(pLines, margin, cy);
        cy += pLines.length * 4.8 + 4;
      }
    });
  });

  // Save / Trigger Download
  const filename = 'Ebook_3P_Patrimonio_Como_Construir_Patrimonio_Utilizando_Consorcios.pdf';
  doc.save(filename);
}
