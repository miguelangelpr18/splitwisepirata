# Guía de despliegue — GitHub → Supabase → Vercel

Esta guía toma unos 15 minutos. Todo es **gratis**. Al final vas a tener una URL pública (ej. `https://splitwise-trip-xxx.vercel.app`) que Mau y Villalón pueden abrir en su celular.

---

## Antes de empezar

Necesitas tener instalado en tu compu:

- **Node.js** (versión 18 o mayor) → https://nodejs.org (descarga la versión "LTS")
- **Git** → https://git-scm.com/downloads
- Una cuenta de **GitHub** (gratis) → https://github.com
- Una cuenta de **Supabase** (gratis) → https://supabase.com
- Una cuenta de **Vercel** (gratis) → https://vercel.com

*Tip:* puedes iniciar sesión en Supabase y Vercel usando tu cuenta de GitHub. Así es más rápido.

---

## Parte 1 · Subir el código a GitHub

1. Mueve la carpeta `splitwise-trip` a donde quieras tenerla en tu compu (por ejemplo, tu escritorio).

2. Abre la **Terminal** (Mac) o **PowerShell** (Windows) y entra a la carpeta:

   ```bash
   cd ruta/a/splitwise-trip
   ```

3. (Opcional, para probar localmente) Instala las dependencias y corre el proyecto:

   ```bash
   npm install
   ```

   No lo corras todavía con `npm run dev` porque aún no tienes la base de datos. Seguimos.

4. Inicializa Git y haz el primer commit:

   ```bash
   git init
   git add .
   git commit -m "Primer commit: app de splitwise para el viaje"
   ```

5. Ve a **github.com** e inicia sesión. Haz clic en el botón verde **New** (o el **+** arriba a la derecha → **New repository**).
   - Nombre del repo: `splitwise-trip`
   - Marca **Private** (privado) para que solo tú lo veas.
   - **No marques** las casillas de "Add a README" ni "Add .gitignore" (ya los tienes en la carpeta).
   - Haz clic en **Create repository**.

6. GitHub te va a mostrar unos comandos. Copia los de la sección **"…or push an existing repository from the command line"**. Se ven así (sustituye `TU-USUARIO`):

   ```bash
   git remote add origin https://github.com/TU-USUARIO/splitwise-trip.git
   git branch -M main
   git push -u origin main
   ```

   Pégalos en tu terminal y presiona Enter. GitHub te va a pedir tu usuario y contraseña (o un token). Si no sabes qué es un token, la forma fácil es instalar **GitHub Desktop** (https://desktop.github.com) en vez de usar la terminal — solo arrastra la carpeta y presiona "Publish repository".

   Ya está — tu código está en GitHub.

---

## Parte 2 · Crear la base de datos en Supabase

1. Ve a **https://supabase.com** → **Start your project** → inicia sesión con GitHub.

2. Haz clic en **New Project**.
   - Name: `splitwise-trip`
   - Database Password: invéntate una contraseña cualquiera y **guárdala** (aunque probablemente no la vuelvas a necesitar).
   - Region: elige la más cercana (ej. `East US (North Virginia)` o `West US (Oregon)`).
   - Click en **Create new project**. Espera ~1 minuto mientras Supabase lo prepara.

3. Cuando termine, en el menú izquierdo haz clic en el icono **SQL Editor** (`</>`). Luego **+ New query**.

4. Abre el archivo `supabase-schema.sql` de tu carpeta `splitwise-trip` con cualquier editor (Notepad, VS Code, TextEdit). Copia **todo** el contenido.

5. Pégalo en el editor de SQL de Supabase y haz clic en **Run** (abajo a la derecha), o presiona **Cmd/Ctrl + Enter**.

   Debería decir *"Success. No rows returned"*. Esto creó las tablas y agregó a **Mike**, **Mau** y **Villalón** como usuarios.

6. Ahora ve a **Project Settings** (el engrane abajo a la izquierda) → **API**. Vas a ver dos valores importantes:

   - **Project URL** — se ve así: `https://abcdefgh.supabase.co`
   - **Project API keys → anon public** — una cadena larga que empieza con `eyJ…`

   **Deja esta pestaña abierta**, los vas a pegar en Vercel en la siguiente parte.

---

## Parte 3 · Desplegar en Vercel

1. Ve a **https://vercel.com** → inicia sesión con GitHub (te pedirá permiso para ver tus repos, dáselo).

2. En el dashboard de Vercel, haz clic en **Add New → Project**.

3. Busca tu repo `splitwise-trip` en la lista y haz clic en **Import**.

4. Vercel va a detectar automáticamente que es un proyecto Next.js. **No cambies** la configuración de build.

5. Expande la sección **Environment Variables** (Variables de entorno) y agrega **dos** variables. Copia los valores de la pestaña de Supabase que dejaste abierta:

   | Name (Nombre)                      | Value (Valor)                              |
   |------------------------------------|--------------------------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL`         | tu Project URL de Supabase                 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | tu anon public key de Supabase             |

   ⚠️ Los nombres deben ir **exactamente igual** (en mayúsculas, con guiones bajos). Son sensibles a mayúsculas.

6. Haz clic en **Deploy**. Espera ~1 minuto mientras Vercel construye y publica la app.

7. ¡Listo! Vercel te va a dar una URL como `https://splitwise-trip-abcd.vercel.app`.

   - Ábrela en tu celular.
   - En iPhone: Safari → botón **Compartir** → **Agregar a la pantalla de inicio** (se ve como una app).
   - En Android: Chrome → **⋮** → **Añadir a pantalla principal**.
   - Comparte la misma URL con Mau y Villalón por WhatsApp. Cada uno abre el menú arriba a la derecha y elige su nombre. Listo.

---

## Parte 4 · Hacer cambios después

Si más adelante quieres cambiar algo (por ejemplo renombrar a alguien, cambiar colores, etc.):

```bash
cd ruta/a/splitwise-trip
# ... edita los archivos que quieras ...
git add .
git commit -m "lo que cambiaste"
git push
```

Vercel detecta el push automáticamente y re-despliega en ~30 segundos. Ya no tienes que tocar Vercel nunca más.

---

## Cómo usar la app

- **Dashboard** (pantalla principal): ves tu balance total (si te deben dinero sale verde, si tú debes sale naranja) y cuánto te debe cada amigo.
- **Botón verde con +** (abajo al centro): agrega un gasto nuevo.
  - Escribe descripción (ej. "Hotel", "Cena", "Uber")
  - Monto en pesos
  - Quién pagó
  - Entre quiénes se divide (por defecto los 3)
  - Equally (partes iguales) o Exact amounts (montos exactos, por ejemplo si alguien comió más)
- **Activity**: lista de todos los gastos y pagos.
- **Settle up** (abajo a la derecha): te sugiere el mínimo de pagos necesarios para saldar todo entre los 3. Cuando alguien paga en la vida real (Venmo / SPEI / efectivo), toca **Record** para que la app lo registre y los balances queden en cero.

---

## Solución de problemas

**Error "Missing Supabase env vars" cuando abro la app**
Te faltó agregar las variables de entorno en Vercel, o los nombres no son idénticos. Solución: Vercel → tu proyecto → **Settings** → **Environment Variables** → verifica los nombres → ve a **Deployments** → clic en el último deployment → **⋯** → **Redeploy**.

**No aparecen los nombres de Mike/Mau/Villalón**
Ve a Supabase → **Table Editor** → tabla `people`. Deberías ver 3 filas. Si está vacía, ve al SQL Editor y vuelve a correr `supabase-schema.sql` (el `INSERT` tiene `ON CONFLICT DO NOTHING` así que es seguro correrlo varias veces).

**Quiero cambiar un nombre o agregar a un 4to amigo**
En Supabase → **Table Editor** → `people` → clic en una fila para editar el nombre, o **+ Insert row** para agregar a alguien nuevo. La app se actualiza sola la próxima vez que la abras.

**Quiero cambiar la moneda (por ejemplo a USD o EUR)**
Edita `lib/format.ts` en tu carpeta: cambia `CURRENCY_CODE` (ej. `"USD"`), `CURRENCY_SYMBOL` (ej. `"$"`) y el locale en `new Intl.NumberFormat("es-MX", …)` (ej. `"en-US"`). Luego `git add . && git commit -m "cambio moneda" && git push`.

**Me equivoqué de gasto**
Ve a **Activity** y pulsa **delete** abajo a la derecha del gasto.

---

## Sobre la seguridad

La app es privada pero técnicamente cualquiera con la URL podría ver los datos (no hay contraseña). Esto es intencional para un viaje entre 3 amigos. Si algún día quieres cerrarlo de verdad (login por email/contraseña), avísame y te ayudo a activar Supabase Auth.

La `anon key` de Supabase está diseñada para ser pública, no es un secreto como una contraseña de base de datos. Pero las variables están en `.env.local` (no se sube a GitHub) por buena práctica.
