const { GoogleGenerativeAI } = require("@google/generative-ai");
const { matchAdministrativeDivision } = require("./elSalvadorData");

// Caché en memoria para evitar llamadas de red repetidas al listar modelos
let cachedModels = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de caché

async function getAvailableModelsFromGoogle(apiKey, logs) {
  const now = Date.now();
  if (cachedModels && (now - lastCacheTime < CACHE_TTL_MS)) {
    logs.push(`⚡ Usando modelos de visión en caché rápida: [${cachedModels.slice(0, 5).join(", ")}]`);
    return cachedModels;
  }

  try {
    logs.push("🔍 Consultado modelos disponibles en Google AI Studio API (v1beta)...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      if (data.models && Array.isArray(data.models)) {
        const supported = data.models
          .filter(m => {
            const name = m.name.toLowerCase();
            const methods = m.supportedGenerationMethods || [];
            return methods.includes("generateContent") && 
                   !name.includes("tts") && 
                   !name.includes("clip") && 
                   !name.includes("robotics") &&
                   !name.includes("image") &&
                   !name.includes("computer-use");
          })
          .map(m => m.name.replace(/^models\//, ""));

        // Prioridad de modelos de visión súper rápidos y precisos en Google AI Studio
        const priorityOrder = [
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-1.5-flash-latest",
          "gemini-1.5-pro-latest",
          "gemini-2.0-flash-exp",
          "gemini-flash-latest",
          "gemini-pro-latest"
        ];

        supported.sort((a, b) => {
          const idxA = priorityOrder.indexOf(a);
          const idxB = priorityOrder.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return 0;
        });

        cachedModels = supported;
        lastCacheTime = now;
        logs.push(`📋 Modelos de visión priorizados: [${supported.slice(0, 6).join(", ")}]`);
        return supported;
      }
    }
  } catch (err) {
    logs.push(`⚠️ Error al consultar modelos dinámicos: ${err.message}`);
  }

  const fallbackList = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-2.0-flash-exp"
  ];
  cachedModels = fallbackList;
  lastCacheTime = now;
  return fallbackList;
}

// Timeout helper para saltar rápido si un modelo tarda más de 5 segundos
function fetchWithTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout de ${timeoutMs}ms excedido`)), timeoutMs)
    )
  ]);
}

async function extractRouteInfoFromImage(imageBuffer, mimeType = "image/jpeg", fileName = "") {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
  const logs = [];

  logs.push(`🔍 Inicio de análisis de imagen (Archivo: ${fileName || 'Imagen Subida'}, Tipo: ${mimeType})`);

  if (apiKey) {
    logs.push("🔑 GEMINI_API_KEY detectada en variables de entorno. Inicializando Google AI Studio SDK...");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // 1. Obtener lista dinámica de modelos con caché rápida
      let modelNames = await getAvailableModelsFromGoogle(apiKey, logs);
      
      let result = null;
      let usedModel = "";
      let lastError = null;

      const prompt = `
        Analiza detenidamente esta imagen de banner publicitario de la empresa de encomiendas Amairany Express El Salvador.
        Lee minuciosamente todo el texto visible en la imagen y extrae un objeto JSON estricto con los siguientes campos:

        - "lugarPrincipal": El nombre de la ciudad, municipio o distrito que aparece en la imagen en letras más GRANDES y NEGRITAS (ejemplos reales leídos de la imagen: "SAN MATIAS", "NEJAPA", "SAN PABLO TACACHICO", "LA UNIÓN", "SAN JUAN OPICO", "CHALCHUAPA").
        - "lugarReferencia": El punto de referencia o dirección exacta escrita en la imagen (ejemplo: "FRENTE AL PARQUE CENTRAL", "FRENTE A LA CANCHA DE BASKETBOLL").
        - "dias": Los días de atención o entrega escritos en la imagen (ejemplo: "LUNES Y JUEVES", "JUEVES", "LUNES A SÁBADO").
        - "horario": Los horarios exactos de atención leídos de la imagen (ejemplo: "9:45 A.M - 10:15 A.M", "11:00 A.M - 11:30 A.M").
        - "tipoPunto": Tipo de punto de entrega ("PUNTO DE ENTREGA", "CASILLERO", "CENTRO DE ENVÍOS", "BODEGA CENTRAL").

        Devuelve ÚNICAMENTE el objeto JSON en este formato exacto:
        {
          "lugarPrincipal": "SAN MATIAS",
          "lugarReferencia": "FRENTE AL PARQUE CENTRAL",
          "dias": "LUNES Y JUEVES",
          "horario": "9:45 A.M - 10:15 A.M",
          "tipoPunto": "PUNTO DE ENTREGA"
        }
      `;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mimeType || "image/jpeg"
        }
      };

      for (const mName of modelNames) {
        try {
          logs.push(`🤖 Probando modelo de visión ultra-rápido: ${mName}...`);
          const model = genAI.getGenerativeModel({ model: mName });
          const res = await fetchWithTimeout(model.generateContent([prompt, imagePart]), 6000);
          
          if (res && res.response) {
            result = res;
            usedModel = mName;
            logs.push(`⚡ ¡Respuesta rápida obtenida con éxito usando ${mName}!`);
            break;
          }
        } catch (err) {
          lastError = err;
          logs.push(`⚠️ Saltando ${mName}: ${err.message}`);
        }
      }

      if (result) {
        const responseText = result.response.text().trim();
        logs.push(`📄 Respuesta raw de Gemini: ${responseText.slice(0, 200)}...`);
        
        // Extracción robusta de JSON usando Regex de bloque { ... }
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("La IA no devolvió un bloque JSON válido en la respuesta");
        }

        const cleanedJson = jsonMatch[0].trim();
        const extracted = JSON.parse(cleanedJson);

        // Auto-emparejar con la organización territorial de El Salvador
        const fullTextToMatch = `${extracted.lugarPrincipal || ""} ${extracted.lugarReferencia || ""}`;
        const locationMapping = matchAdministrativeDivision(fullTextToMatch);

        logs.push(`🇸🇻 Mapeo Territorial El Salvador -> Dep: ${locationMapping.departamento}, Mun: ${locationMapping.municipio}, Dist: ${locationMapping.distrito}`);

        console.log("\n========================================================");
        console.log("=== 🔍 AUDITORÍA DE EXTRACCIÓN IA VISION (RAILWAY) ===");
        logs.forEach(l => console.log(`[AUDIT LOG] ${l}`));
        console.log("========================================================\n");

        return {
          lugarPrincipal: (extracted.lugarPrincipal || "").toUpperCase(),
          lugarReferencia: extracted.lugarReferencia || "",
          dias: (extracted.dias || "").toUpperCase(),
          horario: extracted.horario || "",
          tipoPunto: extracted.tipoPunto || "PUNTO DE ENTREGA",
          departamento: locationMapping.departamento || "San Salvador",
          municipio: locationMapping.municipio || "San Salvador Oeste",
          distrito: locationMapping.distrito || "Nejapa",
          confidence: `IA Gemini Vision (${usedModel}) - ⚡ Respuesta Ultra-Rápida`,
          logs,
          apiSuccess: true
        };
      } else {
        logs.push(`❌ Ningún modelo de Gemini respondió. Último error: ${lastError ? lastError.message : 'Error desconocido'}`);
      }

    } catch (error) {
      logs.push(`❌ Error crítico durante procesamiento JSON de la IA: ${error.message}`);
      console.error("Error en extractRouteInfoFromImage Gemini:", error);
    }
  } else {
    logs.push("⚠️ No se encontró GEMINI_API_KEY configurada en Railway.");
  }

  // SI LA IA FALLA, MANTENER CAMPOS VACÍOS (REGLA ESTRICTA)
  logs.push("⚠️ La extracción por IA no pudo completarse automáticamente. Los campos permanecen vacíos para ingresar datos manualmente.");

  return {
    lugarPrincipal: "",
    lugarReferencia: "",
    dias: "",
    horario: "",
    tipoPunto: "PUNTO DE ENTREGA",
    departamento: "San Salvador",
    municipio: "San Salvador Centro",
    distrito: "San Salvador",
    confidence: "Extracción no realizada. Por favor complete los campos manualmente.",
    logs,
    apiSuccess: false
  };
}

async function extractPackageInfoFromImage(imageBuffer, mimeType = "image/jpeg", fileName = "") {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
  const logs = [];

  logs.push(`📦 Inicio de análisis OCR de Paquete / Guía (Archivo: ${fileName || 'Imagen Subida'}, Mime: ${mimeType})`);

  if (apiKey) {
    logs.push("🔑 GEMINI_API_KEY detectada. Consultando modelos dinámicos de visión...");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const availableModels = await getAvailableModelsFromGoogle(apiKey, logs);

      let result = null;
      let usedModel = "";
      let lastError = null;

      const prompt = `
        Analiza detenidamente esta imagen que corresponde a una nota manuscrita, etiqueta de paquete, recibo o guía de envío para la empresa de transporte Amairany Express El Salvador.
        Lee minuciosamente todo el texto (tanto impreso como escrito a mano) y extrae los datos clave en un formato JSON estricto.

        Instrucciones de extracción:
        - "cliente": Nombre de la persona o destinatario que recibe el paquete (ejemplo: "Gabriela", "María Elena Rodríguez").
        - "destino": Dirección, pueblo, municipio o punto de referencia donde se entrega (ejemplo: "Jayaque frente al parque central", "San Salvador").
        - "vendedor": Nombre de la tienda, marca, cliente vendedor o emisor del paquete (ejemplo: "Alessandra Kids", "Calzado María").
        - "valor": Precio o valor del paquete/producto en dólares sin símbolo $ (ejemplo: 4.00 o 15.00). Si no se especifica pon 0.00.
        - "envio": Precio o tarifa de envío del paquete en dólares sin símbolo $ (ejemplo: 1.00 o 3.00). Si no se especifica pon 0.00.
        - "total": Suma total de (valor + envío) en dólares sin símbolo $ (ejemplo: 5.00).
        - "telefono": Número de contacto o WhatsApp del destinatario (validar 8 dígitos, formatear "7788-9900" o "77889900").
        - "fechaEntrega": Día o fecha asignada para la entrega (ejemplo: "dd/mm/yy" o el día mencionado como "Lunes").

        Devuelve ÚNICAMENTE el objeto JSON estricto en este formato exacto:
        {
          "cliente": "Nombre Destinatario",
          "destino": "Dirección / Ubicación de Entrega",
          "vendedor": "Nombre Tienda / Vendedor",
          "valor": 4.00,
          "envio": 1.00,
          "total": 5.00,
          "telefono": "7788-9900",
          "fechaEntrega": "dd/mm/yy"
        }
      `;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mimeType || "image/jpeg"
        }
      };

      for (const mName of availableModels) {
        try {
          logs.push(`🤖 Intentando extracción OCR con modelo: ${mName}...`);
          const model = genAI.getGenerativeModel({ model: mName });
          const res = await fetchWithTimeout(model.generateContent([prompt, imagePart]), 8000);
          
          if (res && res.response) {
            result = res;
            usedModel = mName;
            logs.push(`⚡ Extracción OCR de paquete completada con éxito usando ${mName}!`);
            break;
          }
        } catch (err) {
          lastError = err;
          logs.push(`⚠️ Saltando ${mName}: ${err.message}`);
        }
      }

      if (result) {
        const responseText = result.response.text().trim();
        logs.push(`📄 Respuesta raw de Gemini: ${responseText}`);
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("La IA no devolvió una estructura JSON válida");
        }

        const extracted = JSON.parse(jsonMatch[0].trim());

        let valorNum = parseFloat(extracted.valor) || 0;
        let envioNum = parseFloat(extracted.envio) || 0;
        let totalNum = parseFloat(extracted.total) || +(valorNum + envioNum).toFixed(2);

        let telRaw = (extracted.telefono || "").replace(/\D/g, '');
        let formattedTel = telRaw.length === 8 ? `${telRaw.slice(0, 4)}-${telRaw.slice(4)}` : (extracted.telefono || "");

        console.log("\n========================================================");
        console.log("=== 🔍 AUDITORÍA DE EXTRACCIÓN PAQUETE IA (RAILWAY) ===");
        logs.forEach(l => console.log(`[AUDIT LOG] ${l}`));
        console.log("========================================================\n");

        return {
          cliente: extracted.cliente || "",
          destino: extracted.destino || "",
          vendedor: extracted.vendedor || "",
          valor: valorNum,
          envio: envioNum,
          total: totalNum,
          telefono: formattedTel,
          fechaEntrega: (extracted.fechaEntrega || "").trim(),
          confidence: `IA Gemini multimodal (${usedModel}) - ⚡ Lectura OCR Exitosa`,
          logs,
          apiSuccess: true
        };
      }
    } catch (error) {
      logs.push(`❌ Error durante extracción de paquete con Gemini: ${error.message}`);
    }
  } else {
    logs.push("⚠️ No se encontró la variable GEMINI_API_KEY en las variables del servidor.");
  }

  console.log("\n========================================================");
  console.log("=== ⚠️ AUDITORÍA FALLBACK PAQUETE IA (RAILWAY) ===");
  logs.forEach(l => console.log(`[AUDIT LOG] ${l}`));
  console.log("========================================================\n");

  return {
    cliente: "",
    destino: "",
    vendedor: "",
    valor: 0,
    envio: 0,
    total: 0,
    telefono: "",
    fechaEntrega: "",
    confidence: "Extracción no realizada. Por favor complete los campos manualmente.",
    logs,
    apiSuccess: false
  };
}

module.exports = {
  extractRouteInfoFromImage,
  extractPackageInfoFromImage
};

