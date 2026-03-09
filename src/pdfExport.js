import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Page dimensions (letter size in points, with margins)
const PAGE_W = 612;  // 8.5"
const PAGE_H = 792;  // 11"
const MARGIN = 50;
const CONTENT_W = PAGE_W - (MARGIN * 2);
const CONTENT_H = PAGE_H - (MARGIN * 2) - 30; // leave room for footer

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  return '$' + Math.round(val).toLocaleString();
};

const USE_CODE_DESCRIPTIONS = {
  "101": "Single Family Residential",
  "102": "Condo",
  "104": "Two Family",
  "109": "Multiple Houses",
  "130": "Vacant Land",
  "131": "Vacant Land",
  "132": "Vacant Land",
  "314": "Restaurant/Bar",
  "316": "Mixed Use (Res+Comm)",
  "325": "Motel",
  "334": "Gasoline Station",
  "337": "Parking Lot",
  "340": "General Office",
  "391": "Vacant Commercial",
  "392": "Vacant Commercial",
  "013": "Multiple Use",
  "915": "Government/Institutional",
  "929": "Government/Institutional",
  "930": "Government/Institutional",
  "950": "Government/Institutional",
  "960": "Government/Institutional",
  "970": "Government/Institutional",
  "971": "Government/Institutional"
};

/**
 * Build a print-friendly HTML section
 */
function buildSectionHTML(title, content, pageBreakBefore = true) {
  return `
    <div class="pdf-section" style="${pageBreakBefore ? 'page-break-before: always;' : ''} padding: 20px 0;">
      ${title ? `<h2 style="font-size: 22px; font-weight: bold; color: #1a202c; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #2d5a8c;">${title}</h2>` : ''}
      ${content}
    </div>
  `;
}

/**
 * Build the cover page HTML
 */
function buildCoverPage(data) {
  return `
    <div style="text-align: center; padding-top: 120px;">
      <div style="border: 3px solid #1a365d; padding: 60px 40px; margin: 0 40px;">
        <h1 style="font-size: 36px; font-weight: bold; color: #1a365d; margin-bottom: 12px;">Town of Southborough</h1>
        <h2 style="font-size: 24px; color: #2d5a8c; margin-bottom: 24px;">Route 9 Corridor<br/>District Improvement Financing Program</h2>
        <div style="width: 80px; height: 3px; background: #2d5a8c; margin: 24px auto;"></div>
        <p style="font-size: 18px; color: #4a5568; font-weight: 600;">Wastewater Infrastructure Investment</p>
        <p style="font-size: 14px; color: #718096; margin-top: 40px;">Pursuant to Massachusetts General Law Chapter 40Q</p>
        <p style="font-size: 14px; color: #718096; margin-top: 8px;">Program Date: ${data.programDate}</p>
        <p style="font-size: 14px; color: #718096; margin-top: 4px;">Base Valuation Date: ${data.baseDate}</p>
      </div>
    </div>
  `;
}

/**
 * Build introduction section
 */
function buildIntroduction(data) {
  const paragraphs = data.introduction.split('\n\n').map(p =>
    `<p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">${p.trim()}</p>`
  ).join('');
  return buildSectionHTML('Introduction', paragraphs);
}

/**
 * Build About the District section with map
 */
function buildDistrictSection(data) {
  const paragraphs = data.districtNarrative.split('\n\n').map(p => {
    if (p.trim().startsWith('-') || p.trim().startsWith('•')) {
      const items = p.trim().split('\n').map(line =>
        `<li style="font-size: 12px; line-height: 1.6; color: #2d3748; margin-bottom: 4px;">${line.replace(/^[-•]\s*/, '')}</li>`
      ).join('');
      return `<ul style="margin: 8px 0 12px 24px; list-style-type: disc;">${items}</ul>`;
    }
    return `<p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">${p.trim()}</p>`;
  }).join('');

  return buildSectionHTML('About the Development District', `
    <div style="border: 2px solid #cbd5e0; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #f7fafc;">
      <p style="font-size: 11px; font-weight: 600; color: #4a5568; margin-bottom: 8px;">Proposed DIF District — Route 9 Corridor</p>
      <img src="/district-map.png" style="width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 4px;" />
      <p style="font-size: 10px; color: #718096; margin-top: 8px;">Discussion Draft #2 (2/15/26) — DIF area is within the 25% statutory limit (MGL Ch. 40Q §2).</p>
    </div>
    ${paragraphs}
  `);
}

/**
 * Build parcel table section
 */
function buildParcelSection(selectedParcels) {
  const totalVal = selectedParcels.reduce((sum, p) => sum + p.totalVal, 0);
  const totalAcres = selectedParcels.reduce((sum, p) => sum + p.acres, 0);

  const rows = selectedParcels
    .sort((a, b) => a.addr.localeCompare(b.addr))
    .map((p, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f7fafc'}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 6px; font-size: 9px; font-family: monospace; color: #4a5568;">${p.id}</td>
        <td style="padding: 4px 6px; font-size: 9px; color: #2d3748;">${p.addr}</td>
        <td style="padding: 4px 6px; font-size: 9px; text-align: right; font-family: monospace;">${formatCurrency(p.totalVal)}</td>
        <td style="padding: 4px 6px; font-size: 9px; text-align: right;">${p.acres.toFixed(2)}</td>
        <td style="padding: 4px 6px; font-size: 9px; color: #4a5568;">${USE_CODE_DESCRIPTIONS[p.useCode] || p.useCode}</td>
        <td style="padding: 4px 6px; font-size: 9px; color: #4a5568;">${p.owner.substring(0, 35)}</td>
      </tr>
    `).join('');

  return buildSectionHTML('Parcel Information', `
    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
      <div style="flex: 1; background: #ebf8ff; padding: 12px; border-radius: 6px; border: 1px solid #bee3f8;">
        <p style="font-size: 10px; font-weight: 600; color: #2b6cb0;">Parcels in District</p>
        <p style="font-size: 24px; font-weight: bold; color: #1a365d;">${selectedParcels.length}</p>
      </div>
      <div style="flex: 1; background: #f0fff4; padding: 12px; border-radius: 6px; border: 1px solid #c6f6d5;">
        <p style="font-size: 10px; font-weight: 600; color: #276749;">Total Assessed Value</p>
        <p style="font-size: 20px; font-weight: bold; color: #22543d;">${formatCurrency(totalVal)}</p>
      </div>
      <div style="flex: 1; background: #faf5ff; padding: 12px; border-radius: 6px; border: 1px solid #e9d8fd;">
        <p style="font-size: 10px; font-weight: 600; color: #553c9a;">Total Acres</p>
        <p style="font-size: 24px; font-weight: bold; color: #44337a;">${totalAcres.toFixed(2)}</p>
      </div>
      <div style="flex: 1; background: #fffaf0; padding: 12px; border-radius: 6px; border: 1px solid #feebc8;">
        <p style="font-size: 10px; font-weight: 600; color: #c05621;">25% Limit Check</p>
        <p style="font-size: 20px; font-weight: bold; color: #22543d;">${((totalAcres / (14432 * 0.25)) * 100).toFixed(0)}% of limit</p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
      <thead>
        <tr style="background: #edf2f7; border-bottom: 2px solid #cbd5e0;">
          <th style="text-align: left; padding: 6px; font-weight: 600; color: #4a5568;">Parcel ID</th>
          <th style="text-align: left; padding: 6px; font-weight: 600; color: #4a5568;">Address</th>
          <th style="text-align: right; padding: 6px; font-weight: 600; color: #4a5568;">Total Value</th>
          <th style="text-align: right; padding: 6px; font-weight: 600; color: #4a5568;">Acres</th>
          <th style="text-align: left; padding: 6px; font-weight: 600; color: #4a5568;">Use</th>
          <th style="text-align: left; padding: 6px; font-weight: 600; color: #4a5568;">Owner</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="border-top: 2px solid #cbd5e0; background: #edf2f7;">
          <td style="padding: 6px; font-weight: bold;" colspan="2">TOTAL (${selectedParcels.length} parcels)</td>
          <td style="padding: 6px; text-align: right; font-weight: bold; font-family: monospace;">${formatCurrency(totalVal)}</td>
          <td style="padding: 6px; text-align: right; font-weight: bold;">${totalAcres.toFixed(2)}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>
  `);
}

/**
 * Build findings section
 */
function buildFindingsSection(data, stats) {
  const findings = data.findings || {};
  const acreagePercent = (stats.totalAcres / 14432) * 100;

  const findingsList = [
    { key: 'finding1', text: `The district is appropriately defined and bounded as the Route 9 Corridor in Southborough, encompassing ${stats.count} parcels with total assessed value of ${formatCurrency(stats.totalVal)}.` },
    { key: 'finding2', text: `The district acreage (${stats.totalAcres.toFixed(2)} acres, ${acreagePercent.toFixed(2)}% of town) does not exceed 25% of total town area (14,432 acres).` },
    { key: 'finding3', text: `The development program (wastewater infrastructure) meets the statutory definition of an appropriate development activity likely to generate substantial new assessed values.` },
    { key: 'finding4', text: `The financial plan demonstrates that the Invested Revenue District will generate sufficient tax revenues to fund the development program within a reasonable timeframe (${data.difTerm}-year term).` },
    { key: 'finding5', text: `The town has followed all procedural requirements including town meeting vote and assessor certifications.` }
  ];

  const findingsHTML = findingsList.map((f, idx) => `
    <div style="display: flex; gap: 12px; margin-bottom: 12px; padding: 8px; background: ${findings[f.key] ? '#f0fff4' : '#fff5f5'}; border-radius: 4px; border: 1px solid ${findings[f.key] ? '#c6f6d5' : '#fed7d7'};">
      <span style="font-size: 16px; min-width: 20px;">${findings[f.key] ? '✓' : '○'}</span>
      <p style="font-size: 12px; line-height: 1.5; color: #2d3748;"><strong>Finding ${idx + 1}:</strong> ${f.text}</p>
    </div>
  `).join('');

  return buildSectionHTML('Statement of Findings', `
    <div style="background: #ebf8ff; border: 1px solid #bee3f8; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <p style="font-size: 11px; color: #2b6cb0;"><strong>MGL Chapter 40Q §2 Requirements:</strong> The town must certify that the DIF district meets all statutory requirements.</p>
    </div>
    ${findingsHTML}
    ${data.findingsNarrative ? `<p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-top: 16px;">${data.findingsNarrative}</p>` : ''}
  `);
}

/**
 * Build development program section
 */
function buildDevelopmentProgramSection(data) {
  const totalCost = data.projectComponents.reduce((sum, c) => sum + c.cost, 0);

  const rows = data.projectComponents.map((comp, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f7fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 12px; font-size: 12px; color: #2d3748; font-weight: 500;">${comp.name}</td>
      <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-family: monospace; color: #1a202c;">${formatCurrency(comp.cost)}</td>
      <td style="padding: 8px 12px; font-size: 12px; text-align: right; color: #4a5568;">${((comp.cost / totalCost) * 100).toFixed(1)}%</td>
    </tr>
  `).join('');

  const narrativeSections = [
    { title: 'Statement of Means and Objectives', text: data.meansAndObjectives },
    { title: 'Plans for Relocation', text: data.relocationPlan },
    { title: 'Plans for Housing', text: data.housingPlan },
    { title: 'Operation After Completion', text: data.operationPlan }
  ].map(s => `
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 6px;">${s.title}</h4>
      ${s.text.split('\n\n').map(p => `<p style="font-size: 11px; line-height: 1.6; color: #2d3748; margin-bottom: 8px; text-align: justify;">${p.trim()}</p>`).join('')}
    </div>
  `).join('');

  return buildSectionHTML('Development Program', `
    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-bottom: 12px;">Project Components (Municipal Wastewater System)</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: #edf2f7; border-bottom: 2px solid #cbd5e0;">
          <th style="text-align: left; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #4a5568;">Component</th>
          <th style="text-align: right; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #4a5568;">Cost</th>
          <th style="text-align: right; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #4a5568;">% of Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="border-top: 2px solid #cbd5e0; background: #edf2f7;">
          <td style="padding: 8px 12px; font-weight: bold; font-size: 13px; color: #1a202c;">Total Project Cost</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: bold; font-size: 14px; font-family: monospace; color: #1a202c;">${formatCurrency(totalCost)}</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #1a202c;">100%</td>
        </tr>
      </tfoot>
    </table>
    ${narrativeSections}
  `);
}

/**
 * Build financial plan section (text + projection table — chart captured separately)
 */
function buildFinancialPlanSection(data, stats, projections, projectCost) {
  const totalDifRevenue = projections[projections.length - 1]?.cumulativeDifRevenue || 0;
  const paybackYear = projections.find(p => p.cumulativeDifRevenue >= projectCost)?.year || null;

  const projectionRows = projections.map((row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f7fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 3px 6px; font-size: 9px; font-weight: 600; color: #1a202c;">${row.year}</td>
      <td style="padding: 3px 6px; font-size: 9px; color: #4a5568; text-align: center;">${row.fyEnding}</td>
      <td style="padding: 3px 6px; font-size: 9px; text-align: right; font-family: monospace;">${formatCurrency(row.newGrowthRevenue)}</td>
      <td style="padding: 3px 6px; font-size: 9px; text-align: right; font-family: monospace; color: #2b6cb0; font-weight: 600;">${formatCurrency(row.difRevenue)}</td>
      <td style="padding: 3px 6px; font-size: 9px; text-align: right; font-family: monospace; color: #4a5568;">${formatCurrency(row.toGeneralFund)}</td>
      <td style="padding: 3px 6px; font-size: 9px; text-align: right; font-family: monospace; color: #276749; font-weight: bold;">${formatCurrency(row.cumulativeDifRevenue)}</td>
    </tr>
  `).join('');

  return buildSectionHTML('Financial Plan', `
    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
      <div style="flex: 1; background: #f0fff4; padding: 12px; border-radius: 6px; border: 1px solid #c6f6d5;">
        <p style="font-size: 10px; font-weight: 600; color: #276749;">Total OAV</p>
        <p style="font-size: 18px; font-weight: bold; color: #22543d;">${formatCurrency(stats.totalVal)}</p>
      </div>
      <div style="flex: 1; background: #ebf8ff; padding: 12px; border-radius: 6px; border: 1px solid #bee3f8;">
        <p style="font-size: 10px; font-weight: 600; color: #2b6cb0;">Est. DIF Revenue (Total)</p>
        <p style="font-size: 18px; font-weight: bold; color: #1a365d;">${formatCurrency(totalDifRevenue)}</p>
      </div>
      <div style="flex: 1; background: #fffaf0; padding: 12px; border-radius: 6px; border: 1px solid #feebc8;">
        <p style="font-size: 10px; font-weight: 600; color: #c05621;">Project Cost</p>
        <p style="font-size: 18px; font-weight: bold; color: #7b341e;">${formatCurrency(projectCost)}</p>
      </div>
      <div style="flex: 1; background: ${totalDifRevenue >= projectCost ? '#f0fff4' : '#fff5f5'}; padding: 12px; border-radius: 6px; border: 1px solid ${totalDifRevenue >= projectCost ? '#c6f6d5' : '#fed7d7'};">
        <p style="font-size: 10px; font-weight: 600; color: ${totalDifRevenue >= projectCost ? '#276749' : '#c53030'};">Surplus/(Deficit)</p>
        <p style="font-size: 18px; font-weight: bold; color: ${totalDifRevenue >= projectCost ? '#22543d' : '#c53030'};">${formatCurrency(totalDifRevenue - projectCost)}</p>
      </div>
    </div>

    <div style="background: #f7fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
      <p style="font-size: 11px; color: #2d3748;"><strong>Parameters:</strong> DIF Term: ${data.difTerm} years | Tax Rate: $${data.taxRate}/1,000 | Annual Growth: ${data.annualGrowthRate}% | Capture: ${(data.captureRates?.[0]?.rate * 100) || 50}%</p>
      ${paybackYear ? `<p style="font-size: 11px; color: #276749; margin-top: 4px;"><strong>Payback Period:</strong> Year ${paybackYear}</p>` : ''}
    </div>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">${data.difTerm}-Year Revenue Projection</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
      <thead>
        <tr style="background: #edf2f7; border-bottom: 2px solid #cbd5e0;">
          <th style="text-align: left; padding: 4px 6px; font-weight: 600; color: #4a5568;">Year</th>
          <th style="text-align: center; padding: 4px 6px; font-weight: 600; color: #4a5568;">FY Ending</th>
          <th style="text-align: right; padding: 4px 6px; font-weight: 600; color: #4a5568;">New Growth Revenue</th>
          <th style="text-align: right; padding: 4px 6px; font-weight: 600; color: #2b6cb0;">DIF Revenue</th>
          <th style="text-align: right; padding: 4px 6px; font-weight: 600; color: #4a5568;">To General Fund</th>
          <th style="text-align: right; padding: 4px 6px; font-weight: 600; color: #276749;">Cumulative DIF</th>
        </tr>
      </thead>
      <tbody>${projectionRows}</tbody>
    </table>
  `);
}

/**
 * Build funding sources section
 */
function buildFundingSourcesSection(data) {
  const rows = (data.fundingSources || []).map((source, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f7fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 6px 12px; font-size: 12px; color: #2d3748;">${source.name}</td>
      <td style="padding: 6px 12px; font-size: 12px; text-align: right; font-family: monospace; color: #1a202c; font-weight: 600;">${source.percent.toFixed(1)}%</td>
    </tr>
  `).join('');

  const total = (data.fundingSources || []).reduce((sum, s) => sum + s.percent, 0);

  return buildSectionHTML('Funding Sources', `
    <p style="font-size: 12px; line-height: 1.6; color: #2d3748; margin-bottom: 16px;">DIF is one component of a comprehensive funding strategy. The following table shows the projected breakdown of funding sources based on the Yarmouth DIF precedent model.</p>
    <table style="width: 60%; border-collapse: collapse;">
      <thead>
        <tr style="background: #edf2f7; border-bottom: 2px solid #cbd5e0;">
          <th style="text-align: left; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #4a5568;">Funding Source</th>
          <th style="text-align: right; padding: 8px 12px; font-size: 12px; font-weight: 600; color: #4a5568;">Percentage</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="border-top: 2px solid #cbd5e0; background: #edf2f7;">
          <td style="padding: 8px 12px; font-weight: bold; font-size: 12px;">Total</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: bold; font-size: 12px; font-family: monospace;">${total.toFixed(1)}%</td>
        </tr>
      </tfoot>
    </table>
  `);
}

/**
 * Build operation & management section
 */
function buildOperationSection(data) {
  return buildSectionHTML('Operation & Management', `
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 6px;">Administering Entity</h4>
      <p style="font-size: 12px; line-height: 1.6; color: #2d3748;">${data.administringEntity}</p>
    </div>
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 6px;">Committee Composition</h4>
      <p style="font-size: 12px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${data.committeeComposition}</p>
    </div>
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 6px;">Fund Flow</h4>
      <p style="font-size: 12px; line-height: 1.6; color: #2d3748; text-align: justify;">${data.fundFlowNarrative || ''}</p>
    </div>
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 6px;">Reporting Timeline</h4>
      <p style="font-size: 12px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${data.reportingTimeline}</p>
    </div>
  `);
}

/**
 * Build appendices checklist
 */
function buildAppendicesSection(data) {
  const appendices = data.appendices || {};
  const items = [
    { key: 'map', label: 'District Map (showing all parcels and district boundaries)' },
    { key: 'townVote', label: 'Town Meeting/Town Council Vote (establishing DIF)' },
    { key: 'acreageCert', label: "Assessor's Certification of Acreage" },
    { key: 'oavCert', label: "Assessor's Certification of Original Assessed Value (OAV)" },
    { key: 'parcelList', label: 'Complete Parcel List (with use codes and values)' },
    { key: 'activitiesAuth', label: 'Activities Authorized (MGL 40Q §2(c))' }
  ];

  const checksHTML = items.map(item => `
    <div style="display: flex; gap: 10px; margin-bottom: 8px; padding: 6px 0;">
      <span style="font-size: 14px;">${appendices[item.key] ? '☑' : '☐'}</span>
      <span style="font-size: 12px; color: #2d3748;">${item.label}</span>
    </div>
  `).join('');

  return buildSectionHTML('Required Appendices', `
    <p style="font-size: 12px; color: #4a5568; margin-bottom: 16px;">Check off appendices as they are completed and attached to this DIF proposal.</p>
    ${checksHTML}
  `);
}

/**
 * Build justification narrative
 */
function buildJustificationSection(data) {
  const paragraphs = data.justificationNarrative.split('\n\n').map(p => {
    const trimmed = p.trim();
    // Check if this is a heading (short line with no period)
    if (trimmed.length < 80 && !trimmed.includes('.') && !trimmed.startsWith('-')) {
      return `<h3 style="font-size: 14px; font-weight: 600; color: #1a365d; margin: 16px 0 8px 0;">${trimmed}</h3>`;
    }
    return `<p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 10px; text-align: justify;">${trimmed}</p>`;
  }).join('');

  return buildSectionHTML('Justification Narrative', paragraphs);
}

/**
 * Capture the revenue chart from the live app
 */
async function captureChart() {
  const chartContainer = document.querySelector('.recharts-wrapper');
  if (!chartContainer) return null;
  try {
    const canvas = await html2canvas(chartContainer, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Could not capture chart:', e);
    return null;
  }
}

/**
 * Calculate projections (mirrors the app's logic)
 */
function calculateProjections(data, stats) {
  const baseYear = new Date(data.baseDate).getFullYear();
  const oav = stats.totalVal;
  const taxRate = data.taxRate / 1000;
  const growthRate = data.annualGrowthRate / 100;
  const captureRates = data.captureRates || [{ years: 10, rate: 0.5 }, { years: 15, rate: 0.25 }];

  const projections = [];
  let cumulativeDifRevenue = 0;
  let totalNewGrowth = oav * taxRate;

  for (let i = 0; i < data.difTerm; i++) {
    const year = baseYear + i;
    const fyEnding = `FY${year + 1}`;
    const newGrowthThisYear = totalNewGrowth * Math.pow(1 + growthRate, i);

    let captureRate = 0.5;
    let yearsElapsed = 0;
    for (let rate of captureRates) {
      if (i < yearsElapsed + rate.years) {
        captureRate = rate.rate;
        break;
      }
      yearsElapsed += rate.years;
    }

    const difRevenue = newGrowthThisYear * captureRate;
    const toGeneralFund = newGrowthThisYear * (1 - captureRate);
    cumulativeDifRevenue += difRevenue;

    projections.push({
      year: i + 1,
      fyEnding,
      newGrowthRevenue: newGrowthThisYear,
      difRevenue,
      toGeneralFund,
      cumulativeDifRevenue,
      debtService: 0
    });
  }

  return projections;
}

/**
 * Main PDF generation function
 */
export async function generateDIFProposalPDF(data, selectedParcels, stats, projectCost, onProgress) {
  const notify = onProgress || (() => {});
  notify('Preparing document...');

  const projections = calculateProjections(data, stats);

  // Build all section HTML
  const sections = [
    buildCoverPage(data),
    buildIntroduction(data),
    buildDistrictSection(data),
    buildParcelSection(selectedParcels),
    buildFindingsSection(data, stats),
    buildDevelopmentProgramSection(data),
    buildFinancialPlanSection(data, stats, projections, projectCost),
    buildFundingSourcesSection(data),
    buildOperationSection(data),
    buildAppendicesSection(data),
    buildJustificationSection(data)
  ];

  // Create off-screen container
  const container = document.createElement('div');
  container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 750px; background: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
  document.body.appendChild(container);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  let pageNum = 0;

  const addPageFooter = (pg) => {
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(`Town of Southborough — Route 9 DIF Proposal`, MARGIN, PAGE_H - 25);
    pdf.text(`Page ${pg}`, PAGE_W - MARGIN, PAGE_H - 25, { align: 'right' });
    pdf.setDrawColor(200);
    pdf.line(MARGIN, PAGE_H - 35, PAGE_W - MARGIN, PAGE_H - 35);
  };

  for (let i = 0; i < sections.length; i++) {
    notify(`Rendering section ${i + 1} of ${sections.length}...`);

    container.innerHTML = sections[i];

    // Wait for images to load
    const images = container.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(Array.from(images).map(img =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else { img.onload = resolve; img.onerror = resolve; }
        })
      ));
    }

    // Capture section
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = CONTENT_W;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Split into pages if content is taller than one page
    let yOffset = 0;
    const pageContentH = CONTENT_H;

    while (yOffset < imgHeight) {
      if (pageNum > 0) pdf.addPage();
      pageNum++;

      // Calculate source crop
      const sourceY = (yOffset / imgHeight) * canvas.height;
      const sourceH = Math.min((pageContentH / imgHeight) * canvas.height, canvas.height - sourceY);
      const destH = Math.min(pageContentH, imgHeight - yOffset);

      // Create a cropped canvas for this page segment
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = canvas.width;
      cropCanvas.height = sourceH;
      const ctx = cropCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceH, 0, 0, canvas.width, sourceH);

      const cropData = cropCanvas.toDataURL('image/png');
      pdf.addImage(cropData, 'PNG', MARGIN, MARGIN, imgWidth, destH);

      addPageFooter(pageNum);
      yOffset += pageContentH;
    }
  }

  // Try to capture the live chart if the financial section is visible
  notify('Capturing charts...');
  const chartImg = await captureChart();
  if (chartImg) {
    pdf.addPage();
    pageNum++;
    pdf.setFontSize(14);
    pdf.setTextColor(26, 32, 44);
    pdf.text('Revenue vs. Project Cost', MARGIN, MARGIN + 20);

    const chartCanvas = document.createElement('img');
    chartCanvas.src = chartImg;
    pdf.addImage(chartImg, 'PNG', MARGIN, MARGIN + 40, CONTENT_W, CONTENT_W * 0.5);
    addPageFooter(pageNum);
  }

  // Cleanup
  document.body.removeChild(container);

  notify('Saving PDF...');
  pdf.save(`Southborough_DIF_Proposal_${new Date().toISOString().split('T')[0]}.pdf`);
  notify(null); // done

  return pageNum;
}
