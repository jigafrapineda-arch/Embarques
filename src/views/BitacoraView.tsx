import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Check,
  AlertCircle,
  Truck,
  ArrowRight,
  Lock,
  ShieldCheck,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { BitacoraRegistro, Operador, Camioneta, Ruta } from '../types';
import { QrScannerModal } from '../components/QrScannerModal';

interface BitacoraViewProps {
  operadores: Operador[];
  camionetas: Camioneta[];
  rutas: Ruta[];
  registros: BitacoraRegistro[];
  onSaveRegistro: (registro: BitacoraRegistro) => void;
  onUpdateRegistro: (id: string, updates: Partial<BitacoraRegistro>) => void;
  onNavigateToHistorial: () => void;
}

export const BitacoraView: React.FC<BitacoraViewProps> = ({
  operadores,
  camionetas,
  rutas,
  registros,
  onSaveRegistro,
  onUpdateRegistro,
  onNavigateToHistorial,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toTimeString().slice(0, 5);

  // Bloque 1 State
  const [b1Fecha, setB1Fecha] = useState(todayStr);
  const [b1ClaveOperador, setB1ClaveOperador] = useState('');
  const [b1Unidad, setB1Unidad] = useState('');
  const [b1KmSalida, setB1KmSalida] = useState<string>('');
  const [b1GasolinaSalida, setB1GasolinaSalida] = useState<string>('');
  const [b1ClaveRuta, setB1ClaveRuta] = useState('');
  const [b1InicioEmbarque, setB1InicioEmbarque] = useState(currentTimeStr);

  // Bloque 2: Embarque (Hora de Entrada) & Salida State
  const [b2HoraEntrada, setB2HoraEntrada] = useState(currentTimeStr);
  const [b2UnidadSearch, setB2UnidadSearch] = useState('');
  const [b2SelectedRegistroId, setB2SelectedRegistroId] = useState<string | null>(null);
  const [b2Pedidos, setB2Pedidos] = useState('');
  const [b2HoraSalida, setB2HoraSalida] = useState('');
  const [b2SalidaSearch, setB2SalidaSearch] = useState('');

  // Bloque 3 State
  const [b3UnidadSearch, setB3UnidadSearch] = useState('');
  const [b3ChoferSearch, setB3ChoferSearch] = useState('');
  const [b3SelectedRegistroId, setB3SelectedRegistroId] = useState<string | null>(null);
  const [b3KmArribo, setB3KmArribo] = useState<string>('');
  const [b3GasolinaArribo, setB3GasolinaArribo] = useState<string>('');
  const [b3HoraArribo, setB3HoraArribo] = useState(currentTimeStr);

  // Bloque 4 State
  const [b4SelectedRegistroId, setB4SelectedRegistroId] = useState<string | null>(null);
  const [b4Observaciones, setB4Observaciones] = useState('');
  const [b4TieneIncidencia, setB4TieneIncidencia] = useState(false);
  const [b4DetalleIncidencia, setB4DetalleIncidencia] = useState('');

  // QR Scanner Modal
  const [scannerConfig, setScannerConfig] = useState<{
    isOpen: boolean;
    title: string;
    onScan: (val: string) => void;
    quickOptions: { label: string; code: string; sub?: string }[];
  }>({
    isOpen: false,
    title: '',
    onScan: () => {},
    quickOptions: [],
  });

  // Notification Banner
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 4500);
  };

  // Derived auto-fill values for Bloque 1
  const selectedOperador = operadores.find(
    (o) => o.clave.toLowerCase() === b1ClaveOperador.trim().toLowerCase()
  );
  const selectedUnidad = camionetas.find(
    (c) => c.clave.toLowerCase() === b1Unidad.trim().toLowerCase()
  );
  const selectedRuta = rutas.find(
    (r) => r.codigo.toLowerCase() === b1ClaveRuta.trim().toLowerCase()
  );

  // Find last fuel for selected unit
  const lastFuelForUnit = selectedUnidad
    ? registros.filter((r) => r.unidad.toLowerCase() === selectedUnidad.clave.toLowerCase())[0]
        ?.gasolinaSalida || 'N/A'
    : 'N/A';

  // Helper to obtain the most recent arrival mileage (kmArribo) recorded for a unit
  const getLastKmArriboForUnit = (unitKey: string): { km: number | string; fecha?: string; id?: string } | null => {
    if (!unitKey) return null;
    const upper = unitKey.trim().toUpperCase();
    const recordsWithArribo = registros.filter(
      (r) =>
        r.unidad.toUpperCase() === upper &&
        r.kmArribo !== undefined &&
        r.kmArribo !== null &&
        String(r.kmArribo).trim() !== '' &&
        !isNaN(Number(r.kmArribo)) &&
        Number(r.kmArribo) > 0
    );

    if (recordsWithArribo.length === 0) return null;

    const sorted = [...recordsWithArribo].sort((a, b) => {
      const timeA = a.id.startsWith('bit-') ? Number(a.id.replace('bit-', '')) || 0 : 0;
      const timeB = b.id.startsWith('bit-') ? Number(b.id.replace('bit-', '')) || 0 : 0;
      if (timeA && timeB) return timeB - timeA;
      return (b.fecha || '').localeCompare(a.fecha || '');
    });

    return {
      km: sorted[0].kmArribo!,
      fecha: sorted[0].fecha,
      id: sorted[0].id,
    };
  };

  // Check if current selected unit has a previous arrival mileage recorded
  const previousKmArriboRecord = useMemo(() => {
    return getLastKmArriboForUnit(b1Unidad);
  }, [b1Unidad, registros]);

  const hasPreviousKmArribo = !!previousKmArriboRecord && previousKmArriboRecord.km !== undefined;
  const previousKmArriboVal = previousKmArriboRecord ? String(previousKmArriboRecord.km) : '';

  // Synchronize b1KmSalida automatically whenever previous arrival mileage exists
  useEffect(() => {
    if (b1Unidad && hasPreviousKmArribo && previousKmArriboVal) {
      setB1KmSalida(previousKmArriboVal);
    }
  }, [b1Unidad, hasPreviousKmArribo, previousKmArriboVal]);

  // Open Scanner for Bloque 2 (with comprehensive options from fleet & active shipments)
  const openScannerForBloque2 = () => {
    const camionetaOptions = camionetas.map((c) => {
      const recentReg = registros.find((r) => r.unidad.toLowerCase() === c.clave.toLowerCase());
      const op = recentReg
        ? operadores.find((o) => o.clave.toLowerCase() === recentReg.claveOperador.toLowerCase())
        : operadores.find((o) => o.localidad.toLowerCase() === c.localidad.toLowerCase()) || operadores[0];
      const rt = recentReg
        ? rutas.find((r) => r.codigo.toLowerCase() === recentReg.claveRuta.toLowerCase())
        : rutas.find((r) => r.localidad.toLowerCase() === c.localidad.toLowerCase()) || rutas[0];

      return {
        label: `${c.modelo} (${c.placa}) • Op: ${op?.nombre || 'Chofer'} • Ruta: ${rt?.nombre || rt?.codigo || 'Local'}`,
        code: c.clave,
        sub: `${c.localidad} - Escanear Embarque`,
      };
    });

    setScannerConfig({
      isOpen: true,
      title: 'Escanear QR de Embarque (Hora de Entrada)',
      onScan: (val) => handleSelectUnitForB2(val),
      quickOptions: camionetaOptions,
    });
  };

  // Handle Scan or Search in Bloque 2 -> POPULATES BLOQUE 1 COMPLETELY & GENERATES HORA DE ENTRADA
  const handleSelectUnitForB2 = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      showNotification('error', 'Por favor ingrese o escanee una unidad o código de embarque en Bloque 2.');
      return;
    }

    const currentScanTime = new Date().toTimeString().slice(0, 5);

    // Parse potential JSON or delimited format (e.g. UNIDAD|OPERADOR|RUTA|PEDIDOS)
    let parsedUnidad = '';
    let parsedOperador = '';
    let parsedRuta = '';
    let parsedPedidos = '';

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        parsedUnidad = obj.unidad || obj.camioneta || '';
        parsedOperador = obj.operador || obj.claveOperador || '';
        parsedRuta = obj.ruta || obj.claveRuta || '';
        parsedPedidos = obj.pedidos || '';
      } catch {
        // Not JSON
      }
    } else if (trimmed.includes('|') || trimmed.includes(',')) {
      const parts = trimmed.split(/[|,]/).map((p) => p.trim());
      parsedUnidad = parts[0];
      if (parts[1]) parsedOperador = parts[1];
      if (parts[2]) parsedRuta = parts[2];
      if (parts[3]) parsedPedidos = parts[3];
    }

    const searchKey = parsedUnidad || trimmed;

    // 1. Search existing BitacoraRegistro
    const reg =
      registros.find(
        (r) => r.unidad.toLowerCase() === searchKey.toLowerCase() && !r.bloque2Completado
      ) ||
      registros.find((r) => r.unidad.toLowerCase() === searchKey.toLowerCase()) ||
      registros.find((r) => r.id === searchKey);

    if (reg) {
      const entradaTime = reg.horaEntrada || reg.inicioEmbarque || currentScanTime;
      // Fill Bloque 1 completely
      setB1Fecha(reg.fecha || todayStr);
      setB1ClaveOperador(reg.claveOperador);
      setB1Unidad(reg.unidad);
      setB1ClaveRuta(reg.claveRuta || 'R10');
      setB1InicioEmbarque(entradaTime);
      setB2HoraEntrada(entradaTime);

      const lastArr = getLastKmArriboForUnit(reg.unidad);
      if (reg.kmSalida) {
        setB1KmSalida(String(reg.kmSalida));
      } else if (lastArr) {
        setB1KmSalida(String(lastArr.km));
      } else {
        setB1KmSalida('');
      }

      if (reg.gasolinaSalida) setB1GasolinaSalida(reg.gasolinaSalida);

      // Fill Bloque 2
      setB2SelectedRegistroId(reg.id);
      setB2UnidadSearch(reg.unidad);
      setB2Pedidos(reg.pedidos || parsedPedidos || '');
      setB2HoraSalida(reg.horaSalida || currentTimeStr);

      const retroMsg = lastArr
        ? `KM salida (${lastArr.km} km) retroalimentado del último arribo.`
        : 'Capture KM inicial de salida en Datos de embarque (1er viaje).';

      showNotification(
        'success',
        `✓ Datos de ${reg.unidad} cargados. Hora de entrada: ${entradaTime}. ${retroMsg}`
      );
      return;
    }

    // 2. Search in Camionetas catalog (clave, placa, clave TOKA)
    const matchedCam = camionetas.find(
      (c) =>
        c.clave.toLowerCase() === searchKey.toLowerCase() ||
        c.placa.toLowerCase() === searchKey.toLowerCase() ||
        (c.claveToka && c.claveToka.toLowerCase() === searchKey.toLowerCase())
    );

    // 3. Search in Operadores catalog (clave or nombre)
    const matchedOp = operadores.find(
      (o) =>
        o.clave.toLowerCase() === searchKey.toLowerCase() ||
        o.nombre.toLowerCase().includes(searchKey.toLowerCase())
    );

    // 4. Search in Rutas catalog (codigo or nombre)
    const matchedRuta = rutas.find(
      (r) =>
        r.codigo.toLowerCase() === searchKey.toLowerCase() ||
        r.nombre.toLowerCase().includes(searchKey.toLowerCase())
    );

    if (matchedCam) {
      // Find operator associated with this unit or locality
      const recentOpReg = registros.find(
        (r) => r.unidad.toLowerCase() === matchedCam.clave.toLowerCase()
      );
      const chosenOpClave =
        parsedOperador ||
        recentOpReg?.claveOperador ||
        operadores.find((o) => o.localidad.toLowerCase() === matchedCam.localidad.toLowerCase())?.clave ||
        operadores[0]?.clave ||
        'OC3';

      const recentRutaReg = registros.find(
        (r) => r.unidad.toLowerCase() === matchedCam.clave.toLowerCase()
      );
      const chosenRutaCodigo =
        parsedRuta ||
        recentRutaReg?.claveRuta ||
        rutas.find((rt) => rt.localidad.toLowerCase() === matchedCam.localidad.toLowerCase())?.codigo ||
        rutas[0]?.codigo ||
        'R10';

      const lastArr = getLastKmArriboForUnit(matchedCam.clave);
      if (lastArr) {
        setB1KmSalida(String(lastArr.km));
      } else {
        setB1KmSalida('');
      }

      // Fill Datos de Embarque completely & generate Hora de Entrada
      setB1Fecha(todayStr);
      setB1Unidad(matchedCam.clave);
      setB1ClaveOperador(chosenOpClave);
      setB1ClaveRuta(chosenRutaCodigo);
      setB1InicioEmbarque(currentScanTime);
      setB2HoraEntrada(currentScanTime);

      // Fill Bloque 2
      setB2SelectedRegistroId(null);
      setB2UnidadSearch(matchedCam.clave);
      setB2Pedidos(parsedPedidos || '');
      setB2HoraSalida(currentTimeStr);

      const retroMsg = lastArr
        ? `KM de salida (${lastArr.km} km) retroalimentado automáticamente del último arribo.`
        : 'Primer viaje de la unidad: capture el KM inicial en Datos de embarque.';

      showNotification(
        'success',
        `✓ Unidad ${matchedCam.clave} escaneada. Hora de entrada: ${currentScanTime}. ${retroMsg}`
      );
      return;
    }

    if (matchedOp) {
      const recentCamReg = registros.find(
        (r) => r.claveOperador.toLowerCase() === matchedOp.clave.toLowerCase()
      );
      const chosenCamClave =
        recentCamReg?.unidad ||
        camionetas.find((c) => c.localidad.toLowerCase() === matchedOp.localidad.toLowerCase())?.clave ||
        camionetas[0]?.clave ||
        'VKCRU7';

      const recentRutaReg = registros.find(
        (r) => r.claveOperador.toLowerCase() === matchedOp.clave.toLowerCase()
      );
      const chosenRutaCodigo =
        parsedRuta ||
        recentRutaReg?.claveRuta ||
        rutas.find((rt) => rt.localidad.toLowerCase() === matchedOp.localidad.toLowerCase())?.codigo ||
        rutas[0]?.codigo ||
        'R10';

      const lastArr = getLastKmArriboForUnit(chosenCamClave);
      if (lastArr) {
        setB1KmSalida(String(lastArr.km));
      } else {
        setB1KmSalida('');
      }

      // Fill Datos de Embarque completely & generate Hora de Entrada
      setB1Fecha(todayStr);
      setB1Unidad(chosenCamClave);
      setB1ClaveOperador(matchedOp.clave);
      setB1ClaveRuta(chosenRutaCodigo);
      setB1InicioEmbarque(currentScanTime);
      setB2HoraEntrada(currentScanTime);

      // Fill Bloque 2
      setB2SelectedRegistroId(null);
      setB2UnidadSearch(chosenCamClave);
      setB2Pedidos(parsedPedidos || '');
      setB2HoraSalida(currentTimeStr);

      const retroMsg = lastArr
        ? `KM de salida (${lastArr.km} km) retroalimentado automáticamente del último arribo.`
        : 'Primer viaje de la unidad: capture el KM inicial en Datos de embarque.';

      showNotification(
        'success',
        `✓ Operador ${matchedOp.nombre} escaneado con unidad ${chosenCamClave}. Hora: ${currentScanTime}. ${retroMsg}`
      );
      return;
    }

    if (matchedRuta) {
      const recentReg = registros.find(
        (r) => r.claveRuta.toLowerCase() === matchedRuta.codigo.toLowerCase()
      );
      const chosenCamClave =
        recentReg?.unidad ||
        camionetas.find((c) => c.localidad.toLowerCase() === matchedRuta.localidad.toLowerCase())?.clave ||
        camionetas[0]?.clave ||
        'VKCRU7';

      const chosenOpClave =
        parsedOperador ||
        recentReg?.claveOperador ||
        operadores.find((o) => o.localidad.toLowerCase() === matchedRuta.localidad.toLowerCase())?.clave ||
        operadores[0]?.clave ||
        'OC3';

      const lastArr = getLastKmArriboForUnit(chosenCamClave);
      if (lastArr) {
        setB1KmSalida(String(lastArr.km));
      } else {
        setB1KmSalida('');
      }

      setB1Fecha(todayStr);
      setB1Unidad(chosenCamClave);
      setB1ClaveOperador(chosenOpClave);
      setB1ClaveRuta(matchedRuta.codigo);
      setB1InicioEmbarque(currentScanTime);
      setB2HoraEntrada(currentScanTime);

      setB2SelectedRegistroId(null);
      setB2UnidadSearch(chosenCamClave);
      setB2Pedidos(parsedPedidos || '');
      setB2HoraSalida(currentTimeStr);

      const retroMsg = lastArr
        ? `KM de salida (${lastArr.km} km) retroalimentado del último arribo.`
        : 'Primer viaje: capture KM inicial de salida.';

      showNotification(
        'success',
        `✓ Ruta ${matchedRuta.codigo} - ${matchedRuta.nombre} seleccionada con unidad ${chosenCamClave}. Hora: ${currentScanTime}. ${retroMsg}`
      );
      return;
    }

    // 5. Fallback: Generic unit key
    const upperKey = searchKey.toUpperCase();
    const lastArr = getLastKmArriboForUnit(upperKey);
    if (lastArr) {
      setB1KmSalida(String(lastArr.km));
    } else {
      setB1KmSalida('');
    }

    setB1Fecha(todayStr);
    setB1Unidad(upperKey);
    setB1ClaveOperador(parsedOperador || operadores[0]?.clave || 'OC3');
    setB1ClaveRuta(parsedRuta || rutas[0]?.codigo || 'R10');
    setB1InicioEmbarque(currentScanTime);
    setB2HoraEntrada(currentScanTime);

    setB2SelectedRegistroId(null);
    setB2UnidadSearch(upperKey);
    setB2Pedidos(parsedPedidos || '');

    const retroMsg = lastArr
      ? `KM de salida (${lastArr.km} km) retroalimentado de su último arribo.`
      : '1er viaje: capture KM inicial de salida en Datos de embarque.';

    showNotification(
      'success',
      `✓ Unidad ${upperKey} escaneada. Hora de entrada generada: ${currentScanTime}. ${retroMsg}`
    );
  };

  // Open Scanner for Hora de Salida (Bloque 2: Hora de Salida)
  const openScannerForSalida = () => {
    const camionetaOptions = camionetas.map((c) => {
      const op = operadores.find((o) => o.camionetaClave === c.clave);
      return {
        label: `${c.clave} - ${c.modelo} (${c.placa}) • Op: ${op?.nombre || 'Chofer'}`,
        code: c.clave,
        sub: `${c.localidad} - Escanear Salida a Ruta`,
      };
    });

    setScannerConfig({
      isOpen: true,
      title: 'Escanear QR de Unidad (Hora de Salida)',
      onScan: (val) => handleSelectUnitForSalida(val),
      quickOptions: camionetaOptions,
    });
  };

  // Handle Scan or Search in Hora de Salida -> GENERATES HORA DE SALIDA AUTOMATICALLY
  const handleSelectUnitForSalida = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      showNotification('error', 'Por favor ingrese o escanee una unidad para registrar la salida.');
      return;
    }

    const currentScanTime = new Date().toTimeString().slice(0, 5);
    setB2HoraSalida(currentScanTime);

    const upperKey = trimmed.toUpperCase();
    const reg =
      registros.find((r) => r.id === trimmed) ||
      registros.find((r) => r.unidad.toUpperCase() === upperKey) ||
      registros.find((r) => r.placas && r.placas.toUpperCase() === upperKey);

    if (reg) {
      setB2SelectedRegistroId(reg.id);
      setB1Unidad(reg.unidad);
      if (reg.pedidos && !b2Pedidos) setB2Pedidos(reg.pedidos);
      setB2SalidaSearch(reg.unidad);
      showNotification(
        'success',
        `✓ Unidad ${reg.unidad} escaneada para salida. Hora registrada: ${currentScanTime}.`
      );
    } else {
      setB2SalidaSearch(upperKey);
      if (!b1Unidad) setB1Unidad(upperKey);
      showNotification(
        'success',
        `✓ Hora de salida registrada: ${currentScanTime} para unidad ${upperKey}.`
      );
    }
  };

  // Handle Save / Confirm Hora de Entrada (Bloque 2: Embarque)
  const handleSaveHoraEntrada = () => {
    if (!b1Unidad.trim()) {
      showNotification('error', 'Por favor escanee o ingrese una unidad primero en Hora de Entrada.');
      return;
    }
    const entradaTime = b2HoraEntrada || currentTimeStr;
    const finalKmSalida = b1KmSalida || (hasPreviousKmArribo ? previousKmArriboVal : '');
    if (b2SelectedRegistroId) {
      onUpdateRegistro(b2SelectedRegistroId, {
        inicioEmbarque: entradaTime,
        horaEntrada: entradaTime,
        ...(finalKmSalida ? { kmSalida: Number(finalKmSalida) || finalKmSalida } : {}),
      });
      showNotification('success', `✓ Hora de entrada (${entradaTime}) confirmada para unidad ${b1Unidad}.`);
    } else {
      const newRegistroId = `bit-${Date.now()}`;
      const newRegistro: BitacoraRegistro = {
        id: newRegistroId,
        fecha: b1Fecha,
        claveOperador: b1ClaveOperador.toUpperCase() || 'OC3',
        unidad: b1Unidad.toUpperCase(),
        nombreOperador: selectedOperador?.nombre || 'OPERADOR ASIGNADO',
        placas: selectedUnidad?.placa || '-',
        modelo: selectedUnidad?.modelo || '',
        ultimaGasolina: lastFuelForUnit,
        kmSalida: Number(finalKmSalida) || finalKmSalida || '',
        gasolinaSalida: b1GasolinaSalida || '',
        claveRuta: b1ClaveRuta.toUpperCase() || 'R10',
        nombreRuta: selectedRuta?.nombre || 'RUTA PROGRAMADA',
        inicioEmbarque: entradaTime,
        horaEntrada: entradaTime,
        bloque1Completado: false,
        bloque2Completado: false,
        bloque3Completado: false,
        bloque4Completado: false,
        estado: 'Salida',
      };
      onSaveRegistro(newRegistro);
      setB2SelectedRegistroId(newRegistroId);
      showNotification('success', `✓ Hora de entrada (${entradaTime}) registrada para unidad ${b1Unidad}. Complete Datos de embarque.`);
    }
  };

  // Handle Save Bloque 1 (Datos de Embarque + Km y Gasolina de salida)
  const handleSaveBloque1 = () => {
    if (!b1Unidad.trim() || !b1ClaveOperador.trim()) {
      showNotification('error', 'Debe escanear primero en Bloque 2: Embarque (Hora de entrada) para obtener los datos.');
      return;
    }
    const finalKmSalida = b1KmSalida || (hasPreviousKmArribo ? previousKmArriboVal : '');
    if (!finalKmSalida.trim()) {
      showNotification(
        'error',
        hasPreviousKmArribo
          ? 'Por favor verifique el Kilometraje de Salida.'
          : 'Por favor ingrese el Kilometraje de Salida (requerido para el primer viaje de la unidad).'
      );
      return;
    }
    if (!b1GasolinaSalida) {
      showNotification('error', 'Por favor seleccione la Gasolina de Salida.');
      return;
    }

    const entradaTime = b2HoraEntrada || b1InicioEmbarque || currentTimeStr;

    if (b2SelectedRegistroId) {
      onUpdateRegistro(b2SelectedRegistroId, {
        fecha: b1Fecha,
        claveOperador: b1ClaveOperador.toUpperCase(),
        nombreOperador: selectedOperador?.nombre || 'OPERADOR ASIGNADO',
        unidad: b1Unidad.toUpperCase(),
        placas: selectedUnidad?.placa || '-',
        modelo: selectedUnidad?.modelo || '',
        ultimaGasolina: lastFuelForUnit,
        kmSalida: Number(finalKmSalida) || finalKmSalida,
        gasolinaSalida: b1GasolinaSalida,
        claveRuta: b1ClaveRuta.toUpperCase() || 'R10',
        nombreRuta: selectedRuta?.nombre || 'RUTA PROGRAMADA',
        inicioEmbarque: entradaTime,
        horaEntrada: entradaTime,
        bloque1Completado: true,
      });
      showNotification('success', `✓ Datos de embarque y salida guardados para unidad ${b1Unidad}.`);
    } else {
      const newRegistroId = `bit-${Date.now()}`;
      const newRegistro: BitacoraRegistro = {
        id: newRegistroId,
        fecha: b1Fecha,
        claveOperador: b1ClaveOperador.toUpperCase(),
        unidad: b1Unidad.toUpperCase(),
        nombreOperador: selectedOperador?.nombre || 'OPERADOR ASIGNADO',
        placas: selectedUnidad?.placa || '-',
        modelo: selectedUnidad?.modelo || '',
        ultimaGasolina: lastFuelForUnit,
        kmSalida: Number(finalKmSalida) || finalKmSalida,
        gasolinaSalida: b1GasolinaSalida,
        claveRuta: b1ClaveRuta.toUpperCase() || 'R10',
        nombreRuta: selectedRuta?.nombre || 'RUTA PROGRAMADA',
        inicioEmbarque: entradaTime,
        horaEntrada: entradaTime,
        bloque1Completado: true,
        bloque2Completado: false,
        bloque3Completado: false,
        bloque4Completado: false,
        estado: 'Salida',
      };

      onSaveRegistro(newRegistro);
      setB2SelectedRegistroId(newRegistroId);
      showNotification('success', `✓ Datos de embarque registrados para unidad ${newRegistro.unidad}.`);
    }
  };

  // Handle Save Salida a Ruta (Pedidos y Hora de Salida)
  const handleSaveBloque2 = () => {
    if (!b1Unidad.trim()) {
      showNotification('error', 'Por favor escanee o seleccione una unidad primero.');
      return;
    }
    const salidaTime = b2HoraSalida.trim() || new Date().toTimeString().slice(0, 5);
    if (!b2HoraSalida.trim()) {
      setB2HoraSalida(salidaTime);
    }
    if (!b2Pedidos.trim()) {
      showNotification('error', 'Por favor ingrese los pedidos asignados a la unidad.');
      return;
    }

    const entradaTime = b2HoraEntrada || b1InicioEmbarque || currentTimeStr;
    const finalKmSalida = b1KmSalida || (hasPreviousKmArribo ? previousKmArriboVal : '');

    if (b2SelectedRegistroId) {
      onUpdateRegistro(b2SelectedRegistroId, {
        pedidos: b2Pedidos,
        horaSalida: salidaTime,
        inicioEmbarque: entradaTime,
        horaEntrada: entradaTime,
        ...(finalKmSalida ? { kmSalida: Number(finalKmSalida) || finalKmSalida } : {}),
        bloque2Completado: true,
        estado: 'En Ruta',
      });
      showNotification('success', `✓ Hora de salida (${salidaTime}) y pedidos guardados. Unidad ${b1Unidad} marcada "En Ruta".`);
    } else {
      const newRegistroId = `bit-${Date.now()}`;
      const newRegistro: BitacoraRegistro = {
        id: newRegistroId,
        fecha: b1Fecha,
        claveOperador: b1ClaveOperador.toUpperCase(),
        unidad: b1Unidad.toUpperCase(),
        nombreOperador: selectedOperador?.nombre || 'OPERADOR ASIGNADO',
        placas: selectedUnidad?.placa || '-',
        modelo: selectedUnidad?.modelo || '',
        ultimaGasolina: lastFuelForUnit,
        kmSalida: Number(finalKmSalida) || finalKmSalida || 'Pendiente',
        gasolinaSalida: b1GasolinaSalida || '.50',
        claveRuta: b1ClaveRuta.toUpperCase() || 'R10',
        nombreRuta: selectedRuta?.nombre || 'RUTA PROGRAMADA',
        inicioEmbarque: entradaTime,
        horaEntrada: entradaTime,
        bloque1Completado: !!finalKmSalida,
        pedidos: b2Pedidos,
        horaSalida: salidaTime,
        bloque2Completado: true,
        bloque3Completado: false,
        bloque4Completado: false,
        estado: 'En Ruta',
      };
      onSaveRegistro(newRegistro);
      setB2SelectedRegistroId(newRegistroId);
      showNotification('success', `✓ Hora de salida (${salidaTime}) y pedidos guardados. Unidad ${newRegistro.unidad} marcada "En Ruta".`);
    }

    setB2SalidaSearch('');
    setB2SelectedRegistroId(null);
    setB2Pedidos('');
    setB2HoraSalida('');
    setB1KmSalida('');
    setB1GasolinaSalida('');
    setB1Unidad('');
    setB1ClaveOperador('');
    setB1ClaveRuta('');
  };

  // Handle Unit Search in Bloque 3
  const handleSelectUnitForB3 = (unitKey: string) => {
    const reg = registros.find(
      (r) => r.unidad.toLowerCase() === unitKey.trim().toLowerCase() && r.bloque2Completado && !r.bloque3Completado
    ) || registros.find((r) => r.unidad.toLowerCase() === unitKey.trim().toLowerCase());

    if (reg) {
      setB3SelectedRegistroId(reg.id);
      setB3UnidadSearch(reg.unidad);
      setB3ChoferSearch(reg.claveOperador);
      setB3KmArribo(String(reg.kmArribo || ''));
      setB3GasolinaArribo(reg.gasolinaArribo || '.50');
      setB3HoraArribo(reg.horaArribo || currentTimeStr);
    } else {
      showNotification('error', `No se encontró un embarque en tránsito para la unidad "${unitKey}".`);
    }
  };

  // Handle Save Bloque 3
  const handleSaveBloque3 = () => {
    if (!b3SelectedRegistroId) {
      showNotification('error', 'Busque y seleccione una unidad en arribo.');
      return;
    }
    if (!b3KmArribo || !b3HoraArribo) {
      showNotification('error', 'Ingrese kilometraje y hora de arribo.');
      return;
    }

    const kmArriboNum = Number(b3KmArribo) || b3KmArribo;
    onUpdateRegistro(b3SelectedRegistroId, {
      kmArribo: kmArriboNum,
      gasolinaArribo: b3GasolinaArribo || '.50',
      horaArribo: b3HoraArribo,
      bloque3Completado: true,
      estado: 'Arribado',
    });

    showNotification(
      'success',
      `✓ Bloque 3 registrado. Arribo con ${b3KmArribo} km completado. Se retroalimentará como KM de salida en el siguiente viaje de ${b3UnidadSearch}.`
    );
    setB3UnidadSearch('');
    setB3ChoferSearch('');
    setB3SelectedRegistroId(null);
    setB3KmArribo('');
    setB3GasolinaArribo('');
  };

  // Handle Save Bloque 4
  const handleSaveBloque4 = () => {
    if (!b4SelectedRegistroId) {
      showNotification('error', 'Seleccione un viaje finalizado para cerrar.');
      return;
    }

    onUpdateRegistro(b4SelectedRegistroId, {
      observaciones: b4Observaciones,
      incidencia: b4TieneIncidencia,
      detalleIncidencia: b4TieneIncidencia ? b4DetalleIncidencia : '',
      bloque4Completado: true,
      estado: 'Cerrado',
    });

    showNotification('success', 'Bloque 4: Bitácora cerrada y archivada formalmente.');
    setB4SelectedRegistroId(null);
    setB4Observaciones('');
    setB4TieneIncidencia(false);
    setB4DetalleIncidencia('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
      {banner && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            banner.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-rose-600 text-white shadow-rose-600/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{banner.message}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-white/80 hover:text-white text-xs underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main Form Card matching Screenshot 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Bitácora de Acceso (Registro Horizontal)
          </h2>
          <button
            type="button"
            onClick={onNavigateToHistorial}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Ver Historial Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================= DATOS DE EMBARQUE ================= */}
        <div className="relative mb-8">
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500"></div>
            </div>
            <span className="relative px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-2xs">
              DATOS DE EMBARQUE
            </span>
          </div>

          <div className="space-y-4">
            {/* Status notification banner for Datos de Embarque */}
            {b1Unidad ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-900">
                      Datos cargados desde escaneo de Bloque 2:
                    </span>
                    <span className="text-xs text-emerald-800 ml-1">
                      Unidad <strong className="font-mono text-emerald-950">{b1Unidad}</strong> • Operador:{' '}
                      <strong className="text-emerald-950">{selectedOperador?.nombre || b1ClaveOperador}</strong>.
                      Campos de embarque bloqueados.
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-black text-emerald-700 bg-white/90 border border-emerald-300 px-2.5 py-1 rounded-lg shrink-0">
                  Solo complete Kilometraje y Gasolina de Salida ↓
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800">
                      Datos de Embarque Bloqueados:
                    </span>
                    <span className="text-xs text-slate-600 ml-1">
                      La información de esta sección se llena automáticamente al escanear en el{' '}
                      <strong className="text-emerald-700">Bloque 2</strong>. Solo se permite capturar
                      Kilometraje y Gasolina de salida.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openScannerForBloque2}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Escanear en Bloque 2</span>
                </button>
              </div>
            )}

            {/* Row 1: Fecha, Clave Op, Unidad, Nombre Op, Placas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* 1. FECHA (BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    1. FECHA
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={b1Fecha}
                    readOnly
                    disabled
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-100/80 border border-slate-200 text-slate-600 font-semibold rounded-xl cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 2. CLAVE OPERADOR (BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    2. CLAVE OPERADOR
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={b1ClaveOperador}
                    readOnly
                    disabled
                    placeholder="Escanee Bloque 2..."
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 font-black uppercase cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 3. UNIDAD (BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    3. UNIDAD
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={b1Unidad}
                    readOnly
                    disabled
                    placeholder="Escanee Bloque 2..."
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 font-black uppercase cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 4. NOMBRE DEL OPERADOR (BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    4. NOMBRE DEL OPERADOR
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Bloqueado
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedOperador?.nombre || (b1ClaveOperador ? 'No encontrado' : 'Pendiente escaneo Bloque 2...')}
                  className="w-full px-3 py-2 text-xs bg-slate-100/80 border border-slate-200 text-slate-600 rounded-xl italic select-none truncate font-medium cursor-not-allowed"
                />
              </div>

              {/* 5. PLACAS (BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    5. PLACAS
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Bloqueado
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedUnidad?.placa || '-'}
                  className="w-full px-3 py-2 text-xs bg-slate-100/80 border border-slate-200 text-slate-700 rounded-xl select-none font-bold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 2: Última Gasolina, Km Salida (PERMITIDO), Gasolina Salida (PERMITIDO), Clave Ruta, Nombre Ruta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* 6. ÚLTIMA GASOLINA (HISTORIAL / BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    6. ÚLTIMA GASOLINA
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Historial
                  </span>
                </div>
                <div className="px-3 py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-emerald-800 font-bold">
                  {lastFuelForUnit}
                </div>
              </div>

              {/* 7. KILOMETRAJE SALIDA (RETROALIMENTADO DE BLOQUE 3 / MANUAL SOLO EN 1ER VIAJE) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-emerald-950 uppercase flex items-center gap-1">
                    7. KM SALIDA <span className="text-rose-600">*</span>
                  </label>
                  {hasPreviousKmArribo ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 text-emerald-800 bg-emerald-100 border border-emerald-300 rounded shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-emerald-700" /> RETROALIMENTADO
                    </span>
                  ) : b1Unidad ? (
                    <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.5 text-amber-800 bg-amber-100 border border-amber-300 rounded animate-pulse">
                      1ER VIAJE • CAPTURAR
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 text-slate-500 bg-slate-100 border border-slate-200 rounded">
                      PENDIENTE
                    </span>
                  )}
                </div>

                {hasPreviousKmArribo ? (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={`${b1KmSalida || previousKmArriboVal} km`}
                        className="w-full px-3 py-2 text-xs bg-slate-100/90 border border-slate-300 text-slate-800 rounded-xl font-black cursor-not-allowed select-none shadow-inner"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md border border-emerald-300/80 pointer-events-none">
                        <RotateCcw className="w-2.5 h-2.5" /> Auto
                      </div>
                    </div>
                    <div className="mt-1 flex items-start gap-1 text-[9.5px] font-bold text-emerald-700 leading-tight">
                      <RotateCcw className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>KM de salida retroalimentado automáticamente del último arribo ({previousKmArriboVal} km). Inalterable.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      value={b1KmSalida}
                      onChange={(e) => setB1KmSalida(e.target.value)}
                      placeholder={b1Unidad ? 'Ej: 88878 (1er viaje obligatorio)' : 'Escanee unidad en Bloque 2...'}
                      disabled={!b1Unidad}
                      className={`w-full px-3 py-2 text-xs rounded-xl font-black text-slate-900 shadow-xs transition-all ${
                        !b1Unidad
                          ? 'bg-slate-100/70 border border-slate-200 text-slate-400 cursor-not-allowed italic'
                          : 'bg-white border-2 border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400'
                      }`}
                    />
                    {b1Unidad ? (
                      <div className="mt-1 flex items-start gap-1 text-[9.5px] font-bold text-amber-700 leading-tight">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                        <span>Primer viaje registrado para {b1Unidad}: capture el KM inicial. En próximos viajes se retroalimentará del arribo.</span>
                      </div>
                    ) : (
                      <span className="mt-1 text-[9.5px] text-slate-400 italic block">
                        Al escanear la unidad, se cargará su último KM o se solicitará si es primer viaje.
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* 8. GASOLINA SALIDA (PERMITIDO / INGRESO MANUAL) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-emerald-950 uppercase flex items-center gap-1">
                    8. GASOLINA SALIDA <span className="text-rose-600">*</span>
                  </label>
                  <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.2 text-emerald-800 bg-emerald-100 border border-emerald-300 rounded">
                    INGRESAR
                  </span>
                </div>
                <select
                  value={b1GasolinaSalida}
                  onChange={(e) => setB1GasolinaSalida(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-emerald-500 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-bold text-slate-900 shadow-xs"
                >
                  <option value="">Seleccionar nivel...</option>
                  <option value=".25">1/4 (.25)</option>
                  <option value=".50">1/2 (.50)</option>
                  <option value=".75">3/4 (.75)</option>
                  <option value="1">Lleno (1.0)</option>
                </select>
              </div>

              {/* 9. CLAVE DE RUTA (BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    9. CLAVE DE RUTA
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={b1ClaveRuta}
                    readOnly
                    disabled
                    placeholder="Escanee Bloque 2..."
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 font-bold uppercase cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 10. NOMBRE DE RUTA (BLOQUEADO) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    10. NOMBRE DE RUTA
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Bloqueado
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedRuta?.nombre || (b1ClaveRuta ? 'No asignada' : 'Pendiente escaneo...')}
                  className="w-full px-3 py-2 text-xs bg-slate-100/80 border border-slate-200 text-slate-600 rounded-xl italic select-none truncate font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bloque 1 Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 italic">
                * Complete únicamente <strong>7. Kilometraje Salida</strong> y{' '}
                <strong>8. Gasolina Salida</strong> luego de escanear en Bloque 2 (Hora de Entrada).
              </span>
              <button
                type="button"
                onClick={handleSaveBloque1}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                GUARDAR DATOS DE EMBARQUE
              </button>
            </div>
          </div>
        </div>

        {/* ================= BLOQUE 2: EMBARQUE (HORA DE ENTRADA) ================= */}
        <div className="relative mb-8">
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500"></div>
            </div>
            <span className="relative px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-2xs">
              BLOQUE 2: EMBARQUE
            </span>
          </div>

          <div className="space-y-4">
            {/* Header del Bloque: HORA DE ENTRADA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  HORA DE ENTRADA
                </h3>
                <p className="text-[11px] text-slate-500">
                  Escanee la unidad para registrar automáticamente la hora de entrada y rellenar los datos de embarque.
                </p>
              </div>
              {b2HoraEntrada && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-black self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HORA REGISTRADA: {b2HoraEntrada}</span>
                </div>
              )}
            </div>

            {/* Escanear o Buscar Unidad para Hora de Entrada */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/90 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Escanear o Buscar Unidad para Entrada
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Al escanear aquí, se genera la hora exacta de escaneo y se rellenan los datos de embarque.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openScannerForBloque2}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  <span>ESCANEAR QR</span>
                </button>
              </div>

              {/* Manual search input */}
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={b2UnidadSearch}
                    onChange={(e) => setB2UnidadSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectUnitForB2(b2UnidadSearch);
                    }}
                    placeholder="Ingrese o escanee Unidad (ej. VKCRU7, VKCV98, CTP71...)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-black tracking-wide"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectUnitForB2(b2UnidadSearch)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cargar
                </button>
              </div>

              {/* Status pill showing scanned unit and generated time */}
              {b1Unidad && (
                <div className="mt-3 p-2.5 bg-white rounded-xl border border-emerald-300 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-700">
                      Unidad vinculada: <strong className="font-mono text-slate-900 font-black">{b1Unidad}</strong> ({selectedUnidad?.placa || '-'}) | Operador: <strong className="text-slate-900">{selectedOperador?.nombre || b1ClaveOperador}</strong> | Hora Entrada: <strong className="text-emerald-700 font-black">{b2HoraEntrada}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✓ HORA GENERADA Y DATOS DE EMBARQUE COMPLETADOS
                  </span>
                </div>
              )}
            </div>

            {/* Inputs: Hora de Entrada (Bloqueada/Automática), Unidad vinculada, Operador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    HORA DE ENTRADA (ESCANEO) <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-500 bg-slate-200/90 px-1.5 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5 mr-0.5 text-slate-600" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={b2HoraEntrada}
                    readOnly
                    disabled
                    title="Esta hora se genera automáticamente al escanear la unidad y no puede modificarse manualmente."
                    className="w-full px-3 py-2 text-xs bg-slate-100/90 border border-slate-300 rounded-xl font-black text-slate-800 shadow-xs cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                  Hora registrada automáticamente al escanear para garantizar veracidad.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  UNIDAD EN ENTRADA
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={b1Unidad ? `${b1Unidad} - ${selectedUnidad?.modelo || ''}` : 'Pendiente de escaneo...'}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed select-none uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  OPERADOR IDENTIFICADO
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedOperador?.nombre || (b1ClaveOperador ? `Clave: ${b1ClaveOperador}` : 'Pendiente de escaneo...')}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed select-none truncate"
                />
              </div>
            </div>

            {/* Action button: Confirmar Hora de Entrada */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveHoraEntrada}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                CONFIRMAR HORA DE ENTRADA
              </button>
            </div>
          </div>
        </div>

        {/* ================= BLOQUE 2: HORA DE SALIDA ================= */}
        <div className="relative mb-8">
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500"></div>
            </div>
            <span className="relative px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-2xs">
              BLOQUE 2: HORA DE SALIDA
            </span>
          </div>

          <div className="space-y-4">
            {/* Header del Bloque: HORA DE SALIDA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  HORA DE SALIDA
                </h3>
                <p className="text-[11px] text-slate-500">
                  Escanee la unidad para registrar automáticamente la hora de salida a ruta y verificar pedidos.
                </p>
              </div>
              {b2HoraSalida && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-black self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HORA REGISTRADA: {b2HoraSalida}</span>
                </div>
              )}
            </div>

            {/* Escanear o Buscar Unidad para Hora de Salida */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/90 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Escanear o Buscar Unidad para Salida
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Al escanear aquí, se genera la hora exacta de salida a ruta de forma automática y protegida.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openScannerForSalida}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  <span>ESCANEAR QR</span>
                </button>
              </div>

              {/* Manual search input for Salida */}
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={b2SalidaSearch}
                    onChange={(e) => setB2SalidaSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectUnitForSalida(b2SalidaSearch);
                    }}
                    placeholder="Ingrese o escanee Unidad para salida (ej. VKCRU7, VKCV98, CTP71...)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-black tracking-wide"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectUnitForSalida(b2SalidaSearch)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cargar
                </button>
              </div>

              {/* Status pill showing scanned unit and generated exit time */}
              {b1Unidad && (
                <div className="mt-3 p-2.5 bg-white rounded-xl border border-emerald-300 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-700">
                      Unidad vinculada: <strong className="font-mono text-slate-900 font-black">{b1Unidad}</strong> ({selectedUnidad?.placa || '-'}) | Operador: <strong className="text-slate-900">{selectedOperador?.nombre || b1ClaveOperador}</strong> | Hora Salida: <strong className="text-emerald-700 font-black">{b2HoraSalida || 'Pendiente de escaneo'}</strong>
                    </span>
                  </div>
                  {b2HoraSalida ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                      ✓ HORA DE SALIDA GENERADA AL ESCANEAR
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                      PENDIENTE DE ESCANEO DE SALIDA
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Inputs: Hora de Salida (Bloqueada/Automática), 12. Pedidos, Unidad en Salida */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase">
                    HORA DE SALIDA (ESCANEO) <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center text-[9px] font-bold text-slate-500 bg-slate-200/90 px-1.5 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5 mr-0.5 text-slate-600" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={b2HoraSalida}
                    readOnly
                    disabled
                    title="Esta hora se genera automáticamente al escanear la unidad para salida y no puede modificarse manualmente."
                    className="w-full px-3 py-2 text-xs bg-slate-100/90 border border-slate-300 rounded-xl font-black text-slate-800 shadow-xs cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                  Hora registrada automáticamente al escanear para garantizar veracidad.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  12. PEDIDOS <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={b2Pedidos}
                  onChange={(e) => setB2Pedidos(e.target.value)}
                  placeholder="Ingrese número o lista de pedidos..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                />
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                  Capture los pedidos asignados a la unidad.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  UNIDAD EN SALIDA
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={b1Unidad ? `${b1Unidad} - ${selectedUnidad?.modelo || ''}` : 'Pendiente de escaneo...'}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed select-none uppercase"
                />
                <span className="text-[10px] text-slate-500 font-medium mt-1 block truncate">
                  {selectedOperador?.nombre ? `Operador: ${selectedOperador.nombre}` : 'Operador asignado'}
                </span>
              </div>
            </div>

            {/* Action button: Confirmar / Guardar Hora de Salida */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveBloque2}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl uppercase tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                CONFIRMAR HORA DE SALIDA
              </button>
            </div>
          </div>
        </div>

        {/* ================= BLOQUE 3: ARRIBO ================= */}
        <div className="relative mb-8">
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500"></div>
            </div>
            <span className="relative px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-2xs">
              BLOQUE 3: ARRIBO (15)
            </span>
          </div>

          <div className="space-y-4">
            {/* Search row: BUSCAR UNIDAD PARA ARRIBO & CLAVE DE CHOFER (B1) */}
            <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Search Unidad */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black text-emerald-700 uppercase flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" />
                      BUSCAR UNIDAD PARA ARRIBO
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setScannerConfig({
                          isOpen: true,
                          title: 'Escanear Unidad en Arribo',
                          onScan: (val) => handleSelectUnitForB3(val),
                          quickOptions: registros
                            .filter((r) => r.bloque2Completado && !r.bloque3Completado)
                            .map((r) => ({
                              label: `${r.nombreOperador} - Salida: ${r.horaSalida || r.inicioEmbarque}`,
                              code: r.unidad,
                              sub: r.fecha,
                            })),
                        })
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/70 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3 h-3" />
                      ESCANEAR QR
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={b3UnidadSearch}
                      onChange={(e) => setB3UnidadSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSelectUnitForB3(b3UnidadSearch);
                      }}
                      placeholder="Ingrese Unidad..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleSelectUnitForB3(b3UnidadSearch)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                {/* Clave de Chofer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black text-emerald-700 uppercase flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" />
                      CLAVE DE CHOFER (B1)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setScannerConfig({
                          isOpen: true,
                          title: 'Escanear Chofer de Arribo',
                          onScan: (val) => setB3ChoferSearch(val),
                          quickOptions: operadores.map((o) => ({
                            label: o.nombre,
                            code: o.clave,
                            sub: o.localidad,
                          })),
                        })
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/70 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3 h-3" />
                      ESCANEAR QR
                    </button>
                  </div>
                  <input
                    type="text"
                    value={b3ChoferSearch}
                    onChange={(e) => setB3ChoferSearch(e.target.value)}
                    placeholder="Ingrese Clave Operador..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-semibold"
                  />
                </div>
              </div>

              {b3SelectedRegistroId && (
                <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Confirmando arribo para unidad <strong className="text-slate-900">{b3UnidadSearch}</strong> |
                    Km Salida: <strong>{registros.find((r) => r.id === b3SelectedRegistroId)?.kmSalida}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Arribo Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1">
                    14. KILOMETRAJE DE ARRIBO <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                    <RotateCcw className="w-2.5 h-2.5" /> Retroalimenta Bloque 1
                  </span>
                </div>
                <input
                  type="number"
                  value={b3KmArribo}
                  onChange={(e) => setB3KmArribo(e.target.value)}
                  placeholder="Ej: 88940"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 shadow-xs"
                />
                <span className="text-[9.5px] text-slate-500 font-medium mt-1 block">
                  Este kilometraje se convertirá en el KM de Salida del siguiente viaje de esta unidad.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  15. GASOLINA DE ARRIBO <span className="text-rose-500">*</span>
                </label>
                <select
                  value={b3GasolinaArribo}
                  onChange={(e) => setB3GasolinaArribo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="">Sel...</option>
                  <option value=".25">1/4 (.25)</option>
                  <option value=".50">1/2 (.50)</option>
                  <option value=".75">3/4 (.75)</option>
                  <option value="1">Lleno (1.0)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  16. HORA DE ARRIBO <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={b3HoraArribo}
                    onChange={(e) => setB3HoraArribo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bloque 3 Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveBloque3}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl uppercase tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                GUARDAR BLOQUE 3
              </button>
            </div>
          </div>
        </div>

        {/* ================= BLOQUE 4: CIERRE ================= */}
        <div className="relative">
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500"></div>
            </div>
            <span className="relative px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-2xs">
              BLOQUE 4: CIERRE Y CONCILIACIÓN
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  SELECCIONAR VIAJE PARA CIERRE
                </label>
                <select
                  value={b4SelectedRegistroId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    setB4SelectedRegistroId(id || null);
                    const reg = registros.find((r) => r.id === id);
                    if (reg) {
                      setB4Observaciones(reg.observaciones || '');
                      setB4TieneIncidencia(Boolean(reg.incidencia));
                      setB4DetalleIncidencia(reg.detalleIncidencia || '');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="">Seleccionar viaje arribado...</option>
                  {registros
                    .filter((r) => r.bloque3Completado && !r.bloque4Completado)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.unidad} - {r.nombreOperador} ({r.nombreRuta}) - Arribo: {r.horaArribo}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                  OBSERVACIONES GENERALES
                </label>
                <input
                  type="text"
                  value={b4Observaciones}
                  onChange={(e) => setB4Observaciones(e.target.value)}
                  placeholder="Ej: Llegada sin demoras, paquetería entregada completa..."
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={b4TieneIncidencia}
                  onChange={(e) => setB4TieneIncidencia(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>¿Hubo alguna incidencia o contratiempo en ruta?</span>
              </label>

              {b4TieneIncidencia && (
                <input
                  type="text"
                  value={b4DetalleIncidencia}
                  onChange={(e) => setB4DetalleIncidencia(e.target.value)}
                  placeholder="Detalle de incidencia (tráfico, retraso, ponchadura)..."
                  className="flex-1 max-w-md px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-lg text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              )}
            </div>

            {/* Bloque 4 Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveBloque4}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl uppercase tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                FINALIZAR Y CERRAR VIAJE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={scannerConfig.isOpen}
        onClose={() => setScannerConfig((prev) => ({ ...prev, isOpen: false }))}
        title={scannerConfig.title}
        onScan={scannerConfig.onScan}
        quickOptions={scannerConfig.quickOptions}
      />
    </div>
  );
};
