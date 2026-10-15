# MORRISON — OAuth y permisos del MCP n8n

**15-10-2026 — estado verificado:** la API Auth0 tiene los permisos `read:workflows` y `write:workflows`; el usuario creó y asignó el rol `MORRISON MCP Editor` y habilitó RBAC. El MCP Railway está desplegado y sus cuatro herramientas de lectura funcionan; el token de ChatGPT **no está demostrado que incluya** `write:workflows`.

## Arquitectura y principio de mínimo privilegio

- El MCP usa Auth0 OAuth y valida JWT (issuer, audience, firma RS256).
- Todas las llamadas requieren `read:workflows`.
- **Solo** `n8n_create_workflow` y `n8n_update_workflow` pueden tener alcance de escritura, y también exigen `write:workflows`.
- Su código limita la escritura a nombres que comienzan por MORRISON, drafts de 1–5 nodos con tipos `webhook`/ `respondToWebhook`, webhook solo GET y prohíbe edición de workflows activos.
- `n8n_activate_workflow` y `n8n_deactivate_workflow` **no** se exponen al cliente. No habilitar ejecución ni activación durante la primera prueba.
- Los workflows de BitCultura permanecen fuera de alcance.

## Bloqueo observado en el código desplegado

El servidor publica ambos alcances en `scopes_supported`, pero en su `oauthChallenge()` todavía anuncia únicamente `read:workflows`. Además, ante una llamada de escritura sin el alcance, devuelve un error JSON-RPC `insufficient_scope` con HTTP 200, no un desafío HTTP 403 que permita al cliente volver a autorizar de forma estándar.

**Solución recomendada:** mantener `read:workflows` para lecturas y enviar un desafío **HTTP 403** con `WWW-Authenticate: Bearer error="insufficient_scope", scope="read:workflows write:workflows", resource_metadata="https://bitcultura-n8n-mcp-production.up.railway.app/.well-known/oauth-protected-resource"` exclusivamente en las solicitudes a herramientas de escritura sin permiso. Los clientes MCP compatibles pueden ampliar la autorización en ese momento, sin exigir escritura durante la conexión inicial. Ver la guía oficial de MCP de `scopeChallenge` / `403 insufficient_scope`.

### Cambio concreto a aplicar en Railway (pendiente)

No es necesario modificar el desafío inicial de lectura. En el `index.tsx` del servicio `bitcultura-n8n-mcp`, reemplazar **solo estos dos bloques**, conservando la validación JWT y `safeMorrisonDraft`.

En `tools/list`, mostrar las herramientas de edición con su esquema OAuth propio, incluso si el token actual es de solo lectura:

```ts
const visibleTools = tools.filter((t:any) =>
  READ_TOOLS.has(t.name) || WRITE_TOOLS.has(t.name)
).map((t:any) => ({
  ...t,
  securitySchemes: [{
    type: "oauth2",
    scopes: WRITE_TOOLS.has(t.name)
      ? ["read:workflows", "write:workflows"]
      : ["read:workflows"]
  }]
}));
return json({jsonrpc:"2.0",id,result:{tools:visibleTools}});
```

En `tools/call`, **antes** de invocar `callTool`, responder con un desafío de privilegio cuando falte el scope de escritura:

```ts
if (WRITE_TOOLS.has(name) && !writeAuthenticated) {
  return json(
    {error:"insufficient_scope",error_description:"Se requiere el permiso MORRISON write:workflows"},
    403,
    {"www-authenticate":
      'Bearer error="insufficient_scope", scope="read:workflows write:workflows", resource_metadata="' +
      oauthMetadataUrl + '"'}
  );
}
if (!READ_TOOLS.has(name) && !WRITE_TOOLS.has(name)) {
  return json({jsonrpc:"2.0",id,error:{code:-32601,message:"Tool not found"}});
}
```

**Comprobar que el bloque de `tools/call` sigue dentro de la verificación de JWT de lectura.** La función `callTool` ya ejecuta `safeMorrisonDraft` para los dos nombres de escritura. Tras el despliegue, una llamada con token read-only debe devolver HTTP 403 y un token con ambos scopes debe ver las herramientas de escritura. No incluir tokens en logs ni capturas.

**Alternativa operativa para un MCP personal:** anunciar ambos scopes en el desafío inicial y volver a autorizar el plugin ChatGPT. Solicita más permisos de los necesarios al conectarse, por lo que es menos recomendable; la pertenencia al rol Auth0 debe seguir comprobada.

## Comprobaciones antes de cambiar producción

1. Confirmar en Auth0 **Applications → APIs → [API MCP] → Settings**: RBAC y Add Permissions in the Access Token activados (usuario confirmó ambos).
2. Confirmar **User Management → Roles → MORRISON MCP Editor**: contiene ambos permisos y el usuario correcto está asignado (usuario confirmó).
3. Comprobar que el token de una **nueva** autorización solicita y obtiene `write:workflows` en el claim `scope` (no basta con `permissions`; el MCP actual lee `payload.scope`).
4. Modificar el código de MCP **solo después de un respaldo**, conservando el allowlist y validación. Revisar cambios y desplegar con Railway.
5. Repetir las cuatro herramientas de lectura del MCP.
6. Mostrar que sin `write:workflows` las herramientas de escritura siguen bloqueadas.
7. Con token autorizado, intentar exclusivamente `n8n_create_workflow` para el borrador `MORRISON v1 — Salud pública mínima / solo lectura`, sin activarlo.
8. Comprobar que aparece en n8n, está **inactivo** y sus nodos coinciden con `n8n/MORRISON-health-readonly.json`. **Nunca usar un workflow BitCultura como prueba de escritura**.

## Qué NO hacer

- No publicar claves de n8n/Auth0/Railway en repositorio público, formularios de MORRISON o capturas.
- No conceder escritura a todos los usuarios ni desactivar la validación de JWT.
- No cambiar el prefijo MORRISON ni añadir nodos de código arbitrario, HTTP genérico o ejecución de comandos sin una revisión posterior.
- No confundir un `health` HTTP 200 con autorización de escritura o con un workflow ejecutado.
- No activar el workflow piloto antes de revisar la URL y acordar la prueba.

## Enlaces útiles

- [MCP — Auth con desafíos de alcance por herramienta](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization)
- [Auth0 — scopes de API](https://auth0.com/docs/get-started/apis/scopes/api-scopes)
- [Archivo del workflow de salud](../n8n/MORRISON-health-readonly.json)
- [Panel n8n](https://n8n-production-d5cb.up.railway.app/)
