'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { modernContractTemplate, simpleContractTemplate } from '@/lib/contract-templates';

export default function GenerateContractPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [contract, setContract] = useState<any>(null);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      async function getContract() {
        const res = await fetch(`/api/contracts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setContract(data);
        }
      }
      getContract();
    }
  }, [id]);

  useEffect(() => {
    if (contract) {
      console.log('Contract data:', contract);
      console.log('Template:', contract.template);
      
      if (!contract.template) {
        console.error('No template associated with this contract');
        setGeneratedHtml('<div style="padding: 20px;"><h2>Error: No Template</h2><p>This contract does not have a template associated. Please assign a template first.</p></div>');
        return;
      }
      
      // Intentar obtener HTML de la base de datos primero
      let html = contract.template.template_html || contract.template.auco_template_id || '';
      
      // Si no hay HTML en la BD, usar plantillas del sistema
      if (!html) {
        console.log('No HTML in database, using system template. Template type:', contract.template.type);
        
        // Usar plantilla del sistema basada en el tipo
        if (contract.template.type === 'simple') {
          html = simpleContractTemplate;
        } else {
          // Por defecto usar la plantilla moderna
          html = modernContractTemplate;
        }
        
        console.log('Using system template, HTML length:', html.length);
      } else {
        console.log('Using database template, HTML length:', html.length);
      }

      const today = new Date();
      html = html.replace(/{{current_date}}/g, today.toLocaleDateString());
      html = html.replace(/{{current_year}}/g, today.getFullYear().toString());

      const work = contract.work || {};
      html = html.replace(/{{work.name}}/g, work.name || 'N/A');
      html = html.replace(/{{work.alternative_title}}/g, work.alternative_title || 'N/A');
      html = html.replace(/{{work.iswc}}/g, work.iswc || 'N/A');
      html = html.replace(/{{work.type}}/g, work.type || 'N/A');
      html = html.replace(/{{work.status}}/g, work.status || 'N/A');
      html = html.replace(/{{work.release_date}}/g, work.release_date ? new Date(work.release_date).toLocaleDateString() : 'N/A');
      html = html.replace(/{{work.isrc}}/g, work.isrc || 'N/A');
      html = html.replace(/{{work.upc}}/g, work.upc || 'N/A');

      html = html.replace(/{{contract.status}}/g, contract.status || 'N/A');
      html = html.replace(/{{contract.internal_reference}}/g, contract.internal_reference || 'N/A');
      html = html.replace(/{{contract.signing_location}}/g, contract.signing_location || 'N/A');
      html = html.replace(/{{contract.additional_notes}}/g, contract.additional_notes || 'N/A');
      html = html.replace(/{{contract.publisher}}/g, contract.publisher || 'N/A');
      html = html.replace(/{{contract.publisher_percentage}}/g, contract.publisher_percentage || '0');
      html = html.replace(/{{contract.co_publishers}}/g, contract.co_publishers || 'N/A');
      html = html.replace(/{{contract.publisher_admin}}/g, contract.publisher_admin || 'N/A');
      html = html.replace(/{{contract.created_at}}/g, contract.created_at ? new Date(contract.created_at).toLocaleDateString() : 'N/A');

      const participants = contract.participants || [];

      // Reemplazar cada participante individualmente
      participants.forEach((p: any, index: number) => {
        Object.keys(p).forEach(key => {
          const regex = new RegExp(`{{participant\\[${index}\\]\\.${key}}}`, 'g');
          html = html.replace(regex, p[key] || 'N/A');
        });
      });
      
      // Manejar el loop {{#each participants}} para plantillas Handlebars
      const participantsLoopRegex = /{{#each participants}}([\s\S]*?){{\/each}}/g;
      html = html.replace(participantsLoopRegex, (match, template) => {
        return participants.map((p: any, index: number) => {
          let participantHtml = template;
          // Reemplazar variables del participante
          participantHtml = participantHtml.replace(/{{name}}/g, p.name || 'N/A');
          participantHtml = participantHtml.replace(/{{email}}/g, p.email || 'N/A');
          participantHtml = participantHtml.replace(/{{phone}}/g, p.phone || 'N/A');
          participantHtml = participantHtml.replace(/{{role}}/g, p.role || 'N/A');
          participantHtml = participantHtml.replace(/{{percentage}}/g, p.percentage || '0');
          participantHtml = participantHtml.replace(/{{ipi}}/g, p.ipi || '');
          participantHtml = participantHtml.replace(/{{artistic_name}}/g, p.artistic_name || '');
          participantHtml = participantHtml.replace(/{{management_entity}}/g, p.management_entity || '');
          participantHtml = participantHtml.replace(/{{type}}/g, p.type || '');
          participantHtml = participantHtml.replace(/{{signature:@index}}/g, `Firma ${index + 1}`);
          
          // Manejar condicionales {{#if}}
          participantHtml = participantHtml.replace(/{{#if artistic_name}}([\s\S]*?){{\/if}}/g, 
            p.artistic_name ? '$1' : '');
          participantHtml = participantHtml.replace(/{{#if ipi}}([\s\S]*?){{\/if}}/g, 
            p.ipi ? '$1' : '');
          participantHtml = participantHtml.replace(/{{#if management_entity}}([\s\S]*?){{\/if}}/g, 
            p.management_entity ? '$1' : '');
            
          return participantHtml;
        }).join('');
      });
      
      const participantsTable = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid; padding: 8px;">Nombre</th>
              <th style="border: 1px solid; padding: 8px;">Nombre Artístico</th>
              <th style="border: 1px solid; padding: 8px;">IPI</th>
              <th style="border: 1px solid; padding: 8px;">Rol</th>
              <th style="border: 1px solid; padding: 8px;">%</th>
            </tr>
          </thead>
          <tbody>
            ${participants.map((p: any) => `
              <tr>
                <td style="border: 1px solid; padding: 8px;">${p.name || 'N/A'}</td>
                <td style="border: 1px solid; padding: 8px;">${p.artistic_name || '-'}</td>
                <td style="border: 1px solid; padding: 8px;">${p.ipi || '-'}</td>
                <td style="border: 1px solid; padding: 8px;">${p.role || 'N/A'}</td>
                <td style="border: 1px solid; padding: 8px;">${p.percentage || '0'}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      html = html.replace(/{{participants.table}}/g, participantsTable);

      const totalPercentage = participants.reduce((sum: number, p: any) => sum + (Number(p.percentage) || 0), 0);
      html = html.replace(/{{participants.total_percentage}}/g, totalPercentage.toString());

      // Manejar condicionales {{#if}} a nivel de contrato
      html = html.replace(/{{#if contract\.additional_notes}}([\s\S]*?){{\/if}}/g, 
        contract.additional_notes ? '$1' : '');

      // Reemplazar cualquier variable restante con N/A
      html = html.replace(/{{.*?}}/g, 'N/A');

      setGeneratedHtml(html);
    }
  }, [contract]);

  const handleGeneratePdf = async () => {
    const printableContent = contentRef.current?.innerHTML;
    if (!printableContent) {
      alert('Content not available for PDF generation.');
      return;
    }
    setIsGenerating(true);

    const stylesheets = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('');
        } catch (e) {
          console.warn('Could not read CSS rules from stylesheet, it might be cross-origin:', sheet.href);
          return '';
        }
      })
      .join('\n');

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contract</title>
          <style>
            ${stylesheets}
            /* Basic responsive styles */
            img { max-width: 100%; height: auto; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            @media screen and (max-width: 600px) {
              table, thead, tbody, th, td, tr {
                display: block;
              }
              thead tr {
                position: absolute;
                top: -9999px;
                left: -9999px;
              }
              tr { border: 1px solid #ccc; margin-bottom: 5px; }
              td {
                border: none;
                border-bottom: 1px solid #eee;
                position: relative;
                padding-left: 50%;
                text-align: right;
              }
              td:before {
                position: absolute;
                top: 6px;
                left: 6px;
                width: 45%;
                padding-right: 10px;
                white-space: nowrap;
                text-align: left;
                font-weight: bold;
              }
            }
          </style>
        </head>
        <body>
          <div class="p-4">
            ${printableContent}
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Server error generating PDF:", errorBody); // Log server error
        throw new Error(errorBody.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contract?.id || 'generated'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      alert(`Could not generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!contract) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            ← Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Vista Previa del Contrato</h1>
            <p className="text-sm text-muted-foreground">
              {contract?.work_name || 'Cargando...'}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleGeneratePdf} 
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? '⏳ Generando...' : '📥 Descargar PDF'}
        </Button>
      </div>

      {/* Contenido del contrato */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div 
          ref={contentRef}
          className="contract-preview p-8"
          dangerouslySetInnerHTML={{ __html: generatedHtml }}
        />
      </div>

      {/* Footer con información */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Esta es una vista previa del contrato. Descarga el PDF para obtener la versión final.</p>
      </div>
    </div>
  );
}
