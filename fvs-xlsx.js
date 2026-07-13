/*
 * Minimal offline XLSX reader/writer for plOtter FVS.
 * Supports the tabular .xlsx files used by this application.
 * Requires JSZip 3.x (loaded first as vendor/jszip.min.js).
 */
(function (root) {
  'use strict';

  const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const MAIN_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const PACKAGE_REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const CONTENT_TYPES_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';

  function requireJSZip() {
    if (!root.JSZip) {
      throw new Error('JSZip is not available. Load vendor/jszip.min.js before fvs-xlsx.js.');
    }
    return root.JSZip;
  }

  function sanitizeXmlText(value) {
    return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '\uFFFD');
  }

  function xmlText(value) {
    return sanitizeXmlText(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function xmlAttr(value) {
    return xmlText(value)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function columnName(index) {
    let value = index + 1;
    let out = '';
    while (value > 0) {
      value -= 1;
      out = String.fromCharCode(65 + (value % 26)) + out;
      value = Math.floor(value / 26);
    }
    return out;
  }

  function columnIndex(reference) {
    const match = String(reference || '').match(/^([A-Z]+)/i);
    if (!match) return 0;
    let value = 0;
    for (const char of match[1].toUpperCase()) {
      value = value * 26 + char.charCodeAt(0) - 64;
    }
    return value - 1;
  }

  function safeSheetName(name, usedNames) {
    const base = String(name || 'Sheet')
      .replace(/[\\/*?:[\]]/g, ' ')
      .trim()
      .slice(0, 31) || 'Sheet';
    let candidate = base;
    let counter = 2;
    while (usedNames.has(candidate.toLowerCase())) {
      const suffix = ` (${counter})`;
      candidate = base.slice(0, Math.max(1, 31 - suffix.length)) + suffix;
      counter += 1;
    }
    usedNames.add(candidate.toLowerCase());
    return candidate;
  }

  function cellXml(value, reference) {
    if (value === null || value === undefined || value === '') return '';

    if (typeof value === 'number' && Number.isFinite(value)) {
      return `<c r="${reference}"><v>${value}</v></c>`;
    }

    if (typeof value === 'boolean') {
      return `<c r="${reference}" t="b"><v>${value ? 1 : 0}</v></c>`;
    }

    const text = value instanceof Date ? value.toISOString() : String(value);
    const preserve = /^\s|\s$|[\r\n\t]/.test(text) ? ' xml:space="preserve"' : '';
    return `<c r="${reference}" t="inlineStr"><is><t${preserve}>${xmlText(text)}</t></is></c>`;
  }

  function worksheetXml(headers, rows) {
    const matrix = [headers].concat(rows.map((row) => headers.map((header) => row?.[header] ?? '')));
    const rowParts = [];

    matrix.forEach((row, rowIndex) => {
      const cellParts = [];
      row.forEach((value, columnIndexValue) => {
        const ref = `${columnName(columnIndexValue)}${rowIndex + 1}`;
        const cell = cellXml(value, ref);
        if (cell) cellParts.push(cell);
      });
      rowParts.push(`<row r="${rowIndex + 1}">${cellParts.join('')}</row>`);
    });

    const lastColumn = columnName(Math.max(0, headers.length - 1));
    const lastRow = Math.max(1, matrix.length);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="${MAIN_NS}" xmlns:r="${REL_NS}">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${rowParts.join('')}</sheetData>
</worksheet>`;
  }

  function workbookXml(sheetNames) {
    const sheets = sheetNames.map((name, index) =>
      `<sheet name="${xmlAttr(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
    ).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="${MAIN_NS}" xmlns:r="${REL_NS}">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>
  <sheets>${sheets}</sheets>
  <calcPr calcId="191029"/>
</workbook>`;
  }

  function workbookRelsXml(sheetCount) {
    const relationships = [];
    for (let index = 0; index < sheetCount; index += 1) {
      relationships.push(
        `<Relationship Id="rId${index + 1}" Type="${REL_NS}/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
      );
    }
    relationships.push(
      `<Relationship Id="rId${sheetCount + 1}" Type="${REL_NS}/styles" Target="styles.xml"/>`
    );
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${PACKAGE_REL_NS}">${relationships.join('')}</Relationships>`;
  }

  function contentTypesXml(sheetCount) {
    const worksheets = [];
    for (let index = 0; index < sheetCount; index += 1) {
      worksheets.push(
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
      );
    }
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="${CONTENT_TYPES_NS}">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${worksheets.join('\n  ')}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
  }

  function rootRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${PACKAGE_REL_NS}">
  <Relationship Id="rId1" Type="${REL_NS}/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="${REL_NS}/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
  }

  function stylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="${MAIN_NS}">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
  }

  function coreXml() {
    const stamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>plOtter FVS PWA</dc:creator>
  <cp:lastModifiedBy>plOtter FVS PWA</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${stamp}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${stamp}</dcterms:modified>
</cp:coreProperties>`;
  }

  function appXml(sheetNames) {
    const titles = sheetNames.map((name) => `<vt:lpstr>${xmlText(name)}</vt:lpstr>`).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>plOtter FVS PWA</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheetNames.length}</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="${sheetNames.length}" baseType="lpstr">${titles}</vt:vector></TitlesOfParts>
  <Company>BIA Division of Forestry</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>1.2</AppVersion>
</Properties>`;
  }

  async function writeWorkbook(sheetDefinitions) {
    const JSZip = requireJSZip();
    if (!Array.isArray(sheetDefinitions) || sheetDefinitions.length === 0) {
      throw new Error('At least one worksheet is required.');
    }

    const usedNames = new Set();
    const sheets = sheetDefinitions.map((sheet) => {
      const headers = Array.isArray(sheet.headers) ? sheet.headers.map(String) : [];
      if (!headers.length) throw new Error(`Worksheet ${sheet.name || ''} has no headers.`);
      return {
        name: safeSheetName(sheet.name, usedNames),
        headers,
        rows: Array.isArray(sheet.rows) ? sheet.rows : []
      };
    });

    const zip = new JSZip();
    zip.file('[Content_Types].xml', contentTypesXml(sheets.length));
    zip.folder('_rels').file('.rels', rootRelsXml());
    zip.folder('docProps').file('core.xml', coreXml()).file('app.xml', appXml(sheets.map((s) => s.name)));
    zip.folder('xl').file('workbook.xml', workbookXml(sheets.map((s) => s.name))).file('styles.xml', stylesXml());
    zip.folder('xl').folder('_rels').file('workbook.xml.rels', workbookRelsXml(sheets.length));
    const worksheetFolder = zip.folder('xl').folder('worksheets');
    sheets.forEach((sheet, index) => {
      worksheetFolder.file(`sheet${index + 1}.xml`, worksheetXml(sheet.headers, sheet.rows));
    });

    return zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
      platform: 'DOS'
    });
  }

  function parseXml(xml, label) {
    if (typeof root.DOMParser !== 'function') {
      throw new Error('DOMParser is not available in this browser.');
    }
    const document = new root.DOMParser().parseFromString(xml, 'application/xml');
    const errors = document.getElementsByTagName('parsererror');
    if (errors && errors.length) {
      throw new Error(`Invalid XML in ${label || 'workbook part'}.`);
    }
    return document;
  }

  function elementsByLocalName(node, name) {
    if (node.getElementsByTagNameNS) {
      const namespaced = node.getElementsByTagNameNS('*', name);
      if (namespaced && namespaced.length) return Array.from(namespaced);
    }
    return Array.from(node.getElementsByTagName(name));
  }

  function childByLocalName(node, name) {
    const matches = elementsByLocalName(node, name);
    return matches.length ? matches[0] : null;
  }

  function textNodes(node, localName) {
    return elementsByLocalName(node, localName).map((item) => item.textContent || '').join('');
  }

  function normalizePartPath(base, target) {
    if (!target) return '';
    if (target.startsWith('/')) return target.replace(/^\/+/, '');
    const stack = base.split('/').filter(Boolean);
    for (const part of target.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
    }
    return stack.join('/');
  }

  function relationshipId(sheetNode) {
    return sheetNode.getAttributeNS?.(REL_NS, 'id') ||
      sheetNode.getAttribute('r:id') ||
      sheetNode.getAttribute('id') || '';
  }

  function dateStyleIndexes(stylesDocument) {
    if (!stylesDocument) return new Set();
    const dateNumFmtIds = new Set([
      14, 15, 16, 17, 18, 19, 20, 21, 22,
      27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
      45, 46, 47, 50, 51, 52, 53, 54, 55, 56, 57, 58
    ]);

    for (const node of elementsByLocalName(stylesDocument, 'numFmt')) {
      const id = Number(node.getAttribute('numFmtId'));
      const code = String(node.getAttribute('formatCode') || '')
        .replace(/"[^"]*"/g, '')
        .replace(/\\./g, '')
        .replace(/\[[^\]]*\]/g, '');
      if (/[ymdhis]/i.test(code)) dateNumFmtIds.add(id);
    }

    const cellXfs = elementsByLocalName(stylesDocument, 'cellXfs')[0];
    if (!cellXfs) return new Set();
    const dateStyles = new Set();
    Array.from(cellXfs.childNodes || []).filter((node) => node.nodeType === 1).forEach((xf, index) => {
      if (dateNumFmtIds.has(Number(xf.getAttribute('numFmtId') || 0))) dateStyles.add(index);
    });
    return dateStyles;
  }

  function excelDate(serial, date1904) {
    if (!Number.isFinite(serial)) return '';
    const dayMs = 86400000;
    const base = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30);
    const date = new Date(base + serial * dayMs);
    if (Number.isNaN(date.getTime())) return serial;
    const iso = date.toISOString();
    return Math.abs(serial - Math.round(serial)) < 1e-9 ? iso.slice(0, 10) : iso.replace(/\.000Z$/, 'Z');
  }

  function worksheetObjects(document, sharedStrings, dateStyles, date1904) {
    const matrix = [];
    for (const rowNode of elementsByLocalName(document, 'row')) {
      const rowNumber = Math.max(1, Number(rowNode.getAttribute('r') || matrix.length + 1));
      const row = matrix[rowNumber - 1] || [];
      const cells = Array.from(rowNode.childNodes || []).filter((node) => node.nodeType === 1 && (node.localName === 'c' || node.nodeName === 'c'));
      for (const cell of cells) {
        const reference = cell.getAttribute('r') || '';
        const index = columnIndex(reference);
        const type = cell.getAttribute('t') || '';
        const styleIndex = Number(cell.getAttribute('s') || 0);
        const valueNode = childByLocalName(cell, 'v');
        const raw = valueNode ? valueNode.textContent || '' : '';
        let value = '';

        if (type === 'inlineStr') {
          const inlineNode = childByLocalName(cell, 'is');
          value = inlineNode ? textNodes(inlineNode, 't') : '';
        } else if (type === 's') {
          value = sharedStrings[Number(raw)] ?? '';
        } else if (type === 'b') {
          value = raw === '1';
        } else if (type === 'str' || type === 'd') {
          value = raw;
        } else if (type === 'e') {
          value = '';
        } else if (raw !== '') {
          const numeric = Number(raw);
          if (Number.isFinite(numeric)) {
            value = dateStyles.has(styleIndex) ? excelDate(numeric, date1904) : numeric;
          } else {
            value = raw;
          }
        }
        row[index] = value;
      }
      matrix[rowNumber - 1] = row;
    }

    let headerIndex = matrix.findIndex((row) => Array.isArray(row) && row.some((value) => value !== '' && value !== undefined));
    if (headerIndex < 0) return [];
    const headers = matrix[headerIndex].map((value) => String(value ?? '').trim());
    const objects = [];

    for (let index = headerIndex + 1; index < matrix.length; index += 1) {
      const row = matrix[index] || [];
      if (!row.some((value) => value !== '' && value !== undefined && value !== null)) continue;
      const object = {};
      headers.forEach((header, column) => {
        if (header) object[header] = row[column] ?? '';
      });
      objects.push(object);
    }
    return objects;
  }

  async function readWorkbook(data) {
    const JSZip = requireJSZip();
    const zip = await JSZip.loadAsync(data);

    async function readPart(path, required = true) {
      const file = zip.file(path);
      if (!file) {
        if (required) throw new Error(`Workbook part is missing: ${path}`);
        return '';
      }
      return file.async('string');
    }

    const workbookDocument = parseXml(await readPart('xl/workbook.xml'), 'xl/workbook.xml');
    const relsDocument = parseXml(await readPart('xl/_rels/workbook.xml.rels'), 'xl/_rels/workbook.xml.rels');
    const relationships = new Map();
    for (const rel of elementsByLocalName(relsDocument, 'Relationship')) {
      relationships.set(rel.getAttribute('Id'), rel.getAttribute('Target'));
    }

    const sharedStringsXml = await readPart('xl/sharedStrings.xml', false);
    const sharedStrings = [];
    if (sharedStringsXml) {
      const sharedDocument = parseXml(sharedStringsXml, 'xl/sharedStrings.xml');
      for (const item of elementsByLocalName(sharedDocument, 'si')) {
        sharedStrings.push(textNodes(item, 't'));
      }
    }

    const stylesXmlText = await readPart('xl/styles.xml', false);
    const stylesDocument = stylesXmlText ? parseXml(stylesXmlText, 'xl/styles.xml') : null;
    const dateStyles = dateStyleIndexes(stylesDocument);
    const workbookProperties = elementsByLocalName(workbookDocument, 'workbookPr')[0];
    const date1904 = workbookProperties?.getAttribute('date1904') === '1' || workbookProperties?.getAttribute('date1904') === 'true';

    const SheetNames = [];
    const Sheets = {};
    for (const sheetNode of elementsByLocalName(workbookDocument, 'sheet')) {
      const name = sheetNode.getAttribute('name') || `Sheet${SheetNames.length + 1}`;
      const target = relationships.get(relationshipId(sheetNode));
      if (!target) continue;
      const partPath = normalizePartPath('xl', target);
      const worksheetDocument = parseXml(await readPart(partPath), partPath);
      SheetNames.push(name);
      Sheets[name] = worksheetObjects(worksheetDocument, sharedStrings, dateStyles, date1904);
    }

    return { SheetNames, Sheets };
  }

  root.FVSXLSX = Object.freeze({
    writeWorkbook,
    readWorkbook,
    version: '1.0.0'
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
