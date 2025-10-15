// lib/contract-templates.ts

export interface ContractTemplateData {
  contract: {
    status: string;
    internal_reference: string;
    signing_location: string;
    additional_notes: string;
    publisher: string;
    publisher_percentage: string;
    co_publishers: string;
    publisher_admin: string;
    created_at: string;
  };
  work: {
    name: string;
    alternative_title: string;
    iswc: string;
    type: string;
    status: string;
    release_date: string;
    isrc: string;
    upc: string;
  };
  participants: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    percentage: string;
    ipi?: string;
    type?: string;
    id_number?: string;
    address?: string;
    country?: string;
    artistic_name?: string;
    management_entity?: string;
  }>;
  current_date: string;
  current_year: number;
}

export const modernContractTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato Musical - {{work.name}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      font-size: 11px;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 8px;
    }
    
    .contract-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .contract-subtitle {
      font-size: 14px;
      color: #6b7280;
      font-weight: 400;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 10px;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 12px;
      font-weight: 400;
      color: #1f2937;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    
    .participants-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 10px;
    }
    
    .participants-table th {
      background: #f3f4f6;
      color: #374151;
      font-weight: 600;
      padding: 12px 8px;
      text-align: left;
      border: 1px solid #d1d5db;
      font-size: 10px;
    }
    
    .participants-table td {
      padding: 10px 8px;
      border: 1px solid #e5e7eb;
      font-size: 10px;
    }
    
    .participants-table tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .signature-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
    }
    
    .signature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 40px;
      margin-top: 30px;
    }
    
    .signature-box {
      text-align: center;
      padding: 20px;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      background: #fafafa;
    }
    
    .signature-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 12px;
    }
    
    .signature-email {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 20px;
    }
    
    .signature-line {
      border-top: 1px solid #374151;
      margin: 20px 0 8px 0;
      position: relative;
    }
    
    .signature-label {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #6b7280;
    }
    
    .highlight {
      background: linear-gradient(120deg, #a7f3d0 0%, #a7f3d0 100%);
      background-repeat: no-repeat;
      background-size: 100% 0.2em;
      background-position: 0 88%;
      font-weight: 500;
    }
    
    @media print {
      .container {
        padding: 15mm;
      }
      
      .signature-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">MVP X MUSIC</div>
      <h1 class="contract-title">Contrato de Representación Musical</h1>
      <p class="contract-subtitle">{{work.name}}</p>
    </div>

    <!-- Información del Contrato -->
    <div class="section">
      <h2 class="section-title">Información del Contrato</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Referencia Interna</span>
          <span class="info-value">{{contract.internal_reference}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado</span>
          <span class="info-value">{{contract.status}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Lugar de Firma</span>
          <span class="info-value">{{contract.signing_location}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fecha de Creación</span>
          <span class="info-value">{{contract.created_at}}</span>
        </div>
      </div>
    </div>

    <!-- Información de la Obra -->
    <div class="section">
      <h2 class="section-title">Detalles de la Obra Musical</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Título Principal</span>
          <span class="info-value highlight">{{work.name}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Título Alternativo</span>
          <span class="info-value">{{work.alternative_title}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ISWC</span>
          <span class="info-value">{{work.iswc}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tipo de Obra</span>
          <span class="info-value">{{work.type}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fecha de Lanzamiento</span>
          <span class="info-value">{{work.release_date}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ISRC / UPC</span>
          <span class="info-value">{{work.isrc}} / {{work.upc}}</span>
        </div>
      </div>
    </div>

    <!-- Información Editorial -->
    <div class="section">
      <h2 class="section-title">Información Editorial</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Editor Principal</span>
          <span class="info-value">{{contract.publisher}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Porcentaje Editorial</span>
          <span class="info-value">{{contract.publisher_percentage}}%</span>
        </div>
        <div class="info-item">
          <span class="info-label">Co-Editores</span>
          <span class="info-value">{{contract.co_publishers}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Administrador Editorial</span>
          <span class="info-value">{{contract.publisher_admin}}</span>
        </div>
      </div>
    </div>

    <!-- Participantes -->
    <div class="section">
      <h2 class="section-title">Participantes del Contrato</h2>
      <table class="participants-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>IPI</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Participación</th>
          </tr>
        </thead>
        <tbody>
          {{#each participants}}
          <tr>
            <td><strong>{{name}}</strong>{{#if artistic_name}}<br/><small style="color: #6b7280;">({{artistic_name}})</small>{{/if}}</td>
            <td>{{role}}</td>
            <td><strong>{{ipi}}</strong>{{#if management_entity}}<br/><small style="color: #6b7280;">{{management_entity}}</small>{{/if}}</td>
            <td>{{email}}</td>
            <td>{{phone}}</td>
            <td><strong>{{percentage}}%</strong></td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    <!-- Notas Adicionales -->
    {{#if contract.additional_notes}}
    <div class="section">
      <h2 class="section-title">Notas Adicionales</h2>
      <div class="info-value" style="grid-column: 1 / -1;">
        {{contract.additional_notes}}
      </div>
    </div>
    {{/if}}

    <!-- Sección de Firmas -->
    <div class="signature-section">
      <h2 class="section-title">Firmas Digitales</h2>
      <p style="color: #6b7280; font-size: 10px; margin-bottom: 20px;">
        Las siguientes personas deben firmar digitalmente este contrato para que entre en vigor:
      </p>
      
      <div class="signature-grid">
        {{#each participants}}
        <div class="signature-box">
          <div class="signature-name">{{name}}</div>
          <div class="signature-email">{{email}}</div>
          <div class="signature-line"></div>
          <div class="signature-label">{{signature:@index}}</div>
        </div>
        {{/each}}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Documento generado automáticamente el {{current_date}}</p>
      <p>MVP X MUSIC - Sistema de Gestión de Contratos Musicales</p>
      <p>Este documento ha sido creado digitalmente y es válido sin firma manuscrita</p>
    </div>
  </div>
</body>
</html>
`;

export const simpleContractTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contrato - {{work.name}}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      font-size: 12px; 
      line-height: 1.5; 
      margin: 20px;
      color: #333;
    }
    h1 { 
      font-size: 18px; 
      color: #2563eb;
      text-align: center;
      margin-bottom: 30px;
    }
    .section { 
      margin-bottom: 20px; 
      padding: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .section h2 {
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 10px;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 5px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .label {
      font-weight: bold;
      min-width: 150px;
      color: #374151;
    }
    .value {
      color: #1f2937;
    }
    .signatures {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #d1d5db;
    }
    .signature-box {
      display: inline-block;
      margin: 20px 20px 20px 0;
      padding: 15px;
      border: 1px dashed #9ca3af;
      text-align: center;
      min-width: 200px;
    }
  </style>
</head>
<body>
  <h1>Contrato Musical: {{work.name}}</h1>
  
  <div class="section">
    <h2>Información del Contrato</h2>
    <div class="info-row">
      <span class="label">Referencia:</span>
      <span class="value">{{contract.internal_reference}}</span>
    </div>
    <div class="info-row">
      <span class="label">Estado:</span>
      <span class="value">{{contract.status}}</span>
    </div>
    <div class="info-row">
      <span class="label">Lugar de firma:</span>
      <span class="value">{{contract.signing_location}}</span>
    </div>
  </div>

  <div class="section">
    <h2>Detalles de la Obra</h2>
    <div class="info-row">
      <span class="label">Título:</span>
      <span class="value">{{work.name}}</span>
    </div>
    <div class="info-row">
      <span class="label">Título alternativo:</span>
      <span class="value">{{work.alternative_title}}</span>
    </div>
    <div class="info-row">
      <span class="label">ISWC:</span>
      <span class="value">{{work.iswc}}</span>
    </div>
    <div class="info-row">
      <span class="label">Tipo:</span>
      <span class="value">{{work.type}}</span>
    </div>
    <div class="info-row">
      <span class="label">Fecha de lanzamiento:</span>
      <span class="value">{{work.release_date}}</span>
    </div>
  </div>

  {{#if contract.additional_notes}}
  <div class="section">
    <h2>Notas Adicionales</h2>
    <p>{{contract.additional_notes}}</p>
  </div>
  {{/if}}

  <div class="section">
    <h2>Participantes</h2>
    {{#each participants}}
    <div class="info-row">
      <span class="label">{{name}}{{#if artistic_name}} ({{artistic_name}}){{/if}}:</span>
      <span class="value">{{role}} - {{percentage}}%{{#if ipi}} | IPI: {{ipi}}{{/if}}</span>
    </div>
    {{/each}}
  </div>

  <div class="signatures">
    <h2>Firmas Requeridas</h2>
    {{#each participants}}
    <div class="signature-box">
      <strong>{{name}}</strong>{{#if artistic_name}}<br/><small>({{artistic_name}})</small>{{/if}}<br/>
      {{email}}{{#if ipi}}<br/><strong>IPI:</strong> {{ipi}}{{/if}}<br/>
      <div style="margin-top: 20px; border-top: 1px solid #000; padding-top: 5px;">
        {{signature:@index}}
      </div>
    </div>
    {{/each}}
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #6b7280;">
    Generado automáticamente el {{current_date}} - MVP X MUSIC
  </div>
</body>
</html>
`;

export function getContractTemplate(templateType: 'modern' | 'simple' = 'modern'): string {
  switch (templateType) {
    case 'simple':
      return simpleContractTemplate;
    case 'modern':
    default:
      return modernContractTemplate;
  }
}
