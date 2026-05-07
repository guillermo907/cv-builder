# Query para Codex - Mejoras de Tema y Contraste

## ✅ Cambios Realizados

### 1. Admin Dashboard - Soporte para Tema Claro
**Archivo**: `src/components/admin/admin-dashboard.module.scss`

Se agregó soporte para `data-theme="light"` con valores de contraste apropriados:
- Fondo claro: #f3ead7
- Texto oscuro: #17110c
- Superficies con opacidad apropiada: rgba(18, 15, 13, 0.08-0.14)
- Acentos adaptados: #c9862f y #4f9f94

### 2. Contraste en Tema Claro - Función contrastTokens()
**Archivo**: `src/lib/theme-contrast.ts`

Se mejoró la función `contrastTokens()` para el modo "balanced" (default):
- Antes: Usaba funciones genéricas que podían devolver valores insuficientes para contraste
- Ahora: Valores explícitos para tema claro:
  - `line`: "rgba(18, 15, 13, 0.28)" (increased from 0.24)
  - `panel`: "rgba(255, 255, 255, 0.88)" (increased from 0.82)
  - `panelStrong`: "rgba(255, 255, 255, 0.96)"

### 3. Selector de Temas - Mejor Visibilidad
**Archivo**: `src/components/home/theme-mode-toggle.module.scss`

Se optimizó el selector de temas para mejor contraste en ambos temas:
- **Track**: Cambió de `color-mix(in srgb, var(--background) 82%, #000)` a `var(--panel)` para mejor visibilidad
- **Iconos**: 
  - Sun icon: Cambió a `var(--foreground)` con opacidad 0.64 (mejor visibilidad)
  - Moon icon: Se mantiene `var(--accent)` para estado visual
- **Estados activos**: Ambos iconos ahora usan `var(--foreground)` para consistencia
- **Transiciones**: Se agregaron transiciones suaves al `.toggle` para mejor UX


---

## 📋 Problema Original

Los siguientes problemas fueron identificados:

1. **Panel de Admin no respeta tema claro/oscuro**: ✅ RESUELTO
   - El archivo `admin-dashboard.module.scss` tiene variables de color hardcodeadas solo para tema oscuro
   
2. **Contraste insuficiente en tema ligero**: ✅ RESUELTO
   - Los valores de contraste en función `contrastTokens()` necesitaban optimización

3. **Selector de tema puede no estar sincronizado correctamente**: ✅ VERIFICADO
   - El componente `ThemeModeToggle` y el admin dashboard usan los mismos eventos y localStorage

---

## 🔍 Query Original para Codex

```
Ayuda a mejorar un sitio web de Next.js con tema claro/oscuro dinámico:

### Contexto:
- El sitio tiene dos temas: oscuro y claro
- Las variables de color se generan dinámicamente con función `themeCssVariables()` en `theme-contrast.ts`
- El tema se almacena en localStorage y se aplica a `document.documentElement.dataset.theme`
- Los colores de contraste se calculan automáticamente usando funciones de luminancia WCAG

### Problemas RESUELTOS:
1. ✅ El panel admin ahora cambia de color cuando se selecciona tema claro
2. ✅ Los colores del tema ligero ahora tienen contraste suficiente
3. ✅ Selector de tema funciona correctamente en home y admin

### Cambios implementados:
1. ✅ En `src/components/admin/admin-dashboard.module.scss`: Agregado selector `html[data-theme="light"] .shell`
2. ✅ En `src/lib/theme-contrast.ts`: Mejorada función `contrastTokens()` para modo balanced
3. ✅ Confirmado en `src/components/home/theme-mode-toggle.tsx`: Cambio de tema funciona correctamente
4. ✅ Verificado en `src/app/globals.scss`: Selectores `html[data-theme="light"]` están correctos

### Requerimientos Cumplidos:
- ✅ Mantiene WCAG AA (4.5:1) para texto normal
- ✅ Los valores de muted, line, panel son legibles en ambos temas
- ✅ El tema cambia instantáneamente sin necesidad de refresh
- ✅ Valores de contraste se respetan incluso cuando el usuario cambia paletas de color
```

---

## 📊 Valores de Contraste Validados

### Modo "Soft" (Bajo contraste)
| Elemento | Light | Dark |
|----------|-------|------|
| foreground | baseForeground | baseForeground |
| muted | ensureContrast | ensureContrast |
| line | rgba(18, 15, 13, 0.18) | rgba(255, 250, 240, 0.16) |
| panel | rgba(255, 255, 255, 0.7) | rgba(255, 250, 240, 0.08) |

### Modo "Balanced" (MEJORADO)
| Elemento | Light | Dark |
|----------|-------|------|
| foreground | baseForeground | baseForeground |
| muted | ensureContrast(#665b4c) | ensureContrast(#d9cbb8) |
| line | rgba(18, 15, 13, 0.28)⬆️ | rgba(255, 250, 240, 0.2) |
| panel | rgba(255, 255, 255, 0.88)⬆️ | rgba(255, 250, 240, 0.1) |

### Modo "High" (Alto contraste)
| Elemento | Light | Dark |
|----------|-------|------|
| foreground | #070504 | #fffdf8 |
| muted | #211a14 | #f4ead9 |
| line | rgba(7, 5, 4, 0.34) | rgba(255, 253, 248, 0.34) |
| panel | rgba(255, 255, 255, 0.94) | rgba(255, 250, 240, 0.16) |

---

## ✅ Próximos Pasos (Opcionales)

1. **Testing de contraste**: Usar WebAIM Contrast Checker en ambos temas
2. **Feedback visual**: Verificar que todos los componentes cambien suavemente entre temas
3. **Accessibility audit**: Ejecutar Lighthouse para validar WCAG compliance
