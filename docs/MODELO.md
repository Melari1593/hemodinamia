# Modelo 0D, versión 0.1.0

Orden de compartimentos: venas sistémicas, aurícula derecha, ventrículo derecho, arterias pulmonares, venas pulmonares, aurícula izquierda, ventrículo izquierdo y arterias sistémicas.

Unidades internas: mL, s, mmHg. Resistencias: mmHg·s/mL. Compliancias: mL/mmHg. Elastancias: mmHg/mL.

- Flujo resistivo: Q = (Pentrada − Psalida) / R.
- Balance: dV/dt = Qentrada − Qsalida.
- Presión pasiva: P = (V − V0) / C.
- Presión ventricular: P = E(t)(V − V0).
- Válvulas: se anula el flujo retrógrado.
- Activación ventricular: seno cuadrado durante el 40 % del ciclo; resto en elastancia mínima. Es una simplificación educativa; no representa activación auricular ni ajuste fisiológico completo de la duración sistólica.
- Integrador: RK4 con control de error por duplicación de paso; tolerancias absoluta y relativa de 1e-6; paso máximo de 0,002 s.
- No se recortan volúmenes negativos; provocan un error.
- Cambios de volumen: diferencia añadida o retirada de venas sistémicas.
- Las presiones pasivas pueden ser negativas respecto al origen de referencia; no se aplica presión externa.
- El primer ciclo posterior a una intervención no genera indicadores, para evitar mezclar ciclos incompletos.
- Las intervenciones descartan la evaluación de estabilidad previa.

El basal inicial contiene 5000 mL. La preparación ejecuta 30 s antes de mostrar el laboratorio. La estabilidad requiere cinco comparaciones consecutivas con cambios inferiores al 1 % en volumen sistólico y telediastólico.

## Navier–Stokes y evolución
El modelo actual no calcula campos espaciales. La siguiente ampliación tendrá casos precalculados de tubo recto y estenosis, verificados contra Poiseuille y Womersley antes de añadir circulación 1D o acoplamiento 3D–0D.

Referencias consideradas en la especificación:
- Jia y Esmaily (2025), balance armónico para flujo periódico: https://doi.org/10.1103/l8wc-6l8g
- ICPINN (2025): https://doi.org/10.1016/j.cpc.2025.109569
- Interacción fluido-estructura con E-ICPINN (2026): https://doi.org/10.1016/j.cpc.2026.110131

Balance armónico y redes informadas por física son opciones experimentales; no están implementados.
