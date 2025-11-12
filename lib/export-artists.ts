import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ArtistExportData {
  id: string | number;
  name: string;
  genre?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  biography?: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  management_entity?: string;
  management_email?: string;
  ipi?: string;
  image_url?: string;
  social_accounts?: any[];
  distribution_accounts?: any[];
  projects?: any[];
  assets?: any[];
  created_at: string;
}

/**
 * Formatea los datos de artistas para exportación
 */
export function formatArtistsForExport(artists: ArtistExportData[]) {
  return artists.map(artist => ({
    'ID': artist.id,
    'Nombre Artístico': artist.name,
    'Nombre Legal': artist.first_name && artist.last_name ? `${artist.first_name} ${artist.last_name}` : artist.first_name || artist.last_name || 'N/A',
    'Género Musical': artist.genre || 'N/A',
    'Rol': artist.role || 'N/A',
    'Fecha de Nacimiento': artist.date_of_birth ? new Date(artist.date_of_birth).toLocaleDateString('es-ES') : 'N/A',
    'País': artist.country || 'N/A',
    'Ciudad': artist.city || 'N/A',
    'Email': artist.email || 'N/A',
    'Teléfono': artist.phone || 'N/A',
    'Dirección': artist.address || 'N/A',
    'ID/Pasaporte': artist.id_number || 'N/A',
    'PRO': artist.management_entity || 'N/A',
    'Email PRO': artist.management_email || 'N/A',
    'IPI': artist.ipi || 'N/A',
    'Redes Sociales': artist.social_accounts?.length || 0,
    'Cuentas de Distribución': artist.distribution_accounts?.length || 0,
    'Proyectos': artist.projects?.length || 0,
    'Assets': artist.assets?.length || 0,
    'Fecha de Creación': new Date(artist.created_at).toLocaleDateString('es-ES'),
    'Biografía': artist.biography ? artist.biography.substring(0, 150) + '...' : 'N/A'
  }));
}

/**
 * Exporta artistas a formato Excel (.xlsx)
 */
export function exportArtistsToExcel(artists: ArtistExportData[], filename: string = 'artistas') {
  try {
    // Formatear datos
    const formattedData = formatArtistsForExport(artists);

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 10 },  // ID
      { wch: 25 },  // Nombre Artístico
      { wch: 30 },  // Nombre Legal
      { wch: 15 },  // Género Musical
      { wch: 20 },  // Rol
      { wch: 18 },  // Fecha de Nacimiento
      { wch: 15 },  // País
      { wch: 15 },  // Ciudad
      { wch: 28 },  // Email
      { wch: 18 },  // Teléfono
      { wch: 35 },  // Dirección
      { wch: 20 },  // ID/Pasaporte
      { wch: 35 },  // PRO
      { wch: 28 },  // Email PRO
      { wch: 15 },  // IPI
      { wch: 15 },  // Redes Sociales
      { wch: 20 },  // Cuentas de Distribución
      { wch: 12 },  // Proyectos
      { wch: 10 },  // Assets
      { wch: 18 },  // Fecha de Creación
      { wch: 50 }   // Biografía
    ];
    ws['!cols'] = columnWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Artistas');

    // Generar archivo
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Exporta artistas a formato PDF con todos los datos en tabla
 */
export function exportArtistsToPDF(artists: ArtistExportData[], filename: string = 'artistas') {
  try {
    // Crear documento PDF en formato A3 landscape para más espacio
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3' // Cambiado a A3 para acomodar más columnas
    });

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte Completo de Artistas', 14, 15);

    // Información del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 22);
    doc.text(`Total de artistas: ${artists.length}`, 14, 27);

    // Preparar datos para la tabla con TODOS los campos
    const tableData = artists.map(artist => [
      artist.name,
      artist.first_name && artist.last_name ? `${artist.first_name} ${artist.last_name}` : artist.first_name || artist.last_name || 'N/A',
      artist.genre || 'N/A',
      artist.role || 'N/A',
      artist.date_of_birth ? new Date(artist.date_of_birth).toLocaleDateString('es-ES') : 'N/A',
      artist.country || 'N/A',
      artist.city || 'N/A',
      artist.email || 'N/A',
      artist.phone || 'N/A',
      artist.address || 'N/A',
      artist.id_number || 'N/A',
      artist.management_entity || 'N/A',
      artist.management_email || 'N/A',
      artist.ipi || 'N/A',
      artist.social_accounts?.length || 0,
      artist.distribution_accounts?.length || 0,
      artist.projects?.length || 0,
      artist.assets?.length || 0,
      new Date(artist.created_at).toLocaleDateString('es-ES')
    ]);

    // Generar tabla con todas las columnas
    autoTable(doc, {
      head: [[
        'Nombre\nArtístico',
        'Nombre\nLegal',
        'Género',
        'Rol',
        'Fecha\nNac.',
        'País',
        'Ciudad',
        'Email',
        'Teléfono',
        'Dirección',
        'ID/\nPasaporte',
        'PRO',
        'Email\nPRO',
        'IPI',
        'Redes',
        'Distrib.',
        'Proy.',
        'Assets',
        'Creado'
      ]],
      body: tableData,
      startY: 32,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [71, 85, 105], // slate-600
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7,
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      columnStyles: {
        0: { cellWidth: 25 },   // Nombre Artístico
        1: { cellWidth: 25 },   // Nombre Legal
        2: { cellWidth: 18 },   // Género
        3: { cellWidth: 20 },   // Rol
        4: { cellWidth: 18 },   // Fecha Nac.
        5: { cellWidth: 18 },   // País
        6: { cellWidth: 18 },   // Ciudad
        7: { cellWidth: 30 },   // Email
        8: { cellWidth: 22 },   // Teléfono
        9: { cellWidth: 35 },   // Dirección
        10: { cellWidth: 20 },  // ID/Pasaporte
        11: { cellWidth: 35 },  // PRO
        12: { cellWidth: 30 },  // Email PRO
        13: { cellWidth: 18 },  // IPI
        14: { cellWidth: 12, halign: 'center' },  // Redes
        15: { cellWidth: 12, halign: 'center' },  // Distrib.
        16: { cellWidth: 12, halign: 'center' },  // Proy.
        17: { cellWidth: 12, halign: 'center' },  // Assets
        18: { cellWidth: 18 }   // Creado
      },
      margin: { top: 32, left: 10, right: 10 }
    });

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Guardar archivo
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`${filename}_${timestamp}.pdf`);

    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Exporta detalles completos de artistas a PDF (versión detallada)
 */
export function exportArtistsDetailedPDF(artists: ArtistExportData[], filename: string = 'artistas_detallado') {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let currentY = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const lineHeight = 7;

    artists.forEach((artist, index) => {
      // Nueva página si es necesario
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Título del artista
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(artist.name, margin, currentY);
      currentY += lineHeight;

      // Información básica
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const info = [
        `Nombre Legal: ${artist.first_name && artist.last_name ? `${artist.first_name} ${artist.last_name}` : artist.first_name || artist.last_name || 'N/A'}`,
        `Género Musical: ${artist.genre || 'N/A'}`,
        `Rol: ${artist.role || 'N/A'}`,
        `Fecha de Nacimiento: ${artist.date_of_birth ? new Date(artist.date_of_birth).toLocaleDateString('es-ES') : 'N/A'}`,
        `País: ${artist.country || 'N/A'}`,
        `Ciudad: ${artist.city || 'N/A'}`,
        `Email: ${artist.email || 'N/A'}`,
        `Teléfono: ${artist.phone || 'N/A'}`,
        `Dirección: ${artist.address || 'N/A'}`,
        `ID/Pasaporte: ${artist.id_number || 'N/A'}`,
        `PRO: ${artist.management_entity || 'N/A'}`,
        `Email PRO: ${artist.management_email || 'N/A'}`,
        `IPI: ${artist.ipi || 'N/A'}`,
        `Redes Sociales: ${artist.social_accounts?.length || 0}`,
        `Cuentas de Distribución: ${artist.distribution_accounts?.length || 0}`,
        `Proyectos: ${artist.projects?.length || 0}`,
        `Assets: ${artist.assets?.length || 0}`,
        `Fecha de Creación: ${new Date(artist.created_at).toLocaleDateString('es-ES')}`
      ];

      info.forEach(line => {
        doc.text(line, margin, currentY);
        currentY += lineHeight - 1;
      });

      // Biografía
      if (artist.biography) {
        currentY += 2;
        doc.setFont('helvetica', 'bold');
        doc.text('Biografía:', margin, currentY);
        currentY += lineHeight - 1;
        
        doc.setFont('helvetica', 'normal');
        const bioLines = doc.splitTextToSize(artist.biography, 180);
        bioLines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, margin, currentY);
          currentY += lineHeight - 1;
        });
      }

      // Separador
      if (index < artists.length - 1) {
        currentY += 5;
        doc.setDrawColor(200);
        doc.line(margin, currentY, doc.internal.pageSize.getWidth() - margin, currentY);
        currentY += 10;
      }
    });

    // Guardar archivo
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`${filename}_${timestamp}.pdf`);

    return true;
  } catch (error) {
    console.error('Error exporting detailed PDF:', error);
    throw error;
  }
}
