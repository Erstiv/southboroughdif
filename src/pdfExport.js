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
 * Build table of contents page
 */
function buildTableOfContents() {
  return buildSectionHTML('Table of Contents', `
    <div style="margin-left: 20px;">
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>1. Introduction</strong> ........................................................................................ 2</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>2. About Development Districts and Programs, or DIF</strong> ............................ 3</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>3. About the Route 9 Development District</strong> ......................................... 5</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>4. Description of the Approval Process and Legislative Actions</strong> .............. 8</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>5. Development District and Program Information Summary</strong> ..................... 9</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>6. Statement of Findings</strong> ....................................................................... 10</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>7. Duration of the DIF District and Base Date</strong> ..................................... 12</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>8. Phase One DIF and Other Special Districts</strong> ...................................... 13</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>9. Activities Authorized within a DIF District</strong> .................................... 14</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>10. Parcel Information</strong> ............................................................................ 16</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>11. Development Program</strong> ........................................................................ 18</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>12. Statement of Means and Objectives</strong> ................................................ 20</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>13. Plans for Relocation of Displaced Persons</strong> ...................................... 22</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>14. Plans for Housing</strong> ............................................................................. 23</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>15. Operation & Management</strong> ................................................................... 24</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>16. Invested Revenue District and IRDDP</strong> ................................................ 26</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>17. Financial Plan</strong> ................................................................................ 27</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>18. Tax Increment Retention Schedule</strong> ................................................... 30</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>19. Funding Sources</strong> ............................................................................. 31</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>20. Justification Narrative</strong> .................................................................... 32</p>
      <p style="font-size: 12px; line-height: 2.0; color: #2d3748; margin-bottom: 4px;"><strong>21. Required Appendices</strong> ....................................................................... 33</p>
    </div>
  `, false);
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
 * Build "About DIF" section with statutory explanation
 */
function buildAboutDIFSection() {
  const content = `
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      A Development Improvement Financing (DIF) district is a designated geographic area within a municipality where certain types of public improvements are undertaken, and where a portion of the tax revenues generated by increases in property value (known as "New Growth") is dedicated to funding those improvements for a specific period of time (up to 30 years).
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">What is a Development District?</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      A Development District is a geographic area designated by a municipality through state-enabling legislation (Massachusetts General Law Chapter 40Q) in which the town intends to undertake coordinated public improvements to stimulate private investment and economic development. The district must be appropriately bounded and may not exceed 25% of the town's total area.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">What is an Invested Revenue District (IRD)?</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      An Invested Revenue District (IRD) is created when a town establishes an Invested Revenue District Development Program (IRDDP) that designates how tax increment revenues generated within the Development District will be used. The IRD is typically coterminous with (or a subset of) the Development District. Within an IRD, a portion of property tax revenues attributable to increases in assessed value (New Growth) is captured and dedicated to funding the development program.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">How Does Tax Increment Work?</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Tax increment financing works by comparing the assessed value of properties in the district on a baseline date (called the "Original Assessed Value" or OAV) to the assessed value on future dates. The difference—the increase in value—is called "New Growth." A portion of the property taxes attributable to this New Growth is captured and set aside in the DIF fund. The remainder of New Growth tax revenue continues to flow to the municipality's general fund, schools, and other taxing jurisdictions as usual.
    </p>

    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Critically, DIF does not capture any taxes on the Original Assessed Value. The tax rate applied to OAV remains the same inside and outside the district. This means no additional tax burden is imposed on existing property owners. Only increases in property value generate incremental tax revenue that may be captured.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">No Additional Tax Imposed</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      One of the key principles of DIF is that it does not impose any additional tax on property owners within the district. The property tax rate applied in a DIF district is identical to the rate applied outside the district. Tax increment captures only the incremental revenue from growth in assessed value, with no differential rate or assessment.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">EACC Approval Is Not Required</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Prior to 2016, DIFs required approval from the Economic Assistance Coordinating Council (EACC). However, Massachusetts law was amended in 2016 to eliminate this requirement. DIFs now require only town meeting approval (or town council vote in charter municipalities) and do not require state approval.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">The 25% Area Limit</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Under MGL Chapter 40Q §2, the total area of Development Districts in a municipality may not exceed 25% of the town's total land area. This limitation ensures that DIF is used as a targeted tool for specific growth corridors rather than a blanket municipality-wide strategy.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">30-Year Term Limit</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      A DIF district may operate for no longer than 30 years from its establishment date. At the end of the term, the district dissolves, and all tax increment revenue thereafter flows to the general fund and other taxing jurisdictions in the normal fashion.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">DIF vs. Tax Increment Financing (TIF)</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      DIF and TIF (Tax Increment Financing) are often confused, but they are distinct programs under Massachusetts law. TIF is a more complex tool that allows capture of tax increment from both new growth AND increases in existing property value (revaluation). TIF typically requires more extensive approvals and economic justification. DIF is simpler and more limited: it captures only New Growth tax revenue. For a wastewater infrastructure project with a discrete cost and timeframe, DIF is the appropriate mechanism.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">MGL Chapter 40Q Statutory Checklist</h3>
    <div style="background: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
      <ul style="font-size: 11px; line-height: 1.8; color: #2d3748; list-style-position: inside;">
        <li>☑ Public hearing and notice requirements met</li>
        <li>☑ Selectboard/City Council endorsed the proposal</li>
        <li>☑ Finance Committee reviewed and recommended</li>
        <li>☑ Town Meeting voted to establish DIF district (warrant article)</li>
        <li>☑ District is appropriately bounded and legally described</li>
        <li>☑ Total district area does not exceed 25% of town area</li>
        <li>☑ Development program consists of authorized activities</li>
        <li>☑ Financial plan projects sufficient revenue to fund improvements</li>
        <li>☑ Assessor has certified Original Assessed Value (OAV)</li>
        <li>☑ Assessor has certified district acreage</li>
        <li>☑ Term does not exceed 30 years</li>
        <li>☑ Capture percentage is reasonable and clearly stated</li>
      </ul>
    </div>
  `;
  return buildSectionHTML('About Development Districts and Programs, or DIF', content);
}

/**
 * Build expanded district section with economic development narrative
 */
function buildDistrictSectionExpanded(data) {
  const paragraphs = data.districtNarrative.split('\n\n').map(p => {
    if (p.trim().startsWith('-') || p.trim().startsWith('•')) {
      const items = p.trim().split('\n').map(line =>
        `<li style="font-size: 12px; line-height: 1.6; color: #2d3748; margin-bottom: 4px;">${line.replace(/^[-•]\s*/, '')}</li>`
      ).join('');
      return `<ul style="margin: 8px 0 12px 24px; list-style-type: disc;">${items}</ul>`;
    }
    return `<p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">${p.trim()}</p>`;
  }).join('');

  const expandedContent = `
    <div style="border: 2px solid #cbd5e0; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #f7fafc;">
      <p style="font-size: 11px; font-weight: 600; color: #4a5568; margin-bottom: 8px;">Proposed DIF District — Route 9 Corridor</p>
      <img src="/district-map.png" style="width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 4px;" />
      <p style="font-size: 10px; color: #718096; margin-top: 8px;">Discussion Draft #2 (2/15/26) — DIF area is within the 25% statutory limit (MGL Ch. 40Q §2).</p>
    </div>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Southborough's Wastewater Challenge</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Town of Southborough, located in the Boston metropolitan area with a total area of 15.7 square miles (10,048 acres), currently relies heavily on on-site septic systems throughout much of its unserviced territory, particularly in the Route 9 corridor. This infrastructure limitation constrains economic development: commercial properties are limited in density and use by Title 5 septic system requirements, vacant land cannot support intensive development, and existing underutilized properties cannot be redeveloped without costly septic system upgrades.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Route 9 Corridor Economic Development Potential</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Route 9 (Worcester Turnpike) is a major east-west commercial corridor with direct regional access to Boston (approximately 35 miles), Interstate 495, and Route 128. The corridor passes through Southborough and presents significant economic development opportunity: proximity to major employment centers, highway visibility and access, proximity to the Framingham/Marlborough technology corridor, and existing commercial zoning with developable parcels. However, this potential cannot be realized without municipal wastewater infrastructure.
    </p>

    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">How Wastewater Enables the Virtuous Cycle</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Municipal wastewater infrastructure creates a "virtuous cycle" of economic development: public investment in sewer and water systems removes development constraints, enabling private capital to flow into redevelopment and new construction. This private investment, in turn, increases property values and generates tax revenue that pays back the public investment while providing benefits to municipal finances and the regional economy.
    </p>

    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Research by the Donahue Institute at the University of Massachusetts found that for every $1 of public investment in water and sewer infrastructure, municipalities experience approximately:
    </p>

    <div style="background: #ebf8ff; padding: 12px; border-radius: 6px; border: 1px solid #bee3f8; margin: 12px 0;">
      <ul style="font-size: 11px; line-height: 2.0; color: #1a365d; list-style-position: inside;">
        <li><strong>$15 in total private investment</strong> in redevelopment and new construction</li>
        <li><strong>$2 in public investment</strong> from other sources (federal/state grants, other municipal bonds)</li>
        <li><strong>$14 increase in commercial property tax base</strong></li>
        <li><strong>5.75 new jobs</strong> created (per $10,000 of infrastructure investment)</li>
      </ul>
    </div>

    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      For Southborough, a modest investment in Route 9 corridor wastewater infrastructure has the potential to catalyze significant private sector activity, diversify the tax base, reduce the residential tax burden, and position the town as a competitive location for regional commercial and mixed-use development.
    </p>

    ${paragraphs}
  `;

  return buildSectionHTML('About the Route 9 Development District', expandedContent);
}

/**
 * Build approval process section
 */
function buildApprovalProcessSection() {
  return buildSectionHTML('Description of the Approval Process and Legislative Actions', `
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Establishment of a DIF district requires a sequence of municipal approvals and procedural steps, as mandated by MGL Chapter 40Q. The approval process for the Southborough Route 9 DIF District follows the statutory framework:
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Step 1: Public Hearing and Notice</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      The Selectboard schedules a public hearing, providing notice in a local newspaper and to affected property owners at least 14 days in advance. The hearing allows public comment on the DIF proposal.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Step 2: Selectboard Endorsement</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      Following the hearing, the Selectboard votes on whether to endorse the DIF proposal and recommend it to Town Meeting.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Step 3: Finance Committee Review</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      The Finance Committee reviews the financial plan and makes a recommendation to Town Meeting regarding the DIF proposal.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Step 4: Town Meeting Warrant Article</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      A warrant article is included on the Town Meeting warrant. The article requests Town Meeting to vote to establish the DIF district and approve the DIF development program.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Step 5: Assessor Certifications</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      Following Town Meeting approval, the town Assessor provides:
      <ul style="margin-left: 24px; margin-top: 8px; font-size: 12px;">
        <li style="margin-bottom: 4px;">Certification of the Original Assessed Value (OAV) on the base date</li>
        <li style="margin-bottom: 4px;">Certification of the total acreage of the DIF district</li>
      </ul>
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Step 6: Program Commencement</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      With all approvals in place, the DIF district becomes operational. Tax increment begins to be captured as property values increase, and DIF revenues are deposited into the Development District Fund for use in funding the development program.
    </p>
  `);
}

/**
 * Build district information summary table
 */
function buildDistrictInfoSummary(data, stats) {
  const content = `
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 16px;">
      Summary of key data for the Southborough Route 9 Development District and Invested Revenue District Development Program:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
      <tr style="background: #edf2f7; border-bottom: 2px solid #cbd5e0;">
        <td style="padding: 8px 12px; font-size: 11px; font-weight: 600; color: #4a5568; width: 40%;">Parameter</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">Value</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Development District Name</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">Route 9 Development District</td>
      </tr>
      <tr style="background: #f7fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Invested Revenue District Name</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">Route 9 IRD</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Development Program Name</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">Route 9 Corridor Wastewater Infrastructure Program</td>
      </tr>
      <tr style="background: #f7fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Municipality</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">Town of Southborough, Massachusetts</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Date Established</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">${data.programDate}</td>
      </tr>
      <tr style="background: #f7fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Base Valuation Date</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">${data.baseDate}</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Total District Area (acres)</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">${stats.totalAcres.toFixed(2)}</td>
      </tr>
      <tr style="background: #f7fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Percentage of Town Area</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">${((stats.totalAcres / 10048) * 100).toFixed(2)}%</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">DIF Term (years)</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">${data.difTerm}</td>
      </tr>
      <tr style="background: #f7fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Initial Capture Percentage</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">${(data.captureRates?.[0]?.rate * 100) || 50}%</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Administering Entity</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">Town of Southborough / DIF Program Administrator</td>
      </tr>
      <tr style="background: #f7fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Original Assessed Value (OAV)</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748; font-family: monospace;">${formatCurrency(stats.totalVal)}</td>
      </tr>
      <tr style="background: #fff; border-bottom: 2px solid #cbd5e0;">
        <td style="padding: 8px 12px; font-size: 11px; color: #4a5568;">Number of Parcels</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #2d3748;">${stats.count}</td>
      </tr>
    </table>
  `;
  return buildSectionHTML('Development District and Program Information Summary', content);
}

/**
 * Build expanded findings section with statutory language
 */
function buildFindingsSectionExpanded(data, stats) {
  const acreagePercent = (stats.totalAcres / 10048) * 100;

  const findingsList = [
    { key: 'finding1', text: `The Route 9 Development District is appropriately defined and bounded as a compact, cohesive geographic area within the Town of Southborough that is well-suited for coordinated infrastructure investment and economic development. The district encompasses ${stats.count} parcels representing ${stats.totalAcres.toFixed(2)} acres with an Original Assessed Value of ${formatCurrency(stats.totalVal)}.` },
    { key: 'finding2', text: `The district acreage of ${stats.totalAcres.toFixed(2)} acres represents ${acreagePercent.toFixed(2)}% of the Town's total area of 10,048 acres, which does not exceed the 25% maximum permitted under MGL Chapter 40Q §2.` },
    { key: 'finding3', text: `The development program (Route 9 Corridor Wastewater Infrastructure Project) meets the statutory definition of an appropriate development activity under MGL Chapter 40Q §2(c) and is likely to generate substantial new assessed values through removal of development constraints.` },
    { key: 'finding4', text: `The financial plan demonstrates that the Invested Revenue District will generate sufficient tax increment revenues to fund the development program within a reasonable timeframe of a ${data.difTerm}-year term, with a projected surplus for debt service or additional improvements.` },
    { key: 'finding5', text: `The Town of Southborough has followed all procedural requirements including public hearing, Selectboard endorsement, Finance Committee review, Town Meeting vote, and Assessor certifications of Original Assessed Value and district acreage.` }
  ];

  const findingsHTML = findingsList.map((f, idx) => `
    <div style="display: flex; gap: 12px; margin-bottom: 12px; padding: 8px; background: ${data.findings && data.findings[f.key] ? '#f0fff4' : '#fff5f5'}; border-radius: 4px; border: 1px solid ${data.findings && data.findings[f.key] ? '#c6f6d5' : '#fed7d7'};">
      <span style="font-size: 16px; min-width: 20px; flex-shrink: 0;">${data.findings && data.findings[f.key] ? '✓' : '○'}</span>
      <p style="font-size: 11px; line-height: 1.6; color: #2d3748;"><strong>Finding ${idx + 1}:</strong> ${f.text}</p>
    </div>
  `).join('');

  const statutoryText = `
    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">Statutory Requirements (MGL Chapter 40Q §2)</h3>
    <p style="font-size: 11px; line-height: 1.6; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Under MGL Chapter 40Q §2, the Selectboard and Town Meeting must make findings that:
      <ul style="margin-left: 24px; margin-top: 8px; font-size: 11px; line-height: 1.6;">
        <li style="margin-bottom: 4px;">The district is appropriately bounded and defined;</li>
        <li style="margin-bottom: 4px;">The proposed development program will stimulate private capital investment;</li>
        <li style="margin-bottom: 4px;">The development activities are authorized under §2(c);</li>
        <li style="margin-bottom: 4px;">The district will not exceed 25% of municipal area;</li>
        <li style="margin-bottom: 4px;">The Assessor will certify Original Assessed Value (OAV) and acreage;</li>
        <li style="margin-bottom: 4px;">The term shall not exceed 30 years;</li>
        <li style="margin-bottom: 4px;">Tax increment revenues will be sufficient to fund the program.</li>
      </ul>
    </p>
  `;

  return buildSectionHTML('Statement of Findings', `
    <div style="background: #ebf8ff; border: 1px solid #bee3f8; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <p style="font-size: 11px; color: #2b6cb0;"><strong>MGL Chapter 40Q §2 Requirements:</strong> The Town must certify that the DIF district meets all statutory requirements.</p>
    </div>
    ${findingsHTML}
    ${data.findingsNarrative ? `<p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-top: 16px; text-align: justify;">${data.findingsNarrative}</p>` : ''}
    ${statutoryText}
  `);
}

/**
 * Build duration and base date section
 */
function buildDurationSection() {
  return buildSectionHTML('Duration of the DIF District and Base Date', `
    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">The Base Date and Original Assessed Value</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The "base date" is the assessment date on which the Original Assessed Value (OAV) is determined. For the Route 9 Development District, the base date is established at January 1 of the year in which the town votes to establish the district. On this date, the town Assessor determines and certifies the total assessed value of all taxable property in the proposed DIF district. This OAV figure serves as the baseline against which future growth is measured.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">How New Growth Is Measured</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Each year, as properties in the district are reassessed, the Assessor compares the current year's assessed value to the OAV. The difference is "new growth" for that fiscal year. This new growth is multiplied by the district's tax rate to determine the gross property tax revenue attributable to growth. A specified percentage (the "capture rate") of this growth tax revenue is set aside in the DIF development fund; the remainder flows to the general fund and other taxing jurisdictions.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">30-Year Maximum Term</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The DIF district may operate for a maximum of 30 years from its establishment. At the conclusion of this term, the district terminates, and all property tax revenues (including any remaining "new growth" revenues) flow entirely to the general fund and other taxing jurisdictions. The 30-year limit is a statutory constraint designed to prevent indefinite duration of tax increment capture.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Term for Route 9 District</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 Development District is proposed with an initial term sufficient to fund the wastewater infrastructure program and provide a reasonable payback period. The exact term (up to 30 years) will be determined based on the financial plan and the capital cost of the wastewater system.
    </p>
  `);
}

/**
 * Build phase one DIF and special districts section
 */
function buildPhaseOneDIFSection(stats) {
  const acreagePercent = ((stats.totalAcres / 10048) * 100).toFixed(2);
  return buildSectionHTML('Phase One DIF and Other Special Districts', `
    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Phase One DIF District</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 Development District is designed as a "Phase One" or initial-phase DIF district. This designation acknowledges that future phases may be considered if economic conditions and development pressures warrant expansion of the DIF area. However, all phases combined may not exceed 25% of the town's total area.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">No Special Assessment</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      DIF does not impose a special assessment or differential tax rate on properties within the district. The property tax rate applied to all assessed value (both OAV and new growth) in the district is identical to the rate applied outside the district. Only the incremental revenue from new growth is captured; the underlying tax rate remains uniform throughout the municipality.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Compliance with 25% Acreage Limit</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      Route 9 DIF District acreage check:
    </p>

    <div style="background: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px; color: #4a5568;">Town Total Area</td>
          <td style="padding: 6px; text-align: right; color: #2d3748; font-weight: 600;">10,048 acres</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px; color: #4a5568;">25% Limit</td>
          <td style="padding: 6px; text-align: right; color: #2d3748; font-weight: 600;">2,512 acres</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px; color: #4a5568;">Route 9 DIF District Area</td>
          <td style="padding: 6px; text-align: right; color: #2d3748; font-weight: 600;">${stats.totalAcres.toFixed(2)} acres</td>
        </tr>
        <tr style="background: #f0fff4;">
          <td style="padding: 6px; color: #276749; font-weight: 600;">Percentage of Limit</td>
          <td style="padding: 6px; text-align: right; color: #22543d; font-weight: bold;">${acreagePercent}%</td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Compatibility with Other Special Districts</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 DIF District does not conflict with or duplicate any other special districts, overlay zones, or development programs in Southborough. The DIF structure is complementary to local zoning and complements (rather than replaces) other economic development or infrastructure initiatives undertaken by the town.
    </p>
  `);
}

/**
 * Build authorized activities section
 */
function buildAuthorizedActivitiesSection() {
  return buildSectionHTML('Activities Authorized within a DIF District', `
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Under MGL Chapter 40Q §2(c), a Development District may undertake a broad range of authorized activities. The Route 9 Development District is empowered to engage in the following:
    </p>

    <div style="background: #ebf8ff; padding: 12px; border-radius: 6px; border: 1px solid #bee3f8; margin-bottom: 12px;">
      <ol style="font-size: 11px; line-height: 1.8; color: #1a365d; list-style-position: inside; margin-left: 0;">
        <li style="margin-bottom: 6px;"><strong>Acquire or construct:</strong> Purchase land, acquire easements, or construct public improvements and facilities within the district.</li>
        <li style="margin-bottom: 6px;"><strong>Incur indebtedness:</strong> Issue bonds, notes, or other debt instruments to finance development activities.</li>
        <li style="margin-bottom: 6px;"><strong>Create departments or agencies:</strong> Establish administrative entities to manage the district and development program.</li>
        <li style="margin-bottom: 6px;"><strong>Make contracts:</strong> Enter into contracts with public or private entities to implement development activities.</li>
        <li style="margin-bottom: 6px;"><strong>Receive grants:</strong> Accept federal, state, or private grant funds for development purposes.</li>
        <li style="margin-bottom: 6px;"><strong>Exercise eminent domain:</strong> Take property by eminent domain if necessary for authorized development activities.</li>
        <li style="margin-bottom: 6px;"><strong>Relocation payments:</strong> Make payments to relocate affected persons or businesses if necessary.</li>
        <li style="margin-bottom: 6px;"><strong>Clear and improve property:</strong> Clear, demolish, or improve property as needed for development.</li>
        <li style="margin-bottom: 6px;"><strong>Parks, playgrounds, sewers:</strong> Construct public parks, playgrounds, recreation facilities, sewer systems, or water systems.</li>
        <li style="margin-bottom: 6px;"><strong>Lay out or extend roads:</strong> Establish or extend public ways and streets within or bordering the district.</li>
        <li style="margin-bottom: 6px;"><strong>Private ways:</strong> Lay out and construct private roads, driveways, or other private access ways.</li>
        <li style="margin-bottom: 6px;"><strong>Adopt bylaws:</strong> Establish development district bylaws or development program rules.</li>
        <li style="margin-bottom: 6px;"><strong>Sell, mortgage, or lease:</strong> Sell, mortgage, pledge, or lease property or facilities for development purposes.</li>
        <li style="margin-bottom: 6px;"><strong>Invest revenues:</strong> Invest DIF revenues pending use for authorized activities.</li>
        <li style="margin-bottom: 6px;"><strong>All necessary acts:</strong> Do all acts necessary and convenient to carry out the purposes of the district.</li>
      </ol>
    </div>

    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 DIF program is primarily focused on activities (ix) and (x): construction of wastewater infrastructure (sewers and related water quality systems) and related improvements to support development. These activities are core municipal infrastructure initiatives that remove development constraints and enable private sector investment.
    </p>
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
        <p style="font-size: 10px; font-weight: 600; color: #276749;">Original Assessed Value</p>
        <p style="font-size: 20px; font-weight: bold; color: #22543d;">${formatCurrency(totalVal)}</p>
      </div>
      <div style="flex: 1; background: #faf5ff; padding: 12px; border-radius: 6px; border: 1px solid #e9d8fd;">
        <p style="font-size: 10px; font-weight: 600; color: #553c9a;">Total Acres</p>
        <p style="font-size: 24px; font-weight: bold; color: #44337a;">${totalAcres.toFixed(2)}</p>
      </div>
      <div style="flex: 1; background: #fffaf0; padding: 12px; border-radius: 6px; border: 1px solid #feebc8;">
        <p style="font-size: 10px; font-weight: 600; color: #c05621;">25% Limit Check</p>
        <p style="font-size: 20px; font-weight: bold; color: #22543d;">${((totalAcres / (10048 * 0.25)) * 100).toFixed(0)}% of limit</p>
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

  return buildSectionHTML('Development Program', `
    <h3 style="font-size: 14px; font-weight: 600; color: #1a202c; margin-bottom: 12px;">Project Components (Municipal Wastewater System)</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 Development Program consists of the design, permitting, construction, and commissioning of a municipal wastewater collection and treatment system serving the Route 9 corridor and designated portions of Southborough. The system will remove the current reliance on on-site septic systems, enabling intensified commercial development while protecting groundwater and the environment.
    </p>

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
  `);
}

/**
 * Build statement of means and objectives (expanded)
 */
function buildMeansAndObjectivesSection(data) {
  return buildSectionHTML('Statement of Means and Objectives', `
    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Economic Development Goals</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 Development District and DIF Program is designed to achieve the following economic development objectives:
    </p>

    <div style="background: #ebf8ff; padding: 12px; border-radius: 6px; border: 1px solid #bee3f8; margin-bottom: 12px;">
      <ul style="font-size: 11px; line-height: 1.8; color: #1a365d; list-style-position: inside;">
        <li style="margin-bottom: 6px;"><strong>Stimulate private capital investment:</strong> Leverage public wastewater infrastructure investment to attract private sector development capital and redevelopment activity in the corridor.</li>
        <li style="margin-bottom: 6px;"><strong>Encourage existing business expansion:</strong> Enable existing businesses on Route 9 to expand or upgrade operations by removing septic system constraints.</li>
        <li style="margin-bottom: 6px;"><strong>Attract compatible new businesses:</strong> Position the Route 9 corridor to attract new commercial, office, hotel, and mixed-use development aligned with town character and zoning.</li>
        <li style="margin-bottom: 6px;"><strong>Foster property redevelopment:</strong> Enable renovation and intensification of vacant or underutilized commercial properties.</li>
        <li style="margin-bottom: 6px;"><strong>Leverage public improvements:</strong> Maximize the development impact of town infrastructure investment through coordinated public-private partnerships.</li>
        <li style="margin-bottom: 6px;"><strong>Diversify the tax base:</strong> Increase commercial property tax revenues to reduce dependence on residential property taxes.</li>
        <li style="margin-bottom: 6px;"><strong>Stimulate job creation:</strong> Generate employment opportunities through both construction and new commercial operations.</li>
        <li style="margin-bottom: 6px;"><strong>Improve development expediency:</strong> Accelerate the timeline for development approvals and project delivery by providing coordinated infrastructure.</li>
      </ul>
    </div>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Public and Private Partnership Framework</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      ${data.meansAndObjectives || 'The DIF Program is designed to foster collaboration between the Town of Southborough and private developers and property owners. The municipal wastewater system creates the foundation for private investment by removing the development constraint of inadequate on-site sewage disposal. Private property owners and developers respond by investing capital in redevelopment, new construction, and facility improvements. The resulting increase in property values generates tax revenues that reimburse the town for its wastewater infrastructure investment, creating a sustainable virtuous cycle of public-private partnership.'}
    </p>
  `);
}

/**
 * Build relocation plans section
 */
function buildRelocationPlansSection() {
  return buildSectionHTML('Plans for Relocation of Displaced Persons', `
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 DIF Program does not involve the acquisition, demolition, or major reconstruction of any residential structures or occupied commercial buildings. The wastewater infrastructure project consists of the design and installation of underground collection mains, treatment facilities, and related public infrastructure in rights-of-way, public land, or undeveloped areas. No existing residential or commercial tenants or owner-occupants will be displaced as a result of this development program.
    </p>

    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      If, in future phases or modifications of the DIF program, it becomes necessary to acquire private property or relocate persons, the Town will follow applicable state and federal relocation assistance requirements and will provide fair-market compensation and relocation assistance to all affected parties.
    </p>
  `);
}

/**
 * Build housing plans section
 */
function buildHousingPlansSection() {
  return buildSectionHTML('Plans for Housing', `
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 DIF Program is focused on commercial/mixed-use development and does not specifically include residential housing construction as a core component. However, the wastewater infrastructure improvements will indirectly support residential development by making additional density and mixed-use (residential + commercial) development feasible in the corridor, subject to town zoning and planning board approval.
    </p>

    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      No DIF revenues are earmarked specifically for housing production. If the Town later determines that residential housing should be encouraged in the Route 9 corridor, such housing would be subject to separate planning and financing decisions outside the scope of this DIF Program.
    </p>
  `);
}

/**
 * Build operation & management section (expanded)
 */
function buildOperationSection(data) {
  return buildSectionHTML('Operation & Management', `
    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Administering Entity</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      ${data.administringEntity || 'The Town of Southborough, through its designated DIF Program Administrator (typically the Town Manager or a designee), shall serve as the administering entity for the Route 9 Development District. The Administrator shall oversee all aspects of the DIF program, including project implementation, fund management, revenue accounting, and reporting to the Selectboard and Town Meeting.'}
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Route 9 DIF Committee</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Town may establish a Route 9 DIF Advisory Committee comprised of representatives from the Selectboard, Finance Committee, Planning Board, DPW, and the business community. This committee shall:
    </p>

    <div style="background: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
      <ul style="font-size: 11px; line-height: 1.8; color: #2d3748; list-style-position: inside;">
        <li style="margin-bottom: 6px;">Oversee capital project planning and execution</li>
        <li style="margin-bottom: 6px;">Monitor economic development activity and private investment</li>
        <li style="margin-bottom: 6px;">Recommend policies for public-private partnerships and development incentives</li>
        <li style="margin-bottom: 6px;">Review annual DIF revenues and expenditures</li>
        <li style="margin-bottom: 6px;">Coordinate with Planning Board on development review</li>
        <li style="margin-bottom: 6px;">Report to the Selectboard on program progress</li>
      </ul>
    </div>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Fund Management and Deposit</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      ${data.fundFlowNarrative || 'DIF revenues shall be deposited into the Route 9 Development District Fund, a special municipal fund established and maintained by the Town Treasurer. The fund shall be sub-divided into accounts for capital project costs, debt service, and contingency reserves as needed. All DIF revenues and expenditures shall be accounted for separately and reported annually to the Town Meeting.'}
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Percentage Review (5-Year Assessment)</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Every five years, the DIF Program Administrator shall review the capture percentage and make recommendations to the Selectboard regarding adjustments. If economic development has been robust and the payback timeline is accelerated, the capture percentage may be reduced, allowing more revenues to flow to schools and the general fund sooner. Conversely, if development has been slower than projected, the capture percentage may be maintained or adjusted.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Annual Audit and Reporting</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The DIF Fund shall be audited annually as part of the town's comprehensive financial audit. The DIF Program Administrator shall provide an annual report to the Town Meeting detailing:
    </p>

    <div style="background: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
      <ul style="font-size: 11px; line-height: 1.8; color: #2d3748; list-style-position: inside;">
        <li style="margin-bottom: 6px;">Total new growth tax revenues captured in the district</li>
        <li style="margin-bottom: 6px;">DIF fund balance and expenditures</li>
        <li style="margin-bottom: 6px;">Capital projects completed or in progress</li>
        <li style="margin-bottom: 6px;">Private sector investment and development activity</li>
        <li style="margin-bottom: 6px;">Assessed value trends and growth projections</li>
        <li style="margin-bottom: 6px;">Timeline to payback and district termination</li>
      </ul>
    </div>

    ${data.reportingTimeline ? `<h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Reporting Timeline</h3>
    <p style="font-size: 12px; line-height: 1.6; color: #2d3748;">${data.reportingTimeline}</p>` : ''}
  `);
}

/**
 * Build Invested Revenue District section
 */
function buildInvestedRevenueDistrictSection() {
  return buildSectionHTML('Invested Revenue District and IRDDP', `
    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Relationship Between Development District and IRD</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 Invested Revenue District (IRD) is established concurrently with and is coterminous with the Route 9 Development District. The IRD is the geographic area within which tax increment revenues are captured and dedicated to funding the development program. The IRD may be identical to the Development District, or it may be a subset thereof.
    </p>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Invested Revenue District Development Program (IRDDP)</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The IRDDP is the legal document that specifies the activities to be funded by DIF revenues and establishes the governance structure for the IRD. Key components of the Route 9 IRDDP include:
    </p>

    <div style="background: #ebf8ff; padding: 12px; border-radius: 6px; border: 1px solid #bee3f8; margin-bottom: 12px;">
      <ul style="font-size: 11px; line-height: 1.8; color: #1a365d; list-style-position: inside;">
        <li style="margin-bottom: 6px;"><strong>Legal description</strong> of the IRD boundary and parcels</li>
        <li style="margin-bottom: 6px;"><strong>Base date</strong> for OAV determination</li>
        <li style="margin-bottom: 6px;"><strong>Term</strong> of the IRD (up to 30 years)</li>
        <li style="margin-bottom: 6px;"><strong>Capture percentage</strong> schedule for tax increment retention</li>
        <li style="margin-bottom: 6px;"><strong>Description of activities</strong> to be funded by DIF revenues</li>
        <li style="margin-bottom: 6px;"><strong>Financial plan</strong> projecting revenues and expenditures</li>
        <li style="margin-bottom: 6px;"><strong>Governance structure</strong> and administrator responsibilities</li>
        <li style="margin-bottom: 6px;"><strong>Annual reporting requirements</strong> and audit procedures</li>
      </ul>
    </div>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Tax Increment Capture and Flow of Funds</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      Each fiscal year, the Town Assessor determines the new growth assessed value within the IRD. A percentage (the "capture rate") of the property tax revenue attributable to this new growth is deposited into the DIF Fund. The remaining percentage flows to the general fund and other taxing jurisdictions (schools, county, regional authorities, etc.). This split ensures that the municipalities and schools benefit immediately from growth even while the town finances its development program through captured increment.
    </p>
  `);
}

/**
 * Build expanded financial plan section
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
    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 12px;">Capital Project Costs</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Route 9 Corridor Wastewater Infrastructure Project has been engineered and scoped to include all necessary elements for a functioning municipal system. The total estimated project cost is ${formatCurrency(projectCost)}.
    </p>

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

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Tax Increment Retention and Dedication</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      The Town of Southborough hereby dedicates and retains the following percentages of property tax increment revenues generated within the Route 9 IRD for the purpose of funding the wastewater infrastructure development program:
    </p>

    <div style="background: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
      <p style="font-size: 11px; color: #4a5568; margin-bottom: 8px;">
        <strong>Years 1-10:</strong> ${(data.captureRates?.[0]?.rate * 100) || 50}% of new growth tax revenue
      </p>
      ${data.captureRates && data.captureRates.length > 1 ? `
        <p style="font-size: 11px; color: #4a5568; margin-bottom: 8px;">
          <strong>Years 11-25:</strong> ${(data.captureRates[1]?.rate * 100) || 25}% of new growth tax revenue
        </p>
      ` : ''}
      <p style="font-size: 11px; color: #4a5568; margin-bottom: 0;">
        <strong>Remainder of Term:</strong> 100% of new growth tax revenue flows to general fund
      </p>
    </div>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Fund Structure</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      DIF revenues shall be organized into the following fund structure:
    </p>

    <div style="background: #ebf8ff; padding: 12px; border-radius: 6px; border: 1px solid #bee3f8; margin-bottom: 12px;">
      <p style="font-size: 11px; color: #1a365d; margin-bottom: 8px;">
        <strong>Development District Fund (Primary):</strong> Receives all captured tax increment revenues
      </p>
      <ul style="font-size: 11px; line-height: 1.6; color: #1a365d; list-style-position: inside; margin-left: 12px; margin-bottom: 8px;">
        <li style="margin-bottom: 4px;">Project Cost Account — funds capital improvements</li>
        <li style="margin-bottom: 4px;">Debt Service Account — funds bond payments (if applicable)</li>
        <li style="margin-bottom: 4px;">Contingency Reserve — maintains buffer for cost overruns</li>
      </ul>
    </div>

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-bottom: 8px;">Impact on Taxing Jurisdictions</h3>
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px; text-align: justify;">
      While a portion of new growth tax revenues is captured for DIF purposes, all schools and other taxing jurisdictions continue to receive their proportional share of new growth revenues at the normal statutory percentages. The capture does not reduce the absolute amount of revenue flowing to schools or reduce the total municipal resources available. Rather, it redirects a portion of incremental new revenue to fund the infrastructure that makes that new growth possible. Over the long term (after the DIF term expires), schools and other jurisdictions benefit from permanently higher assessed values and tax revenues resulting from the development enabled by DIF-funded infrastructure.
    </p>

    <div style="background: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
      <p style="font-size: 11px; color: #2d3748;"><strong>Parameters:</strong> DIF Term: ${data.difTerm} years | Tax Rate: $${data.taxRate}/1,000 | Annual Growth: ${data.annualGrowthRate}% | Initial Capture: ${(data.captureRates?.[0]?.rate * 100) || 50}%</p>
      ${paybackYear ? `<p style="font-size: 11px; color: #276749; margin-top: 4px;"><strong>Projected Payback Period:</strong> Year ${paybackYear}</p>` : ''}
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
 * Build tax increment retention schedule (30-year table)
 */
function buildTaxIncrementSchedule(data) {
  const baseYear = new Date(data.baseDate).getFullYear();
  const rows = [];

  for (let i = 0; i < data.difTerm; i++) {
    const year = i + 1;
    const fyYear = baseYear + i + 1;
    let capturePercent = 50;

    if (data.captureRates) {
      let yearsElapsed = 0;
      for (let rate of data.captureRates) {
        if (i < yearsElapsed + rate.years) {
          capturePercent = rate.rate * 100;
          break;
        }
        yearsElapsed += rate.years;
      }
    }

    rows.push(`
      <tr style="background: ${i % 2 === 0 ? '#fff' : '#f7fafc'}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 3px 6px; font-size: 9px; text-align: center; color: #4a5568;">${year}</td>
        <td style="padding: 3px 6px; font-size: 9px; text-align: center; color: #4a5568;">FY ${fyYear}</td>
        <td style="padding: 3px 6px; font-size: 9px; text-align: center; color: #2b6cb0; font-weight: 600;">${capturePercent.toFixed(0)}%</td>
      </tr>
    `);
  }

  return buildSectionHTML('Tax Increment Retention Schedule', `
    <p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 12px;">
      The following table shows the capture percentage for each year of the DIF district term. The percentage may vary over time as specified in the IRDDP, with reductions occurring as the payback timeline accelerates.
    </p>

    <table style="width: 60%; border-collapse: collapse; margin: 0 auto;">
      <thead>
        <tr style="background: #edf2f7; border-bottom: 2px solid #cbd5e0;">
          <th style="text-align: center; padding: 6px; font-size: 10px; font-weight: 600; color: #4a5568;">Year</th>
          <th style="text-align: center; padding: 6px; font-size: 10px; font-weight: 600; color: #4a5568;">FY Ending</th>
          <th style="text-align: center; padding: 6px; font-size: 10px; font-weight: 600; color: #4a5568;">Capture %</th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
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
    <p style="font-size: 12px; line-height: 1.6; color: #2d3748; margin-bottom: 16px;">
      The wastewater infrastructure project will be funded through a combination of sources: DIF captured revenues, municipal bonds, state and federal grants, and private contributions from property owners and developers benefiting from the infrastructure. The following breakdown illustrates the anticipated funding mix based on comparable projects in Massachusetts and the Yarmouth DIF precedent.
    </p>

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

    <h3 style="font-size: 13px; font-weight: 600; color: #1a202c; margin-top: 16px; margin-bottom: 8px;">Funding Source Details</h3>
    <p style="font-size: 11px; line-height: 1.6; color: #2d3748; margin-bottom: 8px;">
      <strong>DIF Revenues:</strong> Captured tax increment from new growth within the district. Primary funding source for long-term sustainability.
    </p>
    <p style="font-size: 11px; line-height: 1.6; color: #2d3748; margin-bottom: 8px;">
      <strong>Municipal Bonds:</strong> Bonds issued by the Town backed by DIF revenues and general fund support. Allows upfront funding of project costs.
    </p>
    <p style="font-size: 11px; line-height: 1.6; color: #2d3748; margin-bottom: 8px;">
      <strong>State/Federal Grants:</strong> Environmental or infrastructure grants from USDA, EPA, Mass DEP, or other state/federal programs.
    </p>
    <p style="font-size: 11px; line-height: 1.6; color: #2d3748;">
      <strong>Private Contributions:</strong> Connection fees, development agreements, or direct investment from property owners benefiting from infrastructure.
    </p>
  `);
}

/**
 * Build justification narrative
 */
function buildJustificationSection(data) {
  const paragraphs = data.justificationNarrative.split('\n\n').map(p => {
    const trimmed = p.trim();
    if (trimmed.length < 80 && !trimmed.includes('.') && !trimmed.startsWith('-')) {
      return `<h3 style="font-size: 14px; font-weight: 600; color: #1a365d; margin: 16px 0 8px 0;">${trimmed}</h3>`;
    }
    return `<p style="font-size: 12px; line-height: 1.7; color: #2d3748; margin-bottom: 10px; text-align: justify;">${trimmed}</p>`;
  }).join('');

  return buildSectionHTML('Justification Narrative', paragraphs);
}

/**
 * Build appendices checklist (expanded)
 */
function buildAppendicesSection(data) {
  const appendices = data.appendices || {};
  const items = [
    { key: 'map', label: 'District Map (showing all parcels and district boundaries)' },
    { key: 'townVote', label: 'Town Meeting/Town Council Vote (establishing DIF)' },
    { key: 'acreageCert', label: "Assessor's Certification of Acreage" },
    { key: 'oavCert', label: "Assessor's Certification of Original Assessed Value (OAV)" },
    { key: 'parcelList', label: 'Complete Parcel List (with use codes and values)' },
    { key: 'activitiesAuth', label: 'Activities Authorized (MGL 40Q §2(c))' },
    { key: 'legalDesc', label: 'Legal Description and Deed References for District Boundary' },
    { key: 'publicHearing', label: 'Notice of Public Hearing and Hearing Minutes' },
    { key: 'selectboardEndorse', label: 'Selectboard Endorsement Vote and Minutes' },
    { key: 'financeCommEndorse', label: 'Finance Committee Recommendation and Vote' }
  ];

  const checksHTML = items.map(item => `
    <div style="display: flex; gap: 10px; margin-bottom: 8px; padding: 6px 0;">
      <span style="font-size: 14px;">${appendices[item.key] ? '☑' : '☐'}</span>
      <span style="font-size: 12px; color: #2d3748;">${item.label}</span>
    </div>
  `).join('');

  return buildSectionHTML('Required Appendices', `
    <p style="font-size: 12px; color: #4a5568; margin-bottom: 16px;">The following appendices should be compiled and attached to the DIF Proposal as supporting documentation for approvals and administrative record:</p>
    ${checksHTML}
  `);
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

  // Build all section HTML in order
  const sections = [
    buildCoverPage(data),
    buildTableOfContents(),
    buildIntroduction(data),
    buildAboutDIFSection(),
    buildDistrictSectionExpanded(data),
    buildApprovalProcessSection(),
    buildDistrictInfoSummary(data, stats),
    buildFindingsSectionExpanded(data, stats),
    buildDurationSection(),
    buildPhaseOneDIFSection(stats),
    buildAuthorizedActivitiesSection(),
    buildParcelSection(selectedParcels),
    buildDevelopmentProgramSection(data),
    buildMeansAndObjectivesSection(data),
    buildRelocationPlansSection(),
    buildHousingPlansSection(),
    buildOperationSection(data),
    buildInvestedRevenueDistrictSection(),
    buildFinancialPlanSection(data, stats, projections, projectCost),
    buildTaxIncrementSchedule(data),
    buildFundingSourcesSection(data),
    buildJustificationSection(data),
    buildAppendicesSection(data)
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
