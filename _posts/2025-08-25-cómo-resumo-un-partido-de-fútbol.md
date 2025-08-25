---
layout: post
title: cómo resumo un partido de fútbol?
description: descripción básica de un pipeline de Machine Learning
date: 2025-08-25T18:16:51.828Z
last_modified_at: 2025-08-25T18:16:51.870Z
category: spanish
image: /assets/images/resumen-futbol/image1.jpg
use_math: true
---
Como fanático del fútbol, siempre he disfrutado volver a ver los partidos completos para analizar las jugadas y entender mejor la táctica. Sin embargo, me di cuenta de que siempre estaba viendolos con un dedo encima la flecha derecha del teclado para saltarme partes redundantes: primeros planos interminables de jugadores celebrando, reacciones del público, y ángulos de cámara a nivel del suelo que no me aportaban mucha información táctica.

Lo que realmente me interesaba eran esas tomas aéreas magníficas que muestran todo el campo desde arriba - esas perspectivas que te permiten ver las formaciones completas, los movimientos coordinados del equipo, y cómo se desarrolla realmente el juego. Estas tomas se capturan desde posiciones elevadas en los estadios o incluso desde drones, y son oro puro para entender la táctica del fútbol.

Ahí fue cuando se me ocurrió una idea: ¿qué pasaría si pudiera enseñarle a una computadora a identificar automáticamente solo estas tomas aéreas valiosas y crear una versión condensada del partido que se enfocara únicamente en lo que me importaba?

## El Descubrimiento Clave: Todo se Reduce a Clasificar Frames

La clave de todo este proyecto estaba en enseñarle a la computadora a mirar cada frame (fotograma) individual del video y decidir si pertenecía a una toma aérea o no. 

Un video no es más que miles y miles de imágenes mostradas una tras otra muy rápidamente. Si podía crear un sistema que fuera capaz de mirar cada una de esas imágenes y decir "esto es aéreo" o "esto no es aéreo", entonces podría identificar exactamente cuándo empezaban y terminaban las secuencias aéreas que me interesaban.

Por lo tanto, la solución consisti en trabajar cuatro etapas principales:

1. **Recolección y Etiquetado de Datos** - Enseñarle a la computadora qué es una toma aérea
2. **Entrenamiento del Modelo** - Crear un "cerebro" que aprenda a reconocer patrones
3. **Aplicación del Modelo** - Usar ese "cerebro" para analizar videos completos
4. **Creación del Resultado Final** - Extraer y compilar solo las partes que me interesan

## Mi Proceso Paso a Paso

### Etapa 1: Recolección y Etiquetado de Datos

**El Proceso de Etiquetado**: Necesitaba crear un conjunto de datos de entrenamiento, así que me puse a etiquetar frames de videos de partidos. El trabajo era bastante directo - tenía que revisar frames y marcar cuáles eran tomas aéreas y cuáles no.

**Construyendo una Interfaz Simple**: Para hacer el proceso más eficiente, construí una interfaz básica que me permitía navegar rápidamente por los videos, ver los frames, y con un simple click marcar cada uno como "aéreo" o "no aéreo". Esto me ahorraba muchísimo tiempo comparado con hacerlo manualmente frame por frame.

**Definiendo las Características**: Ya tenía claro qué buscaba en las tomas aéreas:
- Vista completa o amplia del campo de fútbol
- Jugadores pequeños en relación al tamaño total del campo  
- Perspectiva elevada que muestra las líneas del campo
- Alto porcentaje de césped verde en la imagen

**Cantidad de Datos**: Comencé etiquetando 500 tomas como una prueba inicial. Pensé que probablemente necesitaría más después, pero resultó que 500 ejemplos bien seleccionados fueron suficientes para obtener buenos resultados. A veces menos es más cuando los datos son de buena calidad.

### Etapa 2: Entrenando el Modelo para Detectar Patrones

**Lo Interesante del Machine Learning**: Aquí está la parte fascinante del proceso - yo no le tuve que explicar explícitamente al modelo qué características buscar. No le dije "busca mucho césped verde" o "fíjate si los jugadores se ven pequeños". Simplemente le mostré mis 500 ejemplos etiquetados y el modelo aprendió por sí mismo cuáles eran los patrones más importantes para distinguir una toma aérea de una que no lo es.

**Eligiendo el Modelo Correcto**: Decidí usar ConvNeXt (facebook/convnext-tiny-224) de Hugging Face. Este modelo ya venía pre-entrenado en millones de imágenes generales, así que ya sabía reconocer formas, colores, texturas y patrones básicos. Lo único que tuve que hacer fue "fine-tunearlo" - es decir, enseñarle específicamente sobre tomas de fútbol usando mis 500 ejemplos.

**Por Qué el Transfer Learning Fue Clave**: Si hubiera empezado desde cero, probablemente habría necesitado alrededor de 10,000 tomas etiquetadas para obtener buenos resultados. Pero como el modelo ya conocía conceptos visuales básicos, solo necesitaba mostrarle las diferencias específicas entre tomas aéreas y no aéreas de fútbol.

**Los Resultados**: Después del entrenamiento, el modelo logró una precisión del 98% en el conjunto de prueba. Esto significaba que de cada 100 frames que analizaba, solo se equivocaba en 2. Era exactamente el nivel de precisión que necesitaba para mi proyecto.

### Etapa 3: Aplicando el Modelo a Videos Completos

**El Proceso de Inferencia**: Una vez que tenía mi modelo entrenado, llegó el momento de la verdad: aplicarlo a partidos completos. El sistema que construí toma un video de 90 minutos y lo analiza segundo por segundo, pero no frame por frame (eso tomaría demasiado tiempo). En su lugar, extrae un frame aleatorio de cada segundo y le pregunta al modelo "¿esto es una toma aérea?"

**Análisis Frame por Frame**: Para un partido de 90 minutos, eso significa analizar unos 5,400 frames individuales. Cada frame recibe una predicción del modelo junto con un puntaje de confianza. Si el modelo dice que un frame es aéreo con 95% de confianza, puedo confiar más en esa predicción que en una con 60% de confianza.

**Creando Segmentos Coherentes**: El truco está en convertir esas predicciones frame por frame en segmentos de video útiles. Si tengo 20 frames consecutivos clasificados como aéreos, eso se convierte en un segmento aéreo de 20 segundos. El sistema automáticamente identifica dónde empiezan y terminan estos segmentos.

**Filtrado Inteligente**: No todos los segmentos son igual de útiles. El sistema filtra automáticamente:
- Segmentos muy cortos (menos de 3 segundos) que podrían ser transiciones
- Segmentos con baja confianza promedio
- Fusiona segmentos aéreos que están separados por apenas 1-2 segundos de tomas no aéreas

### Etapa 4: Generando el Resultado Final

**Extracción Automática de Video**: Una vez identificados todos los segmentos aéreos, el sistema usa FFmpeg para extraer automáticamente esas porciones del video original. Cada segmento se guarda como un archivo individual, y también se crea una compilación continua con todos los segmentos unidos.

**Múltiples Formatos de Salida**: El sistema genera diferentes versiones:
- **Versión completa**: Todos los segmentos aéreos en alta calidad
- **Versión web**: Optimizada para streaming online
- **Compilación táctica**: Solo los mejores segmentos con mayor confianza

**Visualizaciones y Estadísticas**: Además del video procesado, el sistema genera gráficos que muestran:
- Timeline completo del partido marcando cuándo ocurrieron las tomas aéreas
- Distribución de la duración de los segmentos aéreos
- Porcentaje total del partido que fueron tomas aéreas

**El Resultado**: Lo que antes me tomaba 90 minutos ver, ahora puedo condensarlo en 15-20 minutos de puro contenido aéreo táctico. El sistema identifica automáticamente entre el 15-25% del partido como tomas aéreas valiosas, permitiéndome enfocarme exactamente en lo que me interesa para el análisis táctico.

## El Impacto Final

Este proyecto me permitió transformar completamente mi experiencia viendo fútbol. Ya no tengo que sufrir a través de interminables primeros planos y reacciones del público. Con un simple comando, puedo convertir cualquier partido en una sesión de análisis táctico concentrado, viendo solo las perspectivas que realmente me aportan valor para entender el juego.

Por ahora, estoy muy contento viendo mis recortes de tomas aéreas a 4x velocidad - me permite absorber rápidamente los patrones tácticos sin perder detalle de lo importante.

## Siguientes Pasos para los Más Avezados

Si bien mi sistema actual cumple perfectamente con mi objetivo original, hay varias mejoras que podrían llevarlo al siguiente nivel:

### Clasificación Inteligente por Presencia del Balón

**La Idea**: Un sistema más sofisticado podría distinguir entre tomas aéreas donde el balón está visible vs. aquellas donde no lo está. Esto permitiría crear diferentes tipos de compilaciones:
- Solo tomas donde hay acción directa con el balón
- Tomas de formaciones y posicionamiento sin balón
- Una mezcla balanceada de ambas

**El Desafío de los Datos**: Implementar esta característica requeriría significativamente más training data. No bastarían mis 500 tomas actuales - probablemente necesitaría entre 2,000-5,000 ejemplos etiquetados con tres categorías: "aérea con balón", "aérea sin balón", y "no aérea". El balón de fútbol es un objeto pequeño que puede ser difícil de detectar consistentemente en tomas aéreas, especialmente con diferentes condiciones de iluminación y calidad de video.

### El Santo Grial: Detección Automática de Jugadas

**La Visión Final**: El sistema supremo sería uno que no solo identifique tomas aéreas, sino que sea lo suficientemente inteligente como para:
- Detectar cuándo empieza una jugada interesante (un pase clave, un contraataque, una transición)
- Identificar cuándo termina la jugada (gol, pérdida del balón, salida del campo)
- Crear clips perfectos que capturen la jugada completa desde el inicio hasta la conclusión

**La Complejidad del Desafío**: Este sistema requeriría entender conceptos futbolísticos complejos como "momentum del juego", "transiciones defensivas", y "construcción de jugadas". Necesitaría miles de ejemplos etiquetados de diferentes tipos de jugadas y sus puntos naturales de inicio y final. Es el tipo de proyecto que podría requerir colaboración con analistas profesionales de fútbol para definir qué constituye una "jugada completa".

**Por Qué Es Tan Difícil**: A diferencia de simplemente clasificar "aéreo vs no aéreo", este sistema tendría que entender el contexto temporal del juego, reconocer patrones de movimiento de múltiples jugadores simultáneamente, y tomar decisiones complejas sobre qué momentos son tácitamente "interesantes".

Por ahora, mi sistema actual me da exactamente lo que necesitaba: una manera eficiente de enfocarme en las perspectivas tácticas más valiosas. Pero estas mejoras futuras podrían convertir la experiencia de ver fútbol en algo completamente personalizado e inteligente.