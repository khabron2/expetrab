import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("crm.db");

// Debug: Check if Webhook URL is loaded
if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
  console.log("✅ Google Sheets Webhook URL detectada.");
} else {
  console.warn("⚠️ ADVERTENCIA: GOOGLE_SHEET_WEBHOOK_URL no está configurada en los Secrets.");
}

// Google Sheets Sync Helper (Simple Webhook version)
async function syncToSheet(data: any) {
  // Fallback to the URL provided by the user if the environment variable is missing
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyVIovc4QEG19cglkmPA2KqkTdvWU0DKgzDX9TaS7abFS6tgEnIix2ESqSXq-WRAldr_g/exec";

  if (!webhookUrl) {
    console.log("Google Sheets sync skipped: Webhook URL not found.");
    return;
  }

  console.log(`Intentando sincronizar expediente ${data.numero_expediente} con Google Sheets...`);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        fecha: new Date().toISOString(),
        estado: 'Ingresado'
      })
    });
    
    if (response.ok) {
      console.log(`✅ Sincronización exitosa: Expediente ${data.numero_expediente} enviado a Google Sheets.`);
    } else {
      const errorText = await response.text();
      console.error(`❌ Error en Webhook (Status ${response.status}):`, errorText);
    }
  } catch (error) {
    console.error("❌ Error de red al sincronizar con Google Sheets:", error);
  }
}

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS EXPEDIENTES (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_expediente TEXT UNIQUE,
    denunciante_nombre TEXT,
    denunciante_dni TEXT,
    denunciante_email TEXT,
    denunciante_telefono TEXT,
    denunciante_calle TEXT,
    denunciante_numeracion TEXT,
    denunciante_barrio TEXT,
    denunciante_entre_calle_1 TEXT,
    denunciante_entre_calle_2 TEXT,
    denunciante_lote TEXT,
    empresa_denunciada TEXT,
    empresa_denunciada_2 TEXT,
    empresa_denunciada_3 TEXT,
    empresa_denunciada_4 TEXT,
    motivo_reclamo TEXT,
    peticiones TEXT,
    estado TEXT DEFAULT 'Ingresado',
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME,
    observaciones TEXT
  );

  CREATE TABLE IF NOT EXISTS AUDIENCIAS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expediente_id INTEGER,
    fecha_hora DATETIME,
    tipo TEXT,
    estado TEXT DEFAULT 'Programada',
    FOREIGN KEY (expediente_id) REFERENCES EXPEDIENTES(id)
  );

  CREATE TABLE IF NOT EXISTS MOVIMIENTOS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expediente_id INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    accion TEXT,
    usuario TEXT,
    observacion TEXT,
    FOREIGN KEY (expediente_id) REFERENCES EXPEDIENTES(id)
  );
`);

// Migration: Add new columns if they don't exist
const columns = db.prepare("PRAGMA table_info(EXPEDIENTES)").all() as any[];
const columnNames = columns.map(c => c.name);
const newCols = [
  'denunciante_calle', 
  'denunciante_numeracion', 
  'denunciante_barrio', 
  'denunciante_entre_calle_1', 
  'denunciante_entre_calle_2', 
  'denunciante_lote',
  'empresa_denunciada_2',
  'empresa_denunciada_3',
  'empresa_denunciada_4',
  'peticiones'
];

newCols.forEach(col => {
  if (!columnNames.includes(col)) {
    try {
      db.prepare(`ALTER TABLE EXPEDIENTES ADD COLUMN ${col} TEXT`).run();
    } catch (e) {
      console.log(`Column ${col} already exists or error adding it.`);
    }
  }
});


// Seed Data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM EXPEDIENTES").get() as { count: number };
if (count.count === 0) {
  const insertExpediente = db.prepare(`
    INSERT INTO EXPEDIENTES (numero_expediente, denunciante_nombre, denunciante_dni, empresa_denunciada, motivo_reclamo, estado, fecha_ingreso)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const states = ['Ingresado', 'En proceso', 'Resuelto', 'Archivado'];
  const companies = ['Telefónica S.A.', 'Edesur', 'Metrogas', 'Banco Nación', 'Mercado Libre'];
  
  for (let i = 1; i <= 20; i++) {
    const estado = states[Math.floor(Math.random() * states.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    insertExpediente.run(
      `EXP-2024-${String(i).padStart(4, '0')}`,
      `Usuario Ejemplo ${i}`,
      `${30000000 + i}`,
      companies[Math.floor(Math.random() * companies.length)],
      "Incumplimiento de contrato / Servicio deficiente",
      estado,
      date.toISOString()
    );
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/debug/sheet-test", async (req, res) => {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyVIovc4QEG19cglkmPA2KqkTdvWU0DKgzDX9TaS7abFS6tgEnIix2ESqSXq-WRAldr_g/exec";
    
    if (!webhookUrl) {
      return res.status(400).json({ 
        error: "Webhook URL no encontrada.",
        env_keys: Object.keys(process.env).filter(k => k.includes("SHEET"))
      });
    }

    try {
      const testData = {
        numero_expediente: "TEST-000",
        denunciante_nombre: "Prueba de Conexión",
        denunciante_dni: "000",
        denunciante_email: "test@test.com",
        denunciante_telefono: "000",
        empresa_denunciada: "Empresa Test",
        motivo_reclamo: "Prueba de integración",
        peticiones: "Ninguna",
        fecha: new Date().toISOString(),
        estado: 'Prueba'
      };

      console.log("Enviando prueba a:", webhookUrl);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const text = await response.text();
      res.json({
        status: response.status,
        statusText: response.statusText,
        responseText: text,
        webhookUrl: webhookUrl.substring(0, 25) + "..."
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Error al conectar con el Webhook", 
        details: error.message 
      });
    }
  });

  app.get("/api/stats", (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as count FROM EXPEDIENTES").get() as any;
    const activos = db.prepare("SELECT COUNT(*) as count FROM EXPEDIENTES WHERE estado IN ('Ingresado', 'En proceso')").get() as any;
    const resueltos = db.prepare("SELECT COUNT(*) as count FROM EXPEDIENTES WHERE estado = 'Resuelto'").get() as any;
    const archivados = db.prepare("SELECT COUNT(*) as count FROM EXPEDIENTES WHERE estado = 'Archivado'").get() as any;
    
    // Monthly evolution
    const monthly = db.prepare(`
      SELECT strftime('%Y-%m', fecha_ingreso) as month, COUNT(*) as count 
      FROM EXPEDIENTES 
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 6
    `).all();

    // Distribution by state
    const distribution = db.prepare(`
      SELECT estado, COUNT(*) as value 
      FROM EXPEDIENTES 
      GROUP BY estado
    `).all();

    // Hourly distribution (Heatmap data)
    const hourly = db.prepare(`
      SELECT strftime('%H', fecha_ingreso) as hour, COUNT(*) as count 
      FROM EXPEDIENTES 
      GROUP BY hour 
      ORDER BY hour ASC
    `).all();

    res.json({
      total: total.count,
      activos: activos.count,
      resueltos: resueltos.count,
      archivados: archivados.count,
      avgResolutionTime: 12, // Mocked for now
      monthly: monthly.reverse(),
      distribution,
      hourly
    });
  });

  app.get("/api/expedientes", (req, res) => {
    const { search, estado, limit = 50, offset = 0 } = req.query;
    let query = "SELECT * FROM EXPEDIENTES WHERE 1=1";
    const params: any[] = [];

    if (search) {
      query += " AND (numero_expediente LIKE ? OR denunciante_nombre LIKE ? OR denunciante_dni LIKE ? OR empresa_denunciada LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (estado) {
      query += " AND estado = ?";
      params.push(estado);
    }

    query += " ORDER BY fecha_ingreso DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  });

  app.get("/api/expedientes/:id", (req, res) => {
    const expediente = db.prepare("SELECT * FROM EXPEDIENTES WHERE id = ?").get(req.params.id);
    const movimientos = db.prepare("SELECT * FROM MOVIMIENTOS WHERE expediente_id = ? ORDER BY fecha DESC").all(req.params.id);
    const audiencias = db.prepare("SELECT * FROM AUDIENCIAS WHERE expediente_id = ? ORDER BY fecha_hora ASC").all(req.params.id);
    
    if (!expediente) return res.status(404).json({ error: "No encontrado" });
    res.json({ ...expediente, movimientos, audiencias });
  });

  app.post("/api/expedientes", (req, res) => {
    const { 
      denunciante_nombre, 
      denunciante_dni, 
      denunciante_email, 
      denunciante_telefono, 
      denunciante_calle,
      denunciante_numeracion,
      denunciante_barrio,
      denunciante_entre_calle_1,
      denunciante_entre_calle_2,
      denunciante_lote,
      empresa_denunciada, 
      empresa_denunciada_2,
      empresa_denunciada_3,
      empresa_denunciada_4,
      motivo_reclamo,
      peticiones
    } = req.body;

    const numero_expediente = `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const stmt = db.prepare(`
        INSERT INTO EXPEDIENTES (
          numero_expediente, 
          denunciante_nombre, 
          denunciante_dni, 
          denunciante_email, 
          denunciante_telefono, 
          denunciante_calle,
          denunciante_numeracion,
          denunciante_barrio,
          denunciante_entre_calle_1,
          denunciante_entre_calle_2,
          denunciante_lote,
          empresa_denunciada, 
          empresa_denunciada_2,
          empresa_denunciada_3,
          empresa_denunciada_4,
          motivo_reclamo,
          peticiones,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        numero_expediente,
        denunciante_nombre,
        denunciante_dni,
        denunciante_email,
        denunciante_telefono,
        denunciante_calle,
        denunciante_numeracion,
        denunciante_barrio,
        denunciante_entre_calle_1,
        denunciante_entre_calle_2,
        denunciante_lote,
        empresa_denunciada,
        empresa_denunciada_2,
        empresa_denunciada_3,
        empresa_denunciada_4,
        motivo_reclamo,
        peticiones,
        'Ingresado'
      );

      db.prepare(`
        INSERT INTO MOVIMIENTOS (expediente_id, accion, usuario, observacion)
        VALUES (?, ?, ?, ?)
      `).run(result.lastInsertRowid, "Ingreso de Reclamo", "Sistema", "Reclamo ingresado vía Formulario Web");

      // Sync to Google Sheets
      syncToSheet({
        numero_expediente,
        denunciante_nombre,
        denunciante_dni,
        denunciante_email,
        denunciante_telefono,
        empresa_denunciada,
        motivo_reclamo,
        peticiones
      });

      res.json({ success: true, id: result.lastInsertRowid, numero_expediente });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el expediente" });
    }
  });

  app.patch("/api/expedientes/:id", (req, res) => {
    const { estado, observaciones, denunciante_nombre, empresa_denunciada } = req.body;
    const current = db.prepare("SELECT estado FROM EXPEDIENTES WHERE id = ?").get(req.params.id) as any;
    
    const update = db.prepare(`
      UPDATE EXPEDIENTES 
      SET estado = COALESCE(?, estado), 
          observaciones = COALESCE(?, observaciones),
          denunciante_nombre = COALESCE(?, denunciante_nombre),
          empresa_denunciada = COALESCE(?, empresa_denunciada)
      WHERE id = ?
    `);
    
    update.run(estado, observaciones, denunciante_nombre, empresa_denunciada, req.params.id);

    if (estado && estado !== current.estado) {
      db.prepare(`
        INSERT INTO MOVIMIENTOS (expediente_id, accion, usuario, observacion)
        VALUES (?, ?, ?, ?)
      `).run(req.params.id, "Cambio de Estado", "Admin", `Estado cambiado de ${current.estado} a ${estado}`);
    }

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
