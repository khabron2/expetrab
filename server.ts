import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Client (Server Side)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const db = new Database("crm.db");

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
    fecha_cambio_estado DATETIME DEFAULT CURRENT_TIMESTAMP,
    tramite TEXT,
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

  CREATE TABLE IF NOT EXISTS USUARIOS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT UNIQUE,
    password TEXT,
    rol TEXT DEFAULT 'admin'
  );

  CREATE TABLE IF NOT EXISTS CONFIGURACION (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO CONFIGURACION (key, value) VALUES ('next_expediente_number', '1');
`);

// Seed default user if none exists
const userCount = db.prepare("SELECT COUNT(*) as count FROM USUARIOS").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO USUARIOS (nombre, email, password, rol) VALUES (?, ?, ?, ?)").run(
    "Administrador",
    "admin@crm.gob.ar",
    "admin123",
    "admin"
  );
}

// Supabase Seed
if (supabase) {
  (async () => {
    const { count } = await supabase.from('USUARIOS').select('*', { count: 'exact', head: true });
    if (count === 0) {
      await supabase.from('USUARIOS').insert([{
        nombre: "Administrador",
        email: "admin@crm.gob.ar",
        password: "admin123",
        rol: "admin"
      }]);
    }
  })();
}

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
  'peticiones',
  'fecha_cambio_estado',
  'tramite',
  'prueba_documental_1',
  'prueba_documental_2'
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
  app.get("/api/stats", async (req, res) => {
    if (supabase) {
      try {
        const { count: total } = await supabase.from('EXPEDIENTES').select('*', { count: 'exact', head: true });
        const { count: activos } = await supabase.from('EXPEDIENTES').select('*', { count: 'exact', head: true }).in('estado', ['Ingresado', 'En proceso']);
        const { count: resueltos } = await supabase.from('EXPEDIENTES').select('*', { count: 'exact', head: true }).eq('estado', 'Resuelto');
        const { count: archivados } = await supabase.from('EXPEDIENTES').select('*', { count: 'exact', head: true }).eq('estado', 'Archivado');
        
        const { data: monthly } = await supabase.rpc('get_monthly_stats'); // Requires a custom function in Supabase or manual processing
        const { data: distribution } = await supabase.from('EXPEDIENTES').select('estado'); // Manual grouping if no RPC
        
        // Fallback for stats if RPCs aren't set up yet
        const distMap = (distribution || []).reduce((acc: any, curr: any) => {
          acc[curr.estado] = (acc[curr.estado] || 0) + 1;
          return acc;
        }, {});
        const distArray = Object.entries(distMap).map(([estado, value]) => ({ estado, value }));

        const { data: ultimoIngresado } = await supabase.from('EXPEDIENTES').select('numero_expediente, denunciante_nombre, fecha_ingreso').order('fecha_ingreso', { ascending: false }).limit(1).single();
        const { data: ultimoModificado } = await supabase.from('EXPEDIENTES').select('numero_expediente, estado, fecha_cambio_estado').order('fecha_cambio_estado', { ascending: false }).limit(1).single();

        return res.json({
          total: total || 0,
          activos: activos || 0,
          resueltos: resueltos || 0,
          archivados: archivados || 0,
          avgResolutionTime: 0, // Placeholder
          ultimoIngresado,
          ultimoModificado,
          monthly: [], // Placeholder
          distribution: distArray,
          hourly: [] // Placeholder
        });
      } catch (error) {
        console.error("Supabase Stats Error:", error);
      }
    }

    // Fallback to SQLite
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

    // Average resolution time (in days)
    const avgRes = db.prepare(`
      SELECT AVG(julianday(fecha_cambio_estado) - julianday(fecha_ingreso)) as avg_days
      FROM EXPEDIENTES
      WHERE estado IN ('Resuelto', 'Archivado')
    `).get() as any;

    // Last entered
    const ultimoIngresado = db.prepare(`
      SELECT numero_expediente, denunciante_nombre, fecha_ingreso 
      FROM EXPEDIENTES 
      ORDER BY fecha_ingreso DESC LIMIT 1
    `).get() as any;

    // Last modified
    const ultimoModificado = db.prepare(`
      SELECT numero_expediente, estado, fecha_cambio_estado 
      FROM EXPEDIENTES 
      ORDER BY fecha_cambio_estado DESC LIMIT 1
    `).get() as any;

    res.json({
      total: total.count,
      activos: activos.count,
      resueltos: resueltos.count,
      archivados: archivados.count,
      avgResolutionTime: Math.round(avgRes?.avg_days || 0),
      ultimoIngresado,
      ultimoModificado,
      monthly: monthly.map((m: any) => ({
        month: m.month,
        count: m.count
      })).reverse(),
      distribution,
      hourly
    });
  });

  app.get("/api/expedientes", async (req, res) => {
    const { search, estado, limit = 50, offset = 0 } = req.query;

    if (supabase) {
      let query = supabase.from('EXPEDIENTES').select('*');
      
      if (search) {
        query = query.or(`numero_expediente.ilike.%${search}%,denunciante_nombre.ilike.%${search}%,denunciante_dni.ilike.%${search}%,empresa_denunciada.ilike.%${search}%`);
      }
      
      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error } = await query
        .order('fecha_ingreso', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (!error) return res.json(data);
      console.error("Supabase Expedientes Error:", error);
    }

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

  app.get("/api/audiencias", async (req, res) => {
    const { fecha } = req.query;

    if (supabase) {
      let query = supabase.from('AUDIENCIAS').select(`
        *,
        EXPEDIENTES (
          numero_expediente,
          denunciante_nombre,
          empresa_denunciada
        )
      `);
      
      if (fecha) {
        query = query.eq('fecha_hora::date', fecha);
      }

      const { data, error } = await query.order('fecha_hora', { ascending: true });
      if (!error) {
        // Flatten the join result to match the expected format
        const flattened = (data || []).map((a: any) => ({
          ...a,
          numero_expediente: a.EXPEDIENTES?.numero_expediente,
          denunciante_nombre: a.EXPEDIENTES?.denunciante_nombre,
          empresa_denunciada: a.EXPEDIENTES?.empresa_denunciada
        }));
        return res.json(flattened);
      }
      console.error("Supabase Audiencias Error:", error);
    }

    let query = `
      SELECT a.*, e.numero_expediente, e.denunciante_nombre, e.empresa_denunciada 
      FROM AUDIENCIAS a
      JOIN EXPEDIENTES e ON a.expediente_id = e.id
    `;
    const params: any[] = [];

    if (fecha) {
      query += " WHERE date(a.fecha_hora) = date(?)";
      params.push(fecha);
    }

    query += " ORDER BY a.fecha_hora ASC";
    
    try {
      const rows = db.prepare(query).all(...params);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener audiencias" });
    }
  });

  // User Management API
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (supabase) {
      const { data: user, error } = await supabase
        .from('USUARIOS')
        .select('*')
        .or(`email.eq.${email},nombre.eq.${email}`)
        .eq('password', password)
        .single();
      
      if (!error && user) {
        return res.json({ 
          success: true, 
          user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } 
        });
      }
    }

    // Allow login with email OR nombre
    const user = db.prepare("SELECT * FROM USUARIOS WHERE (email = ? OR nombre = ?) AND password = ?").get(email, email, password) as any;
    
    if (user) {
      res.json({ 
        success: true, 
        user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } 
      });
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  });

  app.get("/api/usuarios", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('USUARIOS').select('id, nombre, email, rol');
      if (!error) return res.json(data);
    }
    const users = db.prepare("SELECT id, nombre, email, rol FROM USUARIOS").all();
    res.json(users);
  });

  app.post("/api/usuarios", async (req, res) => {
    const { nombre, password, rol } = req.body;

    if (supabase) {
      const { error } = await supabase.from('USUARIOS').insert([{ nombre, password, rol: rol || 'admin' }]);
      if (!error) return res.json({ success: true });
    }

    try {
      db.prepare("INSERT INTO USUARIOS (nombre, password, rol) VALUES (?, ?, ?)").run(
        nombre, password, rol || 'admin'
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: "El nombre de usuario ya existe o datos inválidos" });
    }
  });

  app.delete("/api/usuarios/:id", async (req, res) => {
    if (supabase) {
      await supabase.from('USUARIOS').delete().eq('id', req.params.id);
    }
    db.prepare("DELETE FROM USUARIOS WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/expedientes/:id", async (req, res) => {
    if (supabase) {
      const { data: expediente, error: expError } = await supabase.from('EXPEDIENTES').select('*').eq('id', req.params.id).single();
      if (!expError && expediente) {
        const { data: movimientos } = await supabase.from('MOVIMIENTOS').select('*').eq('expediente_id', req.params.id).order('fecha', { ascending: false });
        const { data: audiencias } = await supabase.from('AUDIENCIAS').select('*').eq('expediente_id', req.params.id).order('fecha_hora', { ascending: true });
        return res.json({ ...expediente, movimientos: movimientos || [], audiencias: audiencias || [] });
      }
    }

    const expediente = db.prepare("SELECT * FROM EXPEDIENTES WHERE id = ?").get(req.params.id);
    const movimientos = db.prepare("SELECT * FROM MOVIMIENTOS WHERE expediente_id = ? ORDER BY fecha DESC").all(req.params.id);
    const audiencias = db.prepare("SELECT * FROM AUDIENCIAS WHERE expediente_id = ? ORDER BY fecha_hora ASC").all(req.params.id);
    
    if (!expediente) return res.status(404).json({ error: "No encontrado" });
    res.json({ ...expediente, movimientos, audiencias });
  });

  app.get("/api/config", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('CONFIGURACION').select('*');
      if (!error && data) {
        const configObj = data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        return res.json(configObj);
      }
    }
    const config = db.prepare("SELECT * FROM CONFIGURACION").all();
    const configObj = config.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(configObj);
  });

  app.post("/api/config", async (req, res) => {
    const { key, value } = req.body;
    if (supabase) {
      await supabase.from('CONFIGURACION').upsert({ key, value: value.toString() });
    }
    db.prepare("INSERT OR REPLACE INTO CONFIGURACION (key, value) VALUES (?, ?)").run(key, value.toString());
    res.json({ success: true });
  });

  // Database Management Endpoints
  app.get("/api/db/download", (req, res) => {
    const dbPath = path.resolve(__dirname, "crm.db");
    res.download(dbPath, "crm_backup.db");
  });

  app.post("/api/db/clear", (req, res) => {
    try {
      // Delete all data from tables
      db.prepare("DELETE FROM AUDIENCIAS").run();
      db.prepare("DELETE FROM MOVIMIENTOS").run();
      db.prepare("DELETE FROM EXPEDIENTES").run();
      db.prepare("UPDATE CONFIGURACION SET value = '1' WHERE key = 'next_expediente_number'").run();
      
      res.json({ success: true, message: "Base de datos limpiada correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al limpiar la base de datos" });
    }
  });

  app.post("/api/expedientes", async (req, res) => {
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
      peticiones,
      prueba_documental_1,
      prueba_documental_2
    } = req.body;

    let nextNum = 1;
    let numero_expediente = "";
    const year = new Date().getFullYear();

    if (supabase) {
      const { data: config } = await supabase.from('CONFIGURACION').select('value').eq('key', 'next_expediente_number').single();
      nextNum = parseInt(config?.value || '1');
      numero_expediente = `EXP-${year}-${nextNum.toString().padStart(4, '0')}`;

      const { data: result, error } = await supabase.from('EXPEDIENTES').insert([{
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
        prueba_documental_1,
        prueba_documental_2,
        estado: 'Ingresado'
      }]).select().single();

      if (!error && result) {
        await supabase.from('CONFIGURACION').upsert({ key: 'next_expediente_number', value: (nextNum + 1).toString() });
        await supabase.from('MOVIMIENTOS').insert([{
          expediente_id: result.id,
          accion: "Ingreso de Reclamo",
          usuario: "Sistema",
          observacion: "Reclamo ingresado vía Formulario Web"
        }]);
        return res.json({ success: true, id: result.id, numero_expediente });
      }
      console.error("Supabase Create Expediente Error:", error);
    }

    // Get next expediente number from config
    const config = db.prepare("SELECT value FROM CONFIGURACION WHERE key = 'next_expediente_number'").get() as { value: string };
    nextNum = parseInt(config?.value || '1');
    numero_expediente = `EXP-${year}-${nextNum.toString().padStart(4, '0')}`;

    // Update next number in config
    db.prepare("UPDATE CONFIGURACION SET value = ? WHERE key = 'next_expediente_number'").run((nextNum + 1).toString());

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
          prueba_documental_1,
          prueba_documental_2,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        prueba_documental_1,
        prueba_documental_2,
        'Ingresado'
      );

      db.prepare(`
        INSERT INTO MOVIMIENTOS (expediente_id, accion, usuario, observacion)
        VALUES (?, ?, ?, ?)
      `).run(result.lastInsertRowid, "Ingreso de Reclamo", "Sistema", "Reclamo ingresado vía Formulario Web");

      res.json({ success: true, id: result.lastInsertRowid, numero_expediente });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el expediente" });
    }
  });

  app.patch("/api/expedientes/:id", async (req, res) => {
    const { estado, observaciones, denunciante_nombre, empresa_denunciada, tramite } = req.body;

    if (supabase) {
      const { data: current, error: fetchError } = await supabase.from('EXPEDIENTES').select('estado, tramite').eq('id', req.params.id).single();
      
      if (!fetchError && current) {
        const updateData: any = {};
        if (estado !== undefined) updateData.estado = estado;
        if (observaciones !== undefined) updateData.observaciones = observaciones;
        if (denunciante_nombre !== undefined) updateData.denunciante_nombre = denunciante_nombre;
        if (empresa_denunciada !== undefined) updateData.empresa_denunciada = empresa_denunciada;
        if (tramite !== undefined) updateData.tramite = tramite;
        
        if (estado !== undefined && estado !== current.estado) {
          updateData.fecha_cambio_estado = new Date().toISOString();
        }

        const { error: updateError } = await supabase.from('EXPEDIENTES').update(updateData).eq('id', req.params.id);

        if (!updateError) {
          // Timeline logging
          if (estado !== undefined && estado !== current.estado) {
            let msg = `Estado cambiado de ${current.estado} a ${estado}`;
            if (estado === 'En proceso' && tramite) msg += ` (${tramite})`;
            await supabase.from('MOVIMIENTOS').insert([{ expediente_id: req.params.id, accion: "Cambio de Estado", usuario: "Admin", observacion: msg }]);
          } else if (tramite !== undefined && tramite !== current.tramite && tramite !== null) {
            await supabase.from('MOVIMIENTOS').insert([{ expediente_id: req.params.id, accion: "Actualización de Trámite", usuario: "Admin", observacion: `Trámite actualizado a: ${tramite}` }]);
          }
          return res.json({ success: true });
        }
        console.error("Supabase Update Expediente Error:", updateError);
      }
    }

    const current = db.prepare("SELECT estado, tramite FROM EXPEDIENTES WHERE id = ?").get(req.params.id) as any;
    
    // Build dynamic update to handle nulls correctly (COALESCE prevents setting to NULL)
    const updates: string[] = [];
    const params: any[] = [];

    if (estado !== undefined) { updates.push("estado = ?"); params.push(estado); }
    if (observaciones !== undefined) { updates.push("observaciones = ?"); params.push(observaciones); }
    if (denunciante_nombre !== undefined) { updates.push("denunciante_nombre = ?"); params.push(denunciante_nombre); }
    if (empresa_denunciada !== undefined) { updates.push("empresa_denunciada = ?"); params.push(empresa_denunciada); }
    if (tramite !== undefined) { updates.push("tramite = ?"); params.push(tramite); }
    
    if (estado !== undefined && estado !== current.estado) {
      updates.push("fecha_cambio_estado = CURRENT_TIMESTAMP");
    }

    if (updates.length > 0) {
      params.push(req.params.id);
      db.prepare(`UPDATE EXPEDIENTES SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }

    // Timeline logging
    if (estado !== undefined && estado !== current.estado) {
      let msg = `Estado cambiado de ${current.estado} a ${estado}`;
      if (estado === 'En proceso' && tramite) {
        msg += ` (${tramite})`;
      }
      db.prepare(`
        INSERT INTO MOVIMIENTOS (expediente_id, accion, usuario, observacion)
        VALUES (?, ?, ?, ?)
      `).run(req.params.id, "Cambio de Estado", "Admin", msg);
    } else if (tramite !== undefined && tramite !== current.tramite && tramite !== null) {
      // If only trámite changed
      db.prepare(`
        INSERT INTO MOVIMIENTOS (expediente_id, accion, usuario, observacion)
        VALUES (?, ?, ?, ?)
      `).run(req.params.id, "Actualización de Trámite", "Admin", `Trámite actualizado a: ${tramite}`);
    }

    res.json({ success: true });
  });

  app.post("/api/audiencias", async (req, res) => {
    const { expediente_id, fecha_hora, tipo } = req.body;

    if (supabase) {
      const { error } = await supabase.from('AUDIENCIAS').insert([{ expediente_id, fecha_hora, tipo }]);
      if (!error) {
        await supabase.from('MOVIMIENTOS').insert([{
          expediente_id,
          accion: "Audiencia Programada",
          usuario: "Admin",
          observacion: `Nueva audiencia tipo ${tipo} para el ${fecha_hora}`
        }]);
        return res.json({ success: true });
      }
      console.error("Supabase Create Audiencia Error:", error);
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO AUDIENCIAS (expediente_id, fecha_hora, tipo)
        VALUES (?, ?, ?)
      `);
      stmt.run(expediente_id, fecha_hora, tipo);
      
      db.prepare(`
        INSERT INTO MOVIMIENTOS (expediente_id, accion, usuario, observacion)
        VALUES (?, ?, ?, ?)
      `).run(expediente_id, "Audiencia Programada", "Admin", `Nueva audiencia tipo ${tipo} para el ${fecha_hora}`);

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al programar audiencia" });
    }
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
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
