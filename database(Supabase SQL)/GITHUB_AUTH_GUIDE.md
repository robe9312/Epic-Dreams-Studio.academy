# Guía: Vinculación Supabase + GitHub Auth

Esta guía te ayudará a configurar el inicio de sesión con GitHub en tu aplicación Academy, vinculando ambos servicios profesionalmente.

## 1. Crear App OAuth en GitHub
1. Ve a **Settings > Developer Settings > OAuth Apps** en tu cuenta de GitHub.
2. Haz clic en **New OAuth App**.
3. Configura lo siguiente:
   - **Application Name**: `Epic Dreams Studio Academy`
   - **Homepage URL**: `https://epic-dreams-studio-academy.hf.space` (o tu URL de producción).
   - **Authorization callback URL**: Consíguela en el siguiente paso (Supabase Dashboard).

## 2. Configurar en Supabase
1. Ve a tu **Supabase Dashboard > Authentication > Providers**.
2. Busca **GitHub** y despliégalo.
3. Copia el **Callback URL** que aparece ahí y pégalo en el formulario de GitHub del paso anterior.
4. Haz clic en **Register Application** en GitHub.
5. Copia el **Client ID** y genera un **Client Secret**.
6. Pega ambos en la configuración de GitHub en Supabase.
7. Haz clic en **Save**.

## 3. Secretos para el Workflow de Base de Datos
Para que el archivo `.github/workflows/supabase_sync.yml` funcione, debes añadir estos **Secrets** en tu repositorio de GitHub (**Settings > Secrets and variables > Actions**):

| Secret Name | Descripción | Dónde encontrarlo |
|-------------|-------------|-------------------|
| `SUPABASE_ACCESS_TOKEN` | Token de acceso CLI | Supabase Dashboard > Account Settings > Access Tokens |
| `SUPABASE_DB_PASSWORD` | Contraseña de la DB | La que elegiste al crear el proyecto |
| `SUPABASE_PROJECT_ID` | ID del Proyecto | URL de tu proyecto: `https://supabase.com/dashboard/project/REFERENCE_ID` |

---
*Configuración de Infraestructura: **Epic Dreams Studio Academy v2***
