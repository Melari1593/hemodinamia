# Validación inicial

Se ejecutó el código del motor en un entorno JavaScript, sin Node ni navegador.

Resultados:
- Basal a 600 s: gasto 5,182 L/min, presión 119,713/77,502 mmHg, presión media 98,290 mmHg.
- Volumen total a 600 s: 5000,000000001219 mL; deriva relativa 2,44e-13.
- Contractilidad al 60 %: gasto 4,799 L/min; aumento del volumen telesistólico.
- Resistencia al 150 %: presión media 131,901 mmHg.
- Volumen total a 4500 mL: gasto 3,442 L/min; volumen conservado.
- Frecuencia fuera de rango rechazada sin mutar el estado.

Estas comprobaciones no validan todas las combinaciones de controles ni el uso docente.

Pendiente:
- Ejecutar npm test, npm run build y verificación en navegador.
- Convergencia formal al reducir el paso máximo.
- Ensayos de los límites y combinaciones de parámetros.
- Revisión científica independiente.
- Verificación de accesibilidad, exportación y rendimiento.

También se ejecutaron los cinco cuerpos de prueba de tests/engine.test.js en el entorno JavaScript, con un adaptador de aserciones: todos pasaron. Esto no equivale a haber ejecutado el runner de Node ni la compilación.
