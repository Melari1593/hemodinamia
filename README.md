# Laboratorio virtual de hemodinamia

Primera implementación del laboratorio educativo aprobado: React, TypeScript, Vite y motor cardiovascular 0D en un Web Worker.

## Ejecutar
Requiere Node.js 22.12 o posterior.

```sh
npm install
npm run dev
```

```sh
npm test
npm run build
```

## Disponible
- Circuito cerrado de ocho compartimentos, cuatro válvulas y elastancia ventricular.
- Integración RK4 adaptativa mediante comparación de un paso y dos medios pasos.
- Basal preparado durante 30 segundos simulados.
- Cinco controles, pausa, reinicio y tres velocidades.
- Indicadores por latido y cuatro gráficas SVG.
- Referencia inmutable, tres actividades y cuaderno.
- CSV de la ventana reciente, JSON e impresión.

## Estado y límites
Prototipo educativo pendiente de revisión fisiológica. No destinado a decisiones clínicas.
- El cambio de volumen es instantáneo; falta implementar la intervención gradual de 500 mL en 30 s.
- No hay guardado automático, restauración, evaluación guiada completa ni barorreflejo.
- Se conservan hasta 1500 muestras; las gráficas muestran las últimas 500.
- El informe imprimible usa la vista actual.
- Falta interacción detallada en gráficas, tabla accesible de series y esquema circulatorio.
- El motor aún no implementa el contrato versionado completo ni exportación de instantáneas.
- No incluye modelos 1D, CFD 3D, reología avanzada ni interacción fluido-estructura.
- Los límites individuales no garantizan que todas las combinaciones extremas sean válidas. El motor se detiene ante volúmenes inválidos.
- Parámetros educativos, sin calibración con datos de pacientes.
- Dependencias sin archivo de bloqueo inicial; generarlo y conservarlo al instalar en un entorno Node.
- No se ha ejecutado aquí la compilación TypeScript ni la interfaz en navegador. Las comprobaciones realizadas sobre el motor se documentan en docs/VALIDACION.md.

## Modelo y siguiente trabajo
Consultar [especificación de entrega](docs/SPEC.txt), [modelo](docs/MODELO.md) y [validación](docs/VALIDACION.md).
La licencia Apache-2.0 existente se conserva.
