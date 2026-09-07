import { Camioneta, Operador, Ruta } from '../types';

export interface ParsedEmbarque {
  id?: string;
  fecha: string;
  unidad: string;
  claveOperador: string;
  nombreOperador: string;
  placas: string;
  modelo: string;
  claveRuta: string;
  nombreRuta: string;
  inicioEmbarque: string; // Hora Entrada
  pedidos: string;
  horaSalida: string;
  kmSalida: string;
  gasolinaSalida: string;
  observaciones: string;
  matchedUnidad?: Camioneta;
  matchedOperador?: Operador;
  matchedRuta?: Ruta;
}

/**
 * Normalizes strings for matching (removes accents, trims, uppercase)
 */
export function normalizeStr(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

/**
 * Validates and searches an Operador bi-directionally:
 * If given an operator code (clave), returns the full operator with its name.
 * If given an operator name (or partial name), returns the full operator with its code.
 */
export function findMatchingOperador(
  query: string,
  operadores: Operador[]
): Operador | undefined {
  if (!query || !query.trim()) return undefined;
  const qClean = normalizeStr(query);
  const qAlphaNum = qClean.replace(/[^A-Z0-9]/g, '');

  // 1. Direct match by exact clave (e.g. "CO6", "CO1")
  const byClave = operadores.find(
    (o) =>
      normalizeStr(o.clave) === qClean ||
      o.clave.replace(/[^A-Z0-9]/gi, '').toUpperCase() === qAlphaNum
  );
  if (byClave) return byClave;

  // 2. Direct match by exact nombre
  const byExactName = operadores.find((o) => normalizeStr(o.nombre) === qClean);
  if (byExactName) return byExactName;

  // 3. Substring match (either name contains query, or query contains full name)
  const byIncludes = operadores.find(
    (o) =>
      normalizeStr(o.nombre).includes(qClean) ||
      (qClean.length > 3 && qClean.includes(normalizeStr(o.nombre)))
  );
  if (byIncludes) return byIncludes;

  // 4. Tokenized match (e.g. "Erick Montaño" matching "ERICK DAVID MONTAÑO BERNAL")
  const tokens = qClean.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length > 0) {
    const byAllTokens = operadores.find((o) => {
      const normName = normalizeStr(o.nombre);
      return tokens.every((tok) => normName.includes(tok));
    });
    if (byAllTokens) return byAllTokens;

    // Significant token (4 or more characters)
    const significantTokens = tokens.filter((t) => t.length >= 4);
    if (significantTokens.length > 0) {
      const byAnySig = operadores.find((o) => {
        const normName = normalizeStr(o.nombre);
        return significantTokens.some((tok) => normName.includes(tok));
      });
      if (byAnySig) return byAnySig;
    }
  }

  return undefined;
}

/**
 * Validates and searches a Ruta bi-directionally:
 * If given a route code (codigo), returns the full ruta with its official name.
 * If given a route name (nombre), returns the full ruta with its code.
 */
export function findMatchingRuta(
  query: string,
  rutas: Ruta[]
): Ruta | undefined {
  if (!query || !query.trim()) return undefined;
  const qClean = normalizeStr(query);
  const qAlphaNum = qClean.replace(/[^A-Z0-9]/g, '');

  // 1. Direct match by exact codigo (e.g. "M01", "R10")
  const byCode = rutas.find(
    (r) =>
      normalizeStr(r.codigo) === qClean ||
      r.codigo.replace(/[^A-Z0-9]/gi, '').toUpperCase() === qAlphaNum
  );
  if (byCode) return byCode;

  // 2. Direct match by exact nombre (e.g. "MARAVATIO", "TOLUCA")
  const byExactName = rutas.find((r) => normalizeStr(r.nombre) === qClean);
  if (byExactName) return byExactName;

  // 3. Substring match (either route name contains query, or query contains route name)
  const byIncludes = rutas.find(
    (r) =>
      normalizeStr(r.nombre).includes(qClean) ||
      (qClean.length >= 3 && qClean.includes(normalizeStr(r.nombre)))
  );
  if (byIncludes) return byIncludes;

  // 4. Tokenized match
  const tokens = qClean.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length > 0) {
    const byTokens = rutas.find((r) => {
      const combined = normalizeStr(r.nombre) + ' ' + normalizeStr(r.codigo);
      return tokens.every((tok) => combined.includes(tok));
    });
    if (byTokens) return byTokens;
  }

  return undefined;
}

/**
 * Validates and searches a Camioneta in catalog:
 * Matches by clave ("NPBNV"), placa ("U87-BNV"), or clave TOKA ("TK-1018").
 */
export function findMatchingCamioneta(
  query: string,
  camionetas: Camioneta[]
): Camioneta | undefined {
  if (!query || !query.trim()) return undefined;
  const qClean = normalizeStr(query);
  const qAlphaNum = qClean.replace(/[^A-Z0-9]/g, '');

  // 1. By Clave
  const byClave = camionetas.find(
    (c) =>
      normalizeStr(c.clave) === qClean ||
      c.clave.replace(/[^A-Z0-9]/gi, '').toUpperCase() === qAlphaNum
  );
  if (byClave) return byClave;

  // 2. By Placa
  const byPlaca = camionetas.find(
    (c) =>
      normalizeStr(c.placa) === qClean ||
      c.placa.replace(/[^A-Z0-9]/gi, '').toUpperCase() === qAlphaNum
  );
  if (byPlaca) return byPlaca;

  // 3. By Clave TOKA
  const byToka = camionetas.find((c) => {
    if (!c.claveToka) return false;
    const cToka = normalizeStr(c.claveToka);
    return (
      cToka === qClean ||
      c.claveToka.replace(/[^A-Z0-9]/gi, '').toUpperCase() === qAlphaNum
    );
  });
  if (byToka) return byToka;

  return undefined;
}

/**
 * Parses date string into YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  const clean = dateStr.trim();
  const today = new Date().toISOString().split('T')[0];
  if (!clean) return today;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YY
  const dmyShortMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
  if (dmyShortMatch) {
    const [, d, m, y] = dmyShortMatch;
    return `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return today;
}

/**
 * Normalizes time string into HH:mm format
 */
function normalizeTime(timeStr: string): string {
  const clean = timeStr.trim().toLowerCase();
  if (!clean) return '';

  const match = clean.match(/(\d{1,2}):(\d{2})(?:\s*(am|pm))?/);
  if (!match) return clean;

  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = match[3];

  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;

  return `${String(h).padStart(2, '0')}:${m}`;
}

/**
 * Intelligently comprehends and parses raw pasted text into one or more structured Embarques.
 */
export function parseEmbarqueText(
  rawText: string,
  camionetas: Camioneta[] = [],
  operadores: Operador[] = [],
  rutas: Ruta[] = []
): ParsedEmbarque[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  // 1. Check if input is JSON (single object or array)
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map((item, idx) =>
        enrichParsedEmbarque(
          {
            fecha: item.fecha || todayStr,
            unidad: item.unidad || item.camioneta || item.unit || '',
            claveOperador: item.claveOperador || item.claveOp || '',
            nombreOperador: item.nombreOperador || item.operador || item.chofer || '',
            placas: item.placas || item.placa || '',
            modelo: item.modelo || '',
            claveRuta: item.claveRuta || item.codigoRuta || '',
            nombreRuta: item.nombreRuta || item.ruta || item.destino || '',
            inicioEmbarque: item.inicioEmbarque || item.horaEntrada || item.entrada || currentTime,
            pedidos: String(item.pedidos || item.numPedidos || item.ordenes || ''),
            horaSalida: item.horaSalida || item.salida || '',
            kmSalida: String(item.kmSalida || item.km || ''),
            gasolinaSalida: item.gasolinaSalida || item.gasolina || '',
            observaciones: item.observaciones || item.notas || '',
          },
          camionetas,
          operadores,
          rutas,
          idx
        )
      );
    } catch {
      // Fallback to text parsing if JSON parse failed
    }
  }

  // 2. Check if text is tabular (e.g. from Excel with Tabs \t)
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const isTabular = lines.some((l) => l.includes('\t'));

  if (isTabular && lines.length > 0) {
    const firstLineCols = lines[0].split('\t').map((c) => normalizeStr(c));
    const hasHeader =
      firstLineCols.some((c) => c.includes('UNIDAD') || c.includes('CAMIONETA') || c.includes('OPERADOR') || c.includes('RUTA'));

    let headerMap: Record<string, number> = {};
    let dataRows = lines;

    if (hasHeader) {
      firstLineCols.forEach((col, idx) => {
        if (col.includes('FECHA')) headerMap.fecha = idx;
        else if (col.includes('UNIDAD') || col.includes('CAMIONETA')) headerMap.unidad = idx;
        else if (col.includes('CLAVE OP') || col.includes('CVE OP')) headerMap.claveOp = idx;
        else if (col.includes('OPERADOR') || col.includes('CHOFER')) headerMap.operador = idx;
        else if (col.includes('PLACA')) headerMap.placas = idx;
        else if (col.includes('MODELO')) headerMap.modelo = idx;
        else if (col.includes('CLAVE RUTA') || col.includes('CVE RUTA')) headerMap.claveRuta = idx;
        else if (col.includes('RUTA') || col.includes('DESTINO')) headerMap.ruta = idx;
        else if (col.includes('PEDIDO') || col.includes('ORDEN')) headerMap.pedidos = idx;
        else if (col.includes('ENTRADA') || col.includes('INI EMB') || col.includes('INICIO')) headerMap.entrada = idx;
        else if (col.includes('SALIDA') && !col.includes('KM') && !col.includes('GAS')) headerMap.salida = idx;
        else if (col.includes('KM')) headerMap.km = idx;
        else if (col.includes('GAS')) headerMap.gasolina = idx;
      });
      dataRows = lines.slice(1);
    }

    const results: ParsedEmbarque[] = [];
    dataRows.forEach((row, idx) => {
      const cols = row.split('\t').map((c) => c.trim());
      if (cols.length < 2) return;

      const raw: Partial<ParsedEmbarque> = {
        fecha: headerMap.fecha !== undefined ? cols[headerMap.fecha] : todayStr,
        unidad: headerMap.unidad !== undefined ? cols[headerMap.unidad] : cols[0] || '',
        claveOperador: headerMap.claveOp !== undefined ? cols[headerMap.claveOp] : '',
        nombreOperador: headerMap.operador !== undefined ? cols[headerMap.operador] : cols[1] || '',
        placas: headerMap.placas !== undefined ? cols[headerMap.placas] : '',
        modelo: headerMap.modelo !== undefined ? cols[headerMap.modelo] : '',
        claveRuta: headerMap.claveRuta !== undefined ? cols[headerMap.claveRuta] : '',
        nombreRuta: headerMap.ruta !== undefined ? cols[headerMap.ruta] : cols[2] || '',
        pedidos: headerMap.pedidos !== undefined ? cols[headerMap.pedidos] : cols[3] || '',
        inicioEmbarque: headerMap.entrada !== undefined ? cols[headerMap.entrada] : currentTime,
        horaSalida: headerMap.salida !== undefined ? cols[headerMap.salida] : '',
        kmSalida: headerMap.km !== undefined ? cols[headerMap.km] : '',
        gasolinaSalida: headerMap.gasolina !== undefined ? cols[headerMap.gasolina] : '',
      };

      results.push(enrichParsedEmbarque(raw, camionetas, operadores, rutas, idx));
    });

    if (results.length > 0) return results;
  }

  // 3. Key-Value or Delimited Block Parsing
  // Check if multiple shipments are separated by blank lines or headers
  const rawBlocks = splitIntoBlocks(trimmed);
  const parsedBlocks: ParsedEmbarque[] = [];

  for (let bIdx = 0; bIdx < rawBlocks.length; bIdx++) {
    const blockText = rawBlocks[bIdx];
    const parsed = parseSingleBlock(blockText, camionetas, operadores, rutas, bIdx);
    if (parsed.unidad || parsed.nombreOperador || parsed.pedidos || parsed.nombreRuta) {
      parsedBlocks.push(parsed);
    }
  }

  if (parsedBlocks.length > 0) {
    return parsedBlocks;
  }

  // 4. Fallback: Parse entire text as a single entry
  return [parseSingleBlock(trimmed, camionetas, operadores, rutas, 0)];
}

/**
 * Splits text into individual shipment blocks if multiple exist
 */
function splitIntoBlocks(text: string): string[] {
  // If separated by double newlines
  const doubleNewlines = text.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
  if (doubleNewlines.length > 1) {
    return doubleNewlines;
  }

  // If delimited by "EMBARQUE", "UNIDAD:", "CAMIONETA:" or dividers like "---" or "==="
  const dividerRegex = /(?:\r?\n)(?=(?:EMBARQUE|UNIDAD\s*:|CAMIONETA\s*:|[-=]{3,}))/i;
  const divided = text.split(dividerRegex).filter((b) => b.trim().length > 0);
  if (divided.length > 1) {
    return divided;
  }

  return [text];
}

/**
 * Parses a single shipment text block using fuzzy keys, regexes, and catalog lookups.
 */
function parseSingleBlock(
  text: string,
  camionetas: Camioneta[],
  operadores: Operador[],
  rutas: Ruta[],
  index: number
): ParsedEmbarque {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const raw: Partial<ParsedEmbarque> = {
    fecha: '',
    unidad: '',
    claveOperador: '',
    nombreOperador: '',
    placas: '',
    modelo: '',
    claveRuta: '',
    nombreRuta: '',
    inicioEmbarque: '',
    pedidos: '',
    horaSalida: '',
    kmSalida: '',
    gasolinaSalida: '',
    observaciones: '',
  };

  // Helper to extract key: value from line
  const extractKv = (line: string): { key: string; val: string } | null => {
    // Check colon or equals
    const colonIdx = line.indexOf(':');
    const equalsIdx = line.indexOf('=');
    const sepIdx = colonIdx !== -1 ? colonIdx : equalsIdx;

    if (sepIdx !== -1) {
      const key = normalizeStr(line.slice(0, sepIdx));
      const val = line.slice(sepIdx + 1).trim();
      return { key, val };
    }
    return null;
  };

  // Process line by line
  for (const line of lines) {
    const kv = extractKv(line);
    if (kv) {
      const { key, val } = kv;

      // Fecha
      if (key.includes('FECHA') || key.includes('DATE') || key.includes('DIA')) {
        raw.fecha = normalizeDate(val);
      }
      // Unidad
      else if (
        key.includes('UNIDAD') ||
        key.includes('CAMIONETA') ||
        key.includes('VEHICULO') ||
        key.includes('AUTO') ||
        key === 'UNIT'
      ) {
        const matched = findMatchingCamioneta(val, camionetas);
        if (matched) {
          raw.unidad = matched.clave;
          raw.placas = matched.placa;
          raw.modelo = matched.modelo;
        } else {
          raw.unidad = val.toUpperCase();
        }
      }
      // Operador
      else if (
        key.includes('OPERADOR') ||
        key.includes('CHOFER') ||
        key.includes('CONDUCTOR') ||
        key.includes('DRIVER')
      ) {
        const matched = findMatchingOperador(val, operadores);
        if (matched) {
          raw.claveOperador = matched.clave;
          raw.nombreOperador = matched.nombre;
        } else {
          raw.nombreOperador = val;
        }
      }
      // Clave Operador
      else if (key.includes('CLAVE OP') || key.includes('CVE OP') || key === 'CLAVE') {
        const matched = findMatchingOperador(val, operadores);
        if (matched) {
          raw.claveOperador = matched.clave;
          raw.nombreOperador = matched.nombre;
        } else {
          raw.claveOperador = val.toUpperCase();
        }
      }
      // Placas
      else if (key.includes('PLACA') || key.includes('MATRICULA')) {
        const matched = findMatchingCamioneta(val, camionetas);
        if (matched) {
          raw.unidad = matched.clave;
          raw.placas = matched.placa;
          raw.modelo = matched.modelo;
        } else {
          raw.placas = val.toUpperCase();
        }
      }
      // Modelo
      else if (key.includes('MODELO') || key.includes('MARCA')) {
        raw.modelo = val;
      }
      // Ruta
      else if (key.includes('RUTA') || key.includes('DESTINO') || key.includes('CIRCUITO')) {
        const matched = findMatchingRuta(val, rutas);
        if (matched) {
          raw.claveRuta = matched.codigo;
          raw.nombreRuta = matched.nombre;
        } else {
          raw.nombreRuta = val;
        }
      }
      // Clave Ruta
      else if (key.includes('CLAVE RUTA') || key.includes('CODIGO RUTA') || key.includes('CVE RUTA')) {
        const matched = findMatchingRuta(val, rutas);
        if (matched) {
          raw.claveRuta = matched.codigo;
          raw.nombreRuta = matched.nombre;
        } else {
          raw.claveRuta = val.toUpperCase();
        }
      }
      // Pedidos
      else if (
        key.includes('PEDIDO') ||
        key.includes('ORDEN') ||
        key.includes('FOLIO') ||
        key.includes('ENTREGA') ||
        key.includes('CANTIDAD') ||
        key.includes('PAQUETE')
      ) {
        raw.pedidos = val;
      }
      // Hora Entrada / Inicio Embarque
      else if (
        key.includes('ENTRADA') ||
        key.includes('INICIO') ||
        key.includes('INI EMB') ||
        key.includes('INGRESO') ||
        key.includes('LLEGADA')
      ) {
        raw.inicioEmbarque = normalizeTime(val);
      }
      // Hora Salida
      else if (key.includes('SALIDA') && !key.includes('KM') && !key.includes('GAS')) {
        raw.horaSalida = normalizeTime(val);
      }
      // Km Salida
      else if (key.includes('KM') || key.includes('KILOMETR') || key.includes('ODOMETRO')) {
        const num = val.replace(/[^0-9]/g, '');
        if (num) raw.kmSalida = num;
      }
      // Gasolina
      else if (key.includes('GAS') || key.includes('COMBUSTIBLE') || key.includes('TANQUE')) {
        raw.gasolinaSalida = val;
      }
      // Observaciones
      else if (key.includes('OBSERV') || key.includes('NOTA') || key.includes('COMENTARIO')) {
        raw.observaciones = val;
      }
    } else {
      // Delimited line without explicit key: e.g. "NPBNV | CO6 | M01 | 16 | 07:18"
      if (line.includes('|') || line.includes(',')) {
        const parts = line.split(/[|,]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (!raw.unidad) raw.unidad = parts[0];
          if (!raw.nombreOperador && parts[1]) raw.nombreOperador = parts[1];
          if (!raw.nombreRuta && parts[2]) raw.nombreRuta = parts[2];
          if (!raw.pedidos && parts[3]) raw.pedidos = parts[3];
          if (!raw.inicioEmbarque && parts[4]) raw.inicioEmbarque = normalizeTime(parts[4]);
        }
      }
    }
  }

  // 4. Regex and Catalog Heuristics for any unassigned fields
  const normText = normalizeStr(text);

  // A. Search matching Camioneta in text if unit not set
  if (!raw.unidad) {
    for (const cam of camionetas) {
      const camClave = normalizeStr(cam.clave);
      const camPlaca = normalizeStr(cam.placa);
      const camToka = cam.claveToka ? normalizeStr(cam.claveToka) : '';
      if (
        normText.includes(camClave) ||
        (camPlaca && normText.includes(camPlaca)) ||
        (camToka && normText.includes(camToka))
      ) {
        raw.unidad = cam.clave;
        raw.placas = cam.placa;
        raw.modelo = cam.modelo;
        break;
      }
    }
  }

  // B. Search matching Operador in text if operator not set
  if (!raw.nombreOperador && !raw.claveOperador) {
    for (const op of operadores) {
      const opClave = normalizeStr(op.clave);
      const opNombre = normalizeStr(op.nombre);
      const firstName = opNombre.split(' ')[0] || '';
      if (normText.includes(opClave) || normText.includes(opNombre) || (firstName.length > 3 && normText.includes(firstName))) {
        raw.claveOperador = op.clave;
        raw.nombreOperador = op.nombre;
        break;
      }
    }
  }

  // C. Search matching Ruta in text if route not set
  if (!raw.nombreRuta && !raw.claveRuta) {
    for (const r of rutas) {
      const rCod = normalizeStr(r.codigo);
      const rNom = normalizeStr(r.nombre);
      if (normText.includes(rCod) || normText.includes(rNom)) {
        raw.claveRuta = r.codigo;
        raw.nombreRuta = r.nombre;
        break;
      }
    }
  }

  // D. Extract Date if still empty
  if (!raw.fecha) {
    const dateMatch = text.match(/\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[/-]\d{1,2}[-/]\d{2,4})\b/);
    if (dateMatch) {
      raw.fecha = normalizeDate(dateMatch[1]);
    } else {
      raw.fecha = todayStr;
    }
  }

  // E. Extract Time if still empty
  if (!raw.inicioEmbarque) {
    const timeMatches = [...text.matchAll(/\b([01]?[0-9]|2[0-3]):([0-5][0-9])(?:\s*(?:am|pm))?\b/gi)];
    if (timeMatches.length > 0) {
      raw.inicioEmbarque = normalizeTime(timeMatches[0][0]);
      if (timeMatches.length > 1 && !raw.horaSalida) {
        raw.horaSalida = normalizeTime(timeMatches[1][0]);
      }
    } else {
      raw.inicioEmbarque = currentTime;
    }
  }

  // F. Extract Pedidos count if still empty
  if (!raw.pedidos) {
    const pedMatch = text.match(/(?:pedidos?|ordenes?|folios?|entregas?|remisiones?)\s*[:=]?\s*([0-9A-Za-z,\s\-_]+)/i);
    if (pedMatch) {
      raw.pedidos = pedMatch[1].trim();
    } else {
      // Look for standalone number followed by "pedidos"
      const countMatch = text.match(/\b(\d{1,3})\s*(?:pedidos?|paquetes?|paradas?|entregas?)\b/i);
      if (countMatch) {
        raw.pedidos = countMatch[1];
      }
    }
  }

  // G. Extract Km if still empty
  if (!raw.kmSalida) {
    const kmMatch = text.match(/\b(\d{5,7})\s*(?:km|kms|kilometros)?\b/i);
    if (kmMatch) {
      raw.kmSalida = kmMatch[1];
    }
  }

  // H. Extract Gasolina if still empty
  if (!raw.gasolinaSalida) {
    const gasMatch = text.match(/(\.25|\.50|\.75|1\.0|1\/4|1\/2|3\/4|full|lleno)/i);
    if (gasMatch) {
      const g = gasMatch[1].toLowerCase();
      if (g === '1/4' || g === '.25') raw.gasolinaSalida = '.25';
      else if (g === '1/2' || g === '.50') raw.gasolinaSalida = '.50';
      else if (g === '3/4' || g === '.75') raw.gasolinaSalida = '.75';
      else if (g === 'full' || g === 'lleno' || g === '1.0') raw.gasolinaSalida = '1.0';
      else raw.gasolinaSalida = g;
    }
  }

  return enrichParsedEmbarque(raw, camionetas, operadores, rutas, index);
}

/**
 * Enriches and validates a parsed record with matching master data from catalogs.
 */
function enrichParsedEmbarque(
  raw: Partial<ParsedEmbarque>,
  camionetas: Camioneta[],
  operadores: Operador[],
  rutas: Ruta[],
  index: number
): ParsedEmbarque {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  let unidadStr = (raw.unidad || '').trim();
  let placasStr = (raw.placas || '').trim();
  let modeloStr = (raw.modelo || '').trim();
  let claveOpStr = (raw.claveOperador || '').trim();
  let nombreOpStr = (raw.nombreOperador || '').trim();
  let claveRutaStr = (raw.claveRuta || '').trim();
  let nombreRutaStr = (raw.nombreRuta || '').trim();

  // Match Camioneta bi-directionally (by clave, placa, or claveToka)
  let matchedCam: Camioneta | undefined;
  if (unidadStr) {
    matchedCam = findMatchingCamioneta(unidadStr, camionetas);
  }
  if (!matchedCam && placasStr) {
    matchedCam = findMatchingCamioneta(placasStr, camionetas);
  }
  if (matchedCam) {
    unidadStr = matchedCam.clave;
    placasStr = matchedCam.placa;
    modeloStr = matchedCam.modelo;
  }

  // Match Operador bi-directionally (by clave OR by nombre)
  let matchedOp: Operador | undefined;
  if (claveOpStr) {
    matchedOp = findMatchingOperador(claveOpStr, operadores);
  }
  if (!matchedOp && nombreOpStr) {
    matchedOp = findMatchingOperador(nombreOpStr, operadores);
  }
  if (matchedOp) {
    claveOpStr = matchedOp.clave;
    nombreOpStr = matchedOp.nombre;
  }

  // Match Ruta bi-directionally (by codigo OR by nombre)
  let matchedR: Ruta | undefined;
  if (claveRutaStr) {
    matchedR = findMatchingRuta(claveRutaStr, rutas);
  }
  if (!matchedR && nombreRutaStr) {
    matchedR = findMatchingRuta(nombreRutaStr, rutas);
  }
  if (matchedR) {
    claveRutaStr = matchedR.codigo;
    nombreRutaStr = matchedR.nombre;
  }

  return {
    id: `emb-${Date.now()}-${index}`,
    fecha: raw.fecha || todayStr,
    unidad: unidadStr || 'SIN UNIDAD',
    claveOperador: claveOpStr || (matchedOp?.clave || 'CO1'),
    nombreOperador: nombreOpStr || (matchedOp?.nombre || 'OPERADOR PENDIENTE'),
    placas: placasStr || matchedCam?.placa || '-',
    modelo: modeloStr || matchedCam?.modelo || '',
    claveRuta: claveRutaStr || (matchedR?.codigo || 'R10'),
    nombreRuta: nombreRutaStr || (matchedR?.nombre || 'RUTA LOCAL'),
    inicioEmbarque: raw.inicioEmbarque || currentTime,
    pedidos: raw.pedidos || '1',
    horaSalida: raw.horaSalida || '',
    kmSalida: raw.kmSalida || '',
    gasolinaSalida: raw.gasolinaSalida || '.50',
    observaciones: raw.observaciones || '',
    matchedUnidad: matchedCam,
    matchedOperador: matchedOp,
    matchedRuta: matchedR,
  };
}
