'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

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
      
      // La columna se llama auco_template_id, no template_html
      let html = contract.template.auco_template_id || contract.template.template_html || '';
      
      console.log('Template HTML length:', html?.length);
      
      if (!html) {
        console.error('No template HTML found in template:', contract.template);
        setGeneratedHtml(`
          <div style="padding: 20px;">
            <h2>Error: No Template HTML</h2>
            <p>The template exists but has no HTML content.</p>
            <p>Template ID: ${contract.template.id}</p>
            <p>Template Type: ${contract.template.type}</p>
            <p>Please edit the template and add HTML content.</p>
          </div>
        `);
        return;
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

      participants.forEach((p: any, index: number) => {
        Object.keys(p).forEach(key => {
          const regex = new RegExp(`{{participant[${index}].${key}}}`, 'g');
          html = html.replace(regex, p[key] || 'N/A');
        });
      });
      
      const participantsTable = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid; padding: 8px;">Nombre</th>
              <th style="border: 1px solid; padding: 8px;">Nombre Artístico</th>
              <th style="border: 1px solid; padding: 8px;">Rol</th>
              <th style="border: 1px solid; padding: 8px;">%</th>
            </tr>
          </thead>
          <tbody>
            ${participants.map((p: any) => `
              <tr>
                <td style="border: 1px solid; padding: 8px;">${p.name || 'N/A'}</td>
                <td style="border: 1px solid; padding: 8px;">${p.artistic_name || 'N/A'}</td>
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Generate Contract</h1>
        <Button onClick={handleGeneratePdf} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
      <div 
        ref={contentRef}
        className="border p-4 rounded-md" 
        dangerouslySetInnerHTML={{ __html: generatedHtml }}
      />
    </div>
  );
}
