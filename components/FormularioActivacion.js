import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import { guardarFormularioLocal } from '../lib/storage';
import { normalizarNombreVisible } from '../lib/identity';
import { colors, spacing, fontSizes, radius, shadow } from '../styles/theme';

const DEVICE_INFO = `react-native-${Platform.OS}`;

const GRUPOS_ACTIVACION = [
  { key: 'tienda_barrio', label: 'Tiendas de Barrio' },
  { key: 'mercados', label: 'Mercados' },
];

const TIPOS_TIENDAS = [
  { key: 'comercio', label: 'Comercio' },
  { key: 'no_habilitado', label: 'No habilitado' },
  { key: 'reactivacion', label: 'Reactivación' },
  { key: 'config_cuenta', label: 'Configuración de cuenta' },
  { key: 'reimpresion_qr', label: 'Reimpresión QR' },
];

const TIPOS_MERCADOS = [
  { key: 'comercio', label: 'Comercio' },
  { key: 'reactivacion_comercio', label: 'Reactivación comercio' },
  { key: 'transeunte', label: 'Transeúnte' },
  { key: 'reactivacion_transeunte', label: 'Reactivación transeúnte' },
  { key: 'limbo', label: 'Limbo' },
  { key: 'no_habilitado', label: 'No habilitado' },
  { key: 'reimpresion_qr', label: 'Reimpresión QR' },
];

const TAMANOS_TIENDA = ['Pequeña', 'Mediana', 'Grande'];
const TIPOS_COMERCIO = ['Comercio', 'Hogar y Muebles', 'Transporte y Servicio', 'Cuidado Personal y Belleza', 'Educación y Entretenimiento', 'Consumo'];

const CIUDADES = [
  {
    key: 'santa_cruz',
    label: 'Santa Cruz',
    zonas: [
      'Distrito Municipal 1: Piraí',
      'Distrito Municipal 2: Norte Interno',
      'Distrito Municipal 3: Estación Argentina',
      'Distrito Municipal 4: El Pari',
      'Distrito Municipal 5: Norte',
      'Distrito Municipal 6: Carretera Cotoca',
      'Distrito Municipal 7: Villa 1ro de Mayo',
      'Distrito Municipal 8: Plan 3000',
      'Distrito Municipal 9: Palmasola',
      'Distrito Municipal 10: El Bajío',
      'Distrito Municipal 11: Centro',
      'Distrito Municipal 12: Nuevo Palmar',
      'Distrito Municipal 13: Zona Industrial',
      'San Julian',
      '4 Cañadas',
      'La Guardia',
      'Paurito',
      'Concepcion',
      'El Torno',
      'Samaipata',
      'BBO',
    ],
  },
  {
    key: 'el_alto',
    label: 'El Alto',
    zonas: [
      'Distrito Municipal 1',
      'Distrito Municipal 2',
      'Distrito Municipal 3',
      'Distrito Municipal 4',
      'Distrito Municipal 5',
      'Distrito Municipal 6',
      'Distrito Municipal 7',
      'Distrito Municipal 8',
      'Distrito Municipal 9',
      'Distrito Municipal 10',
      'Distrito Municipal 11',
      'Distrito Municipal 12',
      'Distrito Municipal 13',
      'Distrito Municipal 14',
    ],
  },
  {
    key: 'la_paz',
    label: 'La Paz',
    zonas: ['Centro', 'Cotahuma', 'Mallasa', 'Max Paredes', 'Periférica', 'San Antonio', 'Sur'],
  },
  {
    key: 'cochabamba',
    label: 'Cochabamba',
    zonas: ['Norte', 'Sur', 'Este', 'Oeste', 'Central', 'Sacaba', 'Quillacollo', 'Tiquipaya'],
  },
  {
    key: 'oruro',
    label: 'Oruro',
    zonas: [
      'Sajama',
      'Mejillones',
      'Atahuallpa',
      'Litoral',
      'Carangas',
      'Sur carangas',
      'Ladislao Cabrera',
      'Avaroa',
      'Sebastian Pagador',
      'Poopó',
      'Saucari',
      'Cercado',
      'Dalence',
      'San Pedro de Totora',
      'Nor Carangas',
      'Tomas Barrón',
    ],
  },
  {
    key: 'montero',
    label: 'Montero',
    zonas: [
      'Mercado Villa Verde',
      'Mercado Popular',
      'Mercado Central de Montero',
      'Mercado El Alba',
      'Mercado Germán Moreno',
      'Abasto del Norte Mercado Privado',
      'Otros',
    ],
  },
  {
    key: 'san_ignacio',
    label: 'San Ignacio',
    zonas: ['San Ignacio'],
  },
  {
    key: 'tarija',
    label: 'Tarija',
    zonas: [
      'El Molino',
      'Zona Centro',
      'Mercado Central',
      'Mercado Campesino',
      'Bolivar',
      'La Loma',
      'La Pampa',
      'Las Panosas',
      'Villa Fatima',
      'Los Alamos',
      'Senac',
      'Los chapacos',
      'Gamoneda',
      'La Florida',
      'Eduardo Avaroa',
      'General Jose Martin',
      'Andaluz',
      'El Dorado',
      'Lourdes',
      'Abasto',
      'San Geronimo',
      'San Bernardo',
      'Pedro Antonio Flores',
      'Morros Blancos',
      'Universidad Autonoma Juan Misael Saracho',
      'San Lorenzo',
      'Yacuiba',
      'Panamericana',
      'San Antonio',
      'Juan XXIII',
      'Parque Tematico',
      'Miraflores',
      'Mendez arcos',
      'Plaza Principal',
      'Mercado San Martin',
      'Tabladita',
      'BBO',
    ],
  },
  {
    key: 'trinidad',
    label: 'Trinidad',
    zonas: [
      'BARRIO 30 DE JULIO',
      'JUNTA LIBERTAD',
      'BARRIO 6 DE JUNIO',
      'BARRIO COTOCA',
      'BARRIO EL TRIUNFO',
      'BARRIO MANGALITO',
      'BARRIO MOPERITA',
      'URBANIZACION EL PRADO',
      'BARRIO NUEVO AMANECER',
      'BARRIO VILLA VECINAL',
      'BARRIO PANTANAL',
      'JUNTA EL SUJO',
      'BARRIO PLATAFORMA',
      'BARRIO POZO OXIDACION',
      'JUNTA 1RO DE MAYO',
      'BARRIO SAN MARTIN',
      'BARRIO 17 DE JUNIO',
      'BARRIO SAN PEDRO',
      'VILLA MONASTERIO',
      'BARRIO SAN RAMONCITO',
      'JUNTA LOS ALAMOS',
      'BARRIO SANDUNGA',
      'JUNTA PROVINCIAS UNIDAS',
      'BARRIO SANTA MARIA',
      'BARRIO EL RECREO',
      'BARRIO URKUPIÑA',
      'BARRIO VIRGEN DEL ROSARIO',
      'BARRIO V. MAGDALENA',
      'BARRIO NIÑA AUTONOMA',
      'BARRIO VACA MEDRANO',
      'BARRIO VILLA JIMENA',
      'BIM.TOCOPILLA',
      'BARRIO VILLA LOLITA',
      'BARRIO VILLA MILDRE',
      'BARRIO VILLA MARIN FINAL- BARRIO PEDRO IG. MUIBA',
      'BARRIO VILLA MOISES',
      'CAMPUS UNIVERSITARIO UAB',
      'URBANIZACION MANA',
      'CEMENTERIO COVID',
      'CEMENTERIO JARDIN',
      'NORMAL DE MAESTROS',
      'EDMUNDO VACA MEDRANO',
      'URBANIZACION LAS PALMAS',
      'URBANIZACION SANTA INES',
      'URB. TAHICHI',
      'URBANIZACION UNIVERSITARIA',
      'BARRIO PATUJU II',
      'BARRIO 13 DE ABRIL',
      'BARRIO ARROYO CHICO',
      'ZONA BELLO HORIZONTE',
      'ZONA LAS BRISAS',
      'ZONA CHAPARRAL',
      'ZONA EL PALMAR',
      'ZONA EL CARMEN',
      'BARRIO LOS TOCOS',
      'BARRIO NUEVA TRINIDAD',
      'BARRIO EL ROSARIO',
      'BARRIO PAITITI',
      'BARRIO 12 DE ABRIL',
      'MERCADO CAMPESINO',
      'MERCADO POMPEYA',
      'MERCADO CENTRAL',
      'MERCADO COCHABAMBA',
      'MERCADO FATIMA',
      'MERCADO 13 DE ABRIL',
      'MERCADO PAITITI',
      'MERCADO VILLA VECINAL',
    ],
  },
  {
    key: 'sucre',
    label: 'Sucre',
    zonas: ['Distrito 1', 'Distrito 2', 'Distrito 3', 'Distrito 4', 'Distrito 5'],
  },
];

const CIUDAD_ALIASES = {
  santa_cruz: ['santa_cruz', 'santa_cruz_de_la_sierra', 'andres_ibanez'],
  el_alto: ['el_alto'],
  la_paz: ['la_paz', 'nuestra_senora_de_la_paz', 'murillo'],
  cochabamba: ['cochabamba'],
  oruro: ['oruro'],
  montero: ['montero'],
  san_ignacio: ['san_ignacio', 'san_ignacio_de_velasco'],
  tarija: ['tarija'],
  trinidad: ['trinidad'],
  sucre: ['sucre', 'chuquisaca'],
};

const normalizarCiudad = (valor = '') =>
  String(valor)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

const resolverCiudadKey = (valor = '') => {
  const normalized = normalizarCiudad(valor);
  if (!normalized) return '';
  const porKey = CIUDADES.find((c) => c.key === normalized);
  if (porKey) return porKey.key;
  const porLabel = CIUDADES.find((c) => normalizarCiudad(c.label) === normalized);
  return porLabel?.key || '';
};

const extraerExtension = (uri = '') => {
  const limpio = String(uri).split('?')[0].split('#')[0];
  const nombre = limpio.split('/').pop() || '';
  const ext = nombre.includes('.') ? nombre.split('.').pop().toLowerCase() : '';
  return /^[a-z0-9]{2,5}$/.test(ext) ? ext : 'jpg';
};

const formularioInicial = {
  tipo_grupo: '',
  tipo_activacion: '',
  id: '',
  tamano_tienda: '',
  ciudad_activacion: '',
  zona_activacion: '',
  impulsador: '',
  fecha_activacion: '',
  nombres_cliente: '',
  apellidos_cliente: '',
  ci_cliente: '',
  telefono_cliente: '',
  email_cliente: '',
  descargo_app: false,
  registro: false,
  cash_in: false,
  cash_out: false,
  p2p: false,
  qr_fisico: false,
  respaldo: false,
  hubo_error: false,
  descripcion_error: '',
  latitud: null,
  longitud: null,
  base_activacion: '',
  es_reactivacion: false,
  foto_url: '',
  estado_sync: 'offline_pending',
  dispositivo: DEVICE_INFO,
};

export default function FormularioActivacion({
  cantidadOffline,
  contarFormulariosLocales,
  isConnected,
  onSincronizar,
  usuario,
}) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [fotoPrincipal, setFotoPrincipal] = useState(null);
  const [detectandoCiudad, setDetectandoCiudad] = useState(false);
  const { width } = useWindowDimensions();
  const imagenComercioWidth = Math.max(200, Math.min(width - spacing.lg * 2, 720));
  const imagenComercioHeight = Math.round(imagenComercioWidth / (16 / 9));
  const botonShadow = Platform.OS === 'web'
    ? { boxShadow: '0px 2px 6px rgba(0,0,0,0.3)' }
    : shadow.base;

  const actualizarCampo = (campo, valor) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  const tiposDisponibles = formulario.tipo_grupo === 'tienda_barrio' ? TIPOS_TIENDAS
    : formulario.tipo_grupo === 'mercados' ? TIPOS_MERCADOS
    : [];

  const ciudadSeleccionada = useMemo(
    () => CIUDADES.find(c => c.key === formulario.ciudad_activacion) || null,
    [formulario.ciudad_activacion],
  );
  const zonasDisponibles = useMemo(
    () => ciudadSeleccionada?.zonas || [],
    [ciudadSeleccionada],
  );
  const ciudadLabel = ciudadSeleccionada?.label || formulario.ciudad_activacion || '';

  useEffect(() => {
    if (!formulario.ciudad_activacion) return;
    if (zonasDisponibles.length !== 1) return;
    if (formulario.zona_activacion) return;
    setFormulario((prev) => ({ ...prev, zona_activacion: zonasDisponibles[0] }));
  }, [formulario.ciudad_activacion, formulario.zona_activacion, zonasDisponibles]);

  const baseActivacionPreview = useMemo(() => {
    if (formulario.tipo_grupo === 'tienda_barrio') return 'tienda_barrio';
    switch (formulario.tipo_activacion) {
      case 'comercio':
      case 'reactivacion_comercio':
        return 'comercio';
      case 'transeunte':
      case 'reactivacion_transeunte':
        return 'transeunte';
      case 'limbo':
        return 'limbo';
      case 'no_habilitado':
      case 'reimpresion_qr':
      default:
        return 'none';
    }
  }, [formulario.tipo_grupo, formulario.tipo_activacion]);

  const requiereTipoComercio =
    (formulario.tipo_grupo === 'tienda_barrio' && ['comercio', 'reactivacion'].includes(formulario.tipo_activacion)) ||
    baseActivacionPreview === 'comercio';

  const requiereTamano = formulario.tipo_grupo === 'tienda_barrio'
    && ['comercio', 'reactivacion'].includes(formulario.tipo_activacion);

  const requiereFotos = formulario.tipo_activacion
    && !['transeunte', 'reactivacion_transeunte'].includes(formulario.tipo_activacion);

  const onGrupoChange = (grupo) => {
    setFormulario(prev => ({
      ...prev,
      tipo_grupo: grupo,
      tipo_activacion: '',
      tamano_tienda: '',
      tipo_comercio: '',
    }));
  };

  const onTipoActivacionChange = (key) => {
    setFormulario(prev => ({
      ...prev,
      tipo_activacion: key,
    }));
  };

  const resolverCiudadDesdeDireccion = (dir = {}) => {
    const candidatos = [dir.city, dir.district, dir.subregion, dir.region, dir.name]
      .filter(Boolean)
      .map((v) => normalizarCiudad(v));

    for (const candidato of candidatos) {
      const directa = resolverCiudadKey(candidato);
      if (directa) return directa;

      for (const [key, aliases] of Object.entries(CIUDAD_ALIASES)) {
        if (aliases.some((alias) => candidato.includes(alias))) {
          return key;
        }
      }
    }
    return '';
  };

  const detectarCiudadPorGps = useCallback(async ({ silent = false } = {}) => {
    if (Platform.OS === 'web') return;
    setDetectandoCiudad(true);
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (permiso.status !== 'granted') {
        if (!silent) {
          Alert.alert('Ubicación desactivada', 'Activa el permiso de ubicación para detectar la ciudad automáticamente.');
        }
        return;
      }

      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: ubicacion.coords.latitude,
        longitude: ubicacion.coords.longitude,
      });

      let ciudadGps = resolverCiudadDesdeDireccion(geocoded?.[0] || {});
      if (!ciudadGps) {
        ciudadGps = resolverCiudadKey(usuario?.plaza);
      }
      if (!ciudadGps) {
        if (!silent) {
          Alert.alert(
            'Ciudad no detectada',
            'No pudimos identificar la ciudad con GPS. Revisa la ubicación del dispositivo e intenta nuevamente.'
          );
        }
        return;
      }

      setFormulario((prev) => ({
        ...prev,
        ciudad_activacion: ciudadGps,
        zona_activacion: prev.ciudad_activacion === ciudadGps ? prev.zona_activacion : '',
      }));
    } catch (error) {
      console.warn('No se pudo detectar ciudad por GPS:', error?.message || error);
      if (!silent) {
        Alert.alert('Error de ubicación', 'No se pudo obtener la ubicación actual.');
      }
    } finally {
      setDetectandoCiudad(false);
    }
  }, [usuario?.plaza]);

  // Auto-set de datos provenientes del usuario y fecha actual
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const ciudadUsuario = resolverCiudadKey(usuario?.plaza);
    const nombreUsuario = normalizarNombreVisible(usuario?.nombre || '');
    setFormulario(prev => ({
      ...prev,
      fecha_activacion: prev.fecha_activacion || hoy,
      impulsador: prev.impulsador || nombreUsuario || '',
      ciudad_activacion: prev.ciudad_activacion || (!isConnected ? ciudadUsuario : '') || '',
    }));
  }, [isConnected, usuario]);

  useEffect(() => {
    if (isConnected === false) return;
    if (formulario.ciudad_activacion) return;
    detectarCiudadPorGps({ silent: true });
  }, [detectarCiudadPorGps, formulario.ciudad_activacion, isConnected]);

  const limpiarFotosSiNoSeUsan = () => {
    if (!requiereFotos) {
      setFotoPrincipal(null);
      actualizarCampo('foto_url', '');
    }
  };

  useEffect(() => {
    limpiarFotosSiNoSeUsan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiereFotos]);

  const tomarFoto = async (setter, fieldName) => {
    try {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status !== 'granted') {
        return Alert.alert('Permiso denegado', 'Se requiere permiso para acceder a la cámara.');
      }

      const result = await ImagePicker.launchCameraAsync({
        // MediaTypeOptions es la opción estable; MediaType puede no estar definido en ciertas versiones
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsEditing: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      const uri = asset?.uri;
      if (!uri) {
        return Alert.alert('Error', 'La ruta de imagen no es válida');
      }

      let sizeMB = 0;
      try {
        const assetSize = typeof asset?.fileSize === 'number' ? asset.fileSize : null;
        if (assetSize !== null) {
          sizeMB = Number(assetSize) / 1024 / 1024;
        } else {
          const info = await FileSystem.getInfoAsync(uri, { size: true });
          sizeMB = info?.size ? Number(info.size) / 1024 / 1024 : 0;
        }
      } catch {
        // en algunos dispositivos no retorna size; continuamos
      }

      if (sizeMB > 6) {
        return Alert.alert('❌ Imagen demasiado grande', 'Intenta una foto más liviana (≤ 6 MB).');
      }

      // Persistimos la foto en documentDirectory para que no se pierda antes de sincronizar.
      const baseDir = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}activaciones-pendientes`;
      await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
      const ext = extraerExtension(uri);
      const destino = `${baseDir}/${fieldName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await FileSystem.copyAsync({ from: uri, to: destino });

      setter(destino);
      actualizarCampo(fieldName, destino);

    } catch (error) {
      console.error('❌ Error al tomar o subir imagen:', error);
      Alert.alert('Error crítico', `No se pudo procesar la imagen. ${error?.message || ''}`);
    }
  };

  const validar = (data = formulario) => {
    const impulsadorActual = normalizarNombreVisible(data.impulsador || usuario?.nombre || '');
    if (!data.tipo_grupo) return 'Selecciona el tipo de activación (Tiendas de Barrio o Mercados).';
    if (!data.tipo_activacion) return 'Selecciona el tipo de activación específico.';
    if (!data.ciudad_activacion) {
      return isConnected === false
        ? 'Selecciona la ciudad de activación.'
        : 'No se pudo detectar la ciudad por GPS. Pulsa "Actualizar ubicación".';
    }
    if (!data.zona_activacion) return 'Selecciona la zona de activación.';
    if (!impulsadorActual) return 'No se pudo obtener el nombre del activador.';

    if (!data.nombres_cliente.trim()) return 'Ingresa los nombres del cliente.';
    if (!data.apellidos_cliente.trim()) return 'Ingresa los apellidos del cliente.';
    if (!/^\d{7,9}$/.test(data.ci_cliente)) return 'La cédula debe tener 7 a 9 números.';
    if (!/^\d{8}$/.test(data.telefono_cliente)) return 'El teléfono debe tener exactamente 8 números.';
    if (data.email_cliente && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_cliente)) return 'El correo no parece válido.';

    if (requiereTamano && !data.tamano_tienda) {
      return 'Selecciona el tamaño de la tienda.';
    }
    if (requiereTipoComercio && !data.tipo_comercio) {
      return 'Selecciona el tipo de comercio.';
    }

    if (!data.fecha_activacion) {
      return 'No se pudo obtener la fecha de activación.';
    }

    if (requiereFotos && Platform.OS !== 'web') {
      if (!data.foto_url && !fotoPrincipal) return 'Debes cargar la foto principal (QR/comercio).';
    }

    return null;
  };

  const guardarFormulario = async () => {
    // Asegura fecha e id si no están seteados (fallback a hoy)
    const fecha = formulario.fecha_activacion || new Date().toISOString().split('T')[0];
    const formId = formulario.id || uuidv4();
    const formularioConBasicos = {
      ...formulario,
      fecha_activacion: fecha,
      id: formId,
      impulsador: normalizarNombreVisible(formulario.impulsador || usuario?.nombre || ''),
    };
    if (!formulario.fecha_activacion || !formulario.id) {
      setFormulario(prev => ({ ...prev, fecha_activacion: fecha, id: formId }));
    }

    const errorMsg = validar(formularioConBasicos);
    if (errorMsg) {
      Alert.alert('Campo requerido', errorMsg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(errorMsg);
      }
      return;
    }

    try {
      let latitud = null; let longitud = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const ubicacion = await Location.getCurrentPositionAsync({});
        latitud = ubicacion.coords.latitude;
        longitud = ubicacion.coords.longitude;
      }

      const baseActivacion = (() => {
        if (formularioConBasicos.tipo_grupo === 'tienda_barrio') return 'tienda_barrio';
        switch (formularioConBasicos.tipo_activacion) {
          case 'comercio':
          case 'reactivacion_comercio':
            return 'comercio';
          case 'transeunte':
          case 'reactivacion_transeunte':
            return 'transeunte';
          case 'limbo':
            return 'limbo';
          case 'no_habilitado':
          case 'reimpresion_qr':
          default:
            return 'none';
        }
      })();
      const esReactivacion = /reactivacion/i.test(formulario.tipo_activacion || '');

      const datosFormulario = {
        ...formularioConBasicos,
        base_activacion: baseActivacion,
        fecha_activacion: fecha,
        latitud,
        longitud,
        es_reactivacion: esReactivacion,
        usuario_id: usuario.id,
        impulsador: formularioConBasicos.impulsador,
        plaza: formulario.ciudad_activacion,
        foto_url: formulario.foto_url || fotoPrincipal || null,
        estado_sync: 'offline_pending',
        dispositivo: DEVICE_INFO,
      };

      await guardarFormularioLocal(datosFormulario);
      Alert.alert('Guardado local', 'Formulario guardado localmente. ⏳');
      contarFormulariosLocales?.();
      limpiarFotosSiNoSeUsan();

      setFormulario({
        ...formularioInicial,
        id: '',
        impulsador: normalizarNombreVisible(usuario?.nombre || ''),
        ciudad_activacion: isConnected === false
          ? resolverCiudadKey(usuario?.plaza)
          : formularioConBasicos.ciudad_activacion,
      });
      setFotoPrincipal(null);
    } catch (err) {
      console.error('Error al guardar formulario:', err);
      Alert.alert('Error', err?.message ? err.message : 'No se pudo guardar el formulario.');
    }
  };

  if (!usuario || !usuario.id) {
    return <Text style={{ padding: 20, color: colors.text }}>Cargando usuario...</Text>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroCard}>
        <Text style={styles.titulo}>Formulario de Activación</Text>
        <Text style={styles.subtitulo}>Registro en campo y sincronización segura</Text>
        <View style={styles.heroMetaRow}>
          <View style={[styles.badge, styles.badgePrimary]}>
            <Text style={styles.badgeText}>Pendientes: {cantidadOffline}</Text>
          </View>
          <View style={[styles.badge, requiereFotos ? styles.badgeAccent : styles.badgeNeutral]}>
            <Text style={styles.badgeText}>{requiereFotos ? 'Requiere foto' : 'Sin foto'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos automáticos</Text>
        <View style={styles.helperRow}>
          <Text style={styles.helperLabel}>Ciudad</Text>
          <Text style={styles.helperValue}>{ciudadLabel || '—'}</Text>
        </View>
        <View style={styles.helperRow}>
          <Text style={styles.helperLabel}>Zona</Text>
          <Text style={styles.helperValue}>{formulario.zona_activacion || '—'}</Text>
        </View>
        <View style={styles.helperRow}>
          <Text style={styles.helperLabel}>Impulsador</Text>
          <Text style={styles.helperValue}>{formulario.impulsador || usuario?.nombre || '—'}</Text>
        </View>
        <View style={styles.helperRow}>
          <Text style={styles.helperLabel}>Fecha</Text>
          <Text style={styles.helperValue}>{formulario.fecha_activacion || '—'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Configuración de activación</Text>

        <Text style={styles.label}>Tipo de Activación</Text>
        <Picker
          selectedValue={formulario.tipo_grupo}
          onValueChange={onGrupoChange}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar..." value="" />
          {GRUPOS_ACTIVACION.map(item => (
            <Picker.Item key={item.key} label={item.label} value={item.key} />
          ))}
        </Picker>

        {formulario.tipo_grupo ? (
          <>
            <Text style={styles.label}>
              {formulario.tipo_grupo === 'tienda_barrio'
                ? 'Tipo de Activación Tienda de Barrio'
                : 'Tipo de Activación Mercados'}
            </Text>
            <Picker
              selectedValue={formulario.tipo_activacion}
              onValueChange={onTipoActivacionChange}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar..." value="" />
              {tiposDisponibles.map(item => (
                <Picker.Item key={item.key} label={item.label} value={item.key} />
              ))}
            </Picker>

            <View style={styles.guiaCard}>
              <Text style={styles.guiaTitle}>Guía visual rápida</Text>
              <Text style={styles.guiaText}>
                {formulario.tipo_grupo === 'tienda_barrio'
                  ? 'Tienda de barrio: prioriza comercio/reactivación y usa esta referencia para validar local y contexto.'
                  : 'Mercados: distingue comercio vs transeúnte y registra el tipo correcto antes de guardar.'}
              </Text>
              <Image
                source={require('../assets/comercio.png')}
                style={[styles.guiaImagen, { width: imagenComercioWidth, height: imagenComercioHeight }]}
                resizeMode="cover"
              />
              <View style={styles.guiaLegend}>
                <Text style={styles.guiaLegendItem}>Comercio / Reactivación comercio: requiere foto y detalle comercial.</Text>
                <Text style={styles.guiaLegendItem}>Transeúnte / Reactivación transeúnte: no requiere foto de evidencia.</Text>
                <Text style={styles.guiaLegendItem}>No habilitado, limbo y reimpresión: registra observación y continúa flujo.</Text>
              </View>
            </View>
          </>
        ) : null}

        {requiereTipoComercio && (
          <>
            <Text style={styles.label}>Tipo de Comercio</Text>
            <Picker
              selectedValue={formulario.tipo_comercio}
              onValueChange={(v) => actualizarCampo('tipo_comercio', v)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar..." value="" />
              {TIPOS_COMERCIO.map(item => (
                <Picker.Item key={item} label={item} value={item} />
              ))}
            </Picker>
          </>
        )}

        {requiereTamano && (
          <>
            <Text style={styles.label}>Tamaño de la tienda</Text>
            <Picker
              selectedValue={formulario.tamano_tienda}
              onValueChange={(v) => actualizarCampo('tamano_tienda', v)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar..." value="" />
              {TAMANOS_TIENDA.map(item => (
                <Picker.Item key={item} label={item} value={item} />
              ))}
            </Picker>
          </>
        )}

        <Text style={styles.label}>Ciudad de Activación</Text>
        {isConnected === false ? (
          <Picker
            selectedValue={formulario.ciudad_activacion}
            onValueChange={(v) => {
              actualizarCampo('ciudad_activacion', v);
              actualizarCampo('zona_activacion', '');
            }}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar..." value="" />
            {CIUDADES.map(item => (
              <Picker.Item key={item.key} label={item.label} value={item.key} />
            ))}
          </Picker>
        ) : (
          <View style={styles.gpsCityBox}>
            <Text style={styles.gpsCityText}>
              {ciudadLabel
                ? `Detectada por GPS: ${ciudadLabel}`
                : 'Detectando ciudad por GPS...'}
            </Text>
            <TouchableOpacity
              style={[styles.gpsButton, detectandoCiudad && styles.botonDisabled]}
              onPress={() => detectarCiudadPorGps()}
              disabled={detectandoCiudad}
              activeOpacity={0.85}
            >
              {detectandoCiudad ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.gpsButtonText}>Actualizar ubicación</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Zona de Activación</Text>
        <Picker
          selectedValue={formulario.zona_activacion}
          onValueChange={(v) => actualizarCampo('zona_activacion', v)}
          style={styles.picker}
          enabled={!!formulario.ciudad_activacion}
        >
          <Picker.Item label="Seleccionar..." value="" />
          {zonasDisponibles.map(z => (
            <Picker.Item key={z} label={z} value={z} />
          ))}
        </Picker>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos del cliente</Text>
        <Text style={styles.label}>Nombres</Text>
        <TextInput
          style={styles.input}
          value={formulario.nombres_cliente}
          onChangeText={(v) => actualizarCampo('nombres_cliente', v)}
        />

        <Text style={styles.label}>Apellidos</Text>
        <TextInput
          style={styles.input}
          value={formulario.apellidos_cliente}
          onChangeText={(v) => actualizarCampo('apellidos_cliente', v)}
        />

        <Text style={styles.label}>Cédula de Identidad</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={9}
          value={formulario.ci_cliente}
          onChangeText={(v) => actualizarCampo('ci_cliente', v.replace(/\D/g, ''))}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={8}
          value={formulario.telefono_cliente}
          onChangeText={(v) => actualizarCampo('telefono_cliente', v.replace(/\D/g, ''))}
        />

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={formulario.email_cliente}
          onChangeText={(v) => actualizarCampo('email_cliente', v)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Checklist de activación</Text>
        {['descargo_app', 'registro', 'cash_in', 'cash_out', 'p2p', 'qr_fisico', 'respaldo'].map(key => (
          <View key={key} style={styles.switchRow}>
            <Text style={styles.switchLabel}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
            <Switch
              value={formulario[key]}
              onValueChange={(v) => actualizarCampo(key, v)}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
            />
          </View>
        ))}

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>¿HUBO ERROR?</Text>
          <Switch
            value={formulario.hubo_error}
            onValueChange={(v) => actualizarCampo('hubo_error', v)}
            trackColor={{ false: colors.inputBorder, true: colors.warning }}
          />
        </View>

        {formulario.hubo_error && (
          <>
            <Text style={styles.label}>Descripción del error</Text>
            <TextInput
              value={formulario.descripcion_error}
              onChangeText={(v) => actualizarCampo('descripcion_error', v)}
              style={styles.input}
            />
          </>
        )}
      </View>

      {requiereFotos ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fotografías</Text>
          <Text style={styles.label}>Foto de evidencia (QR/Comercio)</Text>
          <TouchableOpacity
            onPress={() => tomarFoto(setFotoPrincipal, 'foto_url')}
            style={[styles.botonMini, { backgroundColor: colors.primary, ...botonShadow }]}
            activeOpacity={0.85}
          >
            <Text style={styles.botonTextoMini}>Tomar Foto</Text>
          </TouchableOpacity>
          {fotoPrincipal ? <Image source={{ uri: fotoPrincipal }} style={styles.imagenMiniatura} /> : null}
        </View>
      ) : null}

      <View style={styles.botonesRow}>
        <TouchableOpacity
          onPress={guardarFormulario}
          style={[styles.botonMini, { backgroundColor: colors.primary, ...botonShadow }]}
          activeOpacity={0.85}
        >
          <Text style={styles.botonTextoMini}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSincronizar}
          style={[styles.botonMini, styles.botonSecundario, { backgroundColor: colors.success, ...botonShadow }]}
          activeOpacity={0.85}
        >
          <Text style={styles.botonTextoMini}>Sincronizar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
  },
  heroCard: {
    backgroundColor: colors.headerBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#08131F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  badgePrimary: {
    backgroundColor: 'rgba(23, 105, 255, 0.3)',
  },
  badgeAccent: {
    backgroundColor: 'rgba(255, 138, 0, 0.28)',
  },
  badgeNeutral: {
    backgroundColor: 'rgba(182, 198, 214, 0.24)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#0D243A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titulo: {
    fontSize: fontSizes.xlarge,
    fontWeight: '700',
    marginBottom: 2,
    color: colors.headerText,
  },
  subtitulo: {
    fontSize: fontSizes.small,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: '#CDDBEA',
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.primaryDark,
  },
  label: {
    fontSize: fontSizes.medium,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.text,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: fontSizes.medium,
  },
  picker: {
    backgroundColor: colors.inputBackground,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  gpsCityBox: {
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
  },
  gpsCityText: {
    color: colors.text,
    fontSize: fontSizes.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  gpsButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  helperLabel: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  helperValue: {
    color: colors.text,
    fontSize: fontSizes.small,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  guiaCard: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  guiaTitle: {
    color: colors.primaryDark,
    fontSize: fontSizes.medium,
    fontWeight: '700',
  },
  guiaText: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
    marginTop: 4,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  guiaImagen: {
    borderRadius: radius.md,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  guiaLegend: {
    marginTop: spacing.sm,
  },
  guiaLegendItem: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  switchLabel: {
    color: colors.text,
    fontSize: fontSizes.small,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  botonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  botonMini: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    minWidth: 130,
  },
  botonSecundario: {
    marginLeft: spacing.sm,
  },
  botonTextoMini: {
    color: '#FFFFFF',
    fontSize: fontSizes.medium,
    fontWeight: '700',
    textAlign: 'center',
  },
  imagenMiniatura: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
