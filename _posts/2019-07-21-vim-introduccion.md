---
layout: post
title:  "vim: introducción"
description: "Editando texto eficientemente"
date: 2019-07-21 16:57:08 +0100
category: spanish
---

> _Este post lo escribí después de terminar el borrador para una charla que daré para la comunidad de [Javascript en Lima](https://limajs.org). En esta oportunidad podré utilizar un proyector para mostrar las ventajas de vim en tiempo real. Por otro lado, hacerlo de manera escrita es un poco más tedioso. Aún así, quiero dejar claro que nunca fue mi proposito enseñar vim - eso no se logra en un sólo post ni en una charla de 40 minutos - pero sí es mi intención evangelizar este sublime editor de texto. Por lo tanto, este no es un tutorial._

Un editor de texto es una de las herramientas fundamentales del programador. La programación esta compuesta por múltiples actividades, pero en la práctica se le definir brevemente como el dictado de instrucciones a una computadora. Producir los resultados que esperamos en el primer intento es bien raro, por lo tanto toca editar. Y hay mil maneras de hacerlo.

![png]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/xkcd-real-programmers.png)
<span class="img-caption">Sería ironico que los programadores, quienes nos dedicamos a construir herramientas, no nos preocuparamos por aquellas herramientas que utilizamos diariamente para construir finalmente, mas herramientas.</span>

Vim fue creado en los 90 por Bram Moolenaar y viene de una tradición ya legendaria que no conocía el mundo de las pantallas electrónicas sino las terminales de papel, aquellas de copia dura. Veremos un poco sobre eso más abajo. Lo que destaca de vim es su minimalismo, portabilidad y poder. Vim nos permite exigir a nosotros mismos lo mismo que le exigimos a nuestro código, siempre __DRY__, siempre __KISS__[^1].

Mi ultima afirmación es reprochable. La primera pregunta en Stack Overflow en llegar al millón de usuarios fue: [¿Cómo se sale de vim?](https://stackoverflow.com/questions/11828270/how-do-i-exit-the-vim-editor). Aún así, sigo creyendo que vim es sencillo. Gran parte de su elegancia se debe al uso de [mnemonicos](https://www.wikiwand.com/es/Regla_mnemot%C3%A9cnica). Por ejemplo: si deseo borrar una palabra uso la `dw`, donde `d` representa _delete_ y la `w` implica _word_. Gracias a esto casi siempre es fácil acordarse que teclas guarda el comando que deseo expresar. Otra caracteristica básica de VIM es su modalidad: el significado de las teclas va variando dependiendo del contexto, cosa que me libra de tener que usar mi teclado como pianista: presionando CTRL + ALT + SHIFT[^2] a la misma vez para lograr la misma tarea.

![png]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/how-to-exit-vim.png)

Vim es uno de los editores de textos [más populares](https://insights.stackoverflow.com/survey/2019#development-environments-and-tools). Es más, para utilizarlo no hay que usar vim. Si un editor soporta extensiones, es muy probable que tenga una extension vim, y estas son [bien populares](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim). Yo personalmente utilizo atajos vim en el [ navegador ](https://addons.mozilla.org/en-US/firefox/addon/vimium-ff/) y en la linea de comandos. Aplicaciones web como Facebook, Twitter y Gmail utilizan las teclas `J` y `K` para navegar.

Las tecla `J` quiere decir abajo como la tecla `K` dice arriba. Estas dos, junto la `H` y la `L`, forman lo que se llama la __fila casa__ del teclado: `HJKL`. Como pueden adivinar, las teclas `H` y `L` representan izquierda y derecha respectivamente. La idea de la fila casa es que los dedos deben siempre descansar en esta fila y si es posible evitar perder la ubicación de los dedos [^3]. Si tenemos que reubicar nuestros dedos, no podemos tipear tan eficientemente como queremos, pues ese pequeño segundo que nos toca mirar el teclado es una pequeña interrupción que podría alejarnos de la solución.

Es por esto que por lo general no se recomienda utilizar el mouse [^4], aparte de perder tiempo moviendo la mano y reubicándola, el mouse exige relativamente mucha mas atención debido a que el pixel destino donde debemos colocar la punta del cursor puede ser muy pequeño para un rango de movimiento mucho más grande. Piénsalo, ¿Cuantas veces colocas el cursor encima del objetivo en exactamente un movimiento? Usualmente el cursor se pasa sobre el destino y toca retroceder en un movimiento menor. En cambio, la superficie de las teclas son mas grandes que las puntas de nuestros dedos y podemos presionar la tecla sin pensar mucho donde están.

La interfaz de vim no fue diseñada para ser usado sin mouse pero porque cuando se diseñó todavía no se usaban los mouse. El ahorro de tiempo por no mover las manos de la fila casa a las flechas del teclado fue otro accidente fortuito, ya que tampoco fue por diseño, sino fue una limitación del autor que escribió el programa en una ADM-3a, una terminal que no tenia teclas direccionales y utilizaba `HJKL` con modificadores para indicar dirección[^5].

![png]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/adm-3a.png)
<span class="img-caption">Una ADM-3a de Lear Siegler, el mismo modelo que utilizo Bill Joy para escribir visual mode en ex.</span>

Es interesante notar que estos beneficios de vim aparecen debido a sus limitaciones y no por genio. Es más, el núcleo de la filosofía de vim proviene de la época de las mini-computadoras, cuando no existían todas las facilidades que hoy damos por contadas. Pero fueron estas mismas limitaciones que crearon las soluciones que vim heredó y mantiene hasta el día de hoy.

Siempre escucharemos que enviamos una nave espacial a la Luna con una computadora mas lenta que las que tenemos en el bolsillo, lo que nadie menciona es que esta máquina no solamente era ordenes de magnitud mas lenta, sino que tampoco venia con una touch screen y botones intuitivos. Antes de las interfaces gráficas solo existia la terminal[^6], y antes de los monitores eléctronicos, las terminales eran de papel.

![png]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/dennis-ken.png)
<span class="img-caption">Dennis Ritchie y Ken Thompson trabajando con una PDP-11 por medio de una 33-ASR.</span>

En la foto superior se puede apreciar a Ken Thompson tipeando en una 33-ASR. Estos teletipos eran máquinas de escribir integradas con una impresora. La impresora imprimía la información que nos entregaba la misma computadora en el mismo rollo de papel que se tipeaba el comando.  Con el boton enter[^7] se le indicaba al teletipo que era hora de entregar el control a la computadora, transpilando lo último que habíamos escrito en una cinta perforada que se alimentaba a la computadora para que la interprete.

Esta fue la interfaz con la que mucha gente conoció la computadora. Las computadoras solían ser demasiado caras como para que estén disponibles a cualquier persona, sobretodo para estudiantes universitarios. Pero cuando se inventaron los sistemas de tiempo compartido, la misma computadora podía atender a varios usuarios a la misma vez, y así los universitarios fueron invitados a utilizar por primera vez las mainframes del campus. Cuando Ken Thompson aprendió a programar en Berkeley, qed era el editor de texto del sistema.

Qed es en realidad un editor de linea. Debido a que sólo se podía inspeccionar el estado del archivo imprimiendo linea por linea, se editaba linea por linea. Los comandos principales de qed incluían: insertar, anadir, borrar, remplazar, deshacer, imprimir, guardar y salir. Cuando Thompson clonó Multics para crear Unix, incorporó su propio editor de linea inspirado por qed: ed. Este es el editor de texto por defecto de Unix, estando siempre disponible en cualquier sistema operativo que desciende de Unix. Por ejemplo, yo lo tengo en mi MacOS[^8].

A continuación, un ejemplo de como utilizar ed.

<script id="asciicast-IGaDMuS42VoYtp5VTPvmB0stT" src="https://asciinema.org/a/IGaDMuS42VoYtp5VTPvmB0stT.js" async></script>

Esta clase de editores siguió evolucionando. Ed dio paso a em que en su turno dio paso a ex, este último creado por Bill Joy. Cuando Bill Joy obtuvo la ADM-3a que mencionamos anteriormente, se dio cuenta que podía actualizar el cursor en cualquier linea[^9] y le agregó el modo __visual__ al editor. En este modo, ex pasa a ser un editor de pantalla. El tipo de editor con el que estamos familiarizados.

En la siguiente demostración, entraré al visual mode y moveré el cursor por el texto utilizando objetos de texto.

![gif]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/vi-movement-demo.gif)

En el siguiente ejemplo, insertaré texto. Fijense que en la parte inferior hay un indicador que demuestra que mi editor esta en modo __insertar__.

![gif]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/vi-insertion-demo.gif)

Cuando no estoy en modo __insertar__, estoy en modo __normal__. Acá todo lo que presiono es un comando como ya lo demostré. Vimos comandos para movernos utilizando objetos de texto, y comandos para operaciones como suprimir e insertar. El siguiente paso, es componer estas dos habilidades: operar sobre objetos de texto.

![gif]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/vi-composition-demo.gif)

La composicion es una gran caracteristica de vi. Junto a su modalidad (intercambiando entre modos __insertar__ ó __normal__), podemos lograr operaciones complicadas con sólo un par de teclas. La composición no sólo recibe objetos y operaciones si no tambien números para repetir la misma operación el número determinado de veces. Si se dieron cuenta, en algunas ocasiones me he estado moviendo por el archivo utilizando la `HJKL` con un número que me permitía moverme una mayor cantidad de lineas. Se puede hacer lo mismo para suprimir dos palabras: `d2w` o insertar la misma linea dos veces: `o2nuevalinea<esc>` produce:

```
nuevalinea
nuevalinea
```

Vi contiene más funcionalidades como el `.` que permite repetir el ultimo comando indicado, incluyendo el texto que se ingresó. Por que vi es bien capaz de grabar todas las operaciones que realizamos, vi tiene funcionalidad de construir macros. Presionando `qx` donde `x` es cualquier carácter del alfabeto, grabo todo lo que hago con mi teclado hasta que presione `q` de nuevo. Luego puedo repetir todo el proceso con solo presionar la combinación `@x`. Es una funcionalidad realmente poderosa. Lo último que vale la pena descubrir son los registros que guardan[^10] todo lo que copiamos y borramos en lugares accesibles. Si borraste algo es posible que lo tengas en el registro y no tengas que deshacer - `u` - todo tu trabajo.

Vi de por si ya era bien poderoso. Yo no lo sabía pero cuando recién empecé a admirar vim, en verdad estaba celebrando la magia de vi. ¿Qué tiene vim que no tiene vi exactamente? Vim se creó porque vi era proprietario y para conseguirlo había que tener la licencia de Unix. Entonces Bram Moolenaar decidió crear una copia para la entonces popular computadora personal Amiga. El nombre de vim es derivado de vi improved.

Vi improved no siempre fue una mejora por encima de vi, si no que Bram le fue agregando todas esas caracteristicas que esperamos en un editor moderno. Citando la página de Wikipedia:

> _Algunas mejores incluyen compleción, comparación y fusión de archivos (conocido como vimdiff), un sistema comprensivo de ayuda integrado, expresiones regulares extendidas, lenguajes de script (...) incluyendo soporte para plugins, una interfaz de usuario grafica, limitadas caracteristicas propias de IDEs, interacción co el mouse, doblaje, edición de archivos comprimidos ..., chequeo de ortografía, división de paneles y ventanas en pestañas, soporte de Unicode y otros formatos multi-lenguaje, resaltado de sintaxis, commandos trans-sessionales,  busqueda e historia de posiciones del cursor, historia de undo/redo con multinivel y arboles que persisten multiples sesiones de edición y modo visual._

Como ya lo mencioné, la adición de todas estas caracteristicas hacen que vi se mantenga al dia y competitivo en el nuevo ecosistema de editores, siendo vim. Vale la pena resaltar la caracteristica del *scripting*. Lo primero que hace vim cuando es iniciado, es leer el archivo de configuración. `.vimrc` es en realidad un archivo donde cada linea es un comando. Nosotros podemos personalisar vim usando este archivo, incluyendo automatismos, macros, mapeos de teclas, etc. Este archivo puede llamar otros archivos que sigan usando el lenguaje de __vimscript__, y es así como se crean las plugins.

Si decidir que editor de texto ya es una decisión bien personal, el `.vimrc` es mucho más idiosincratico. Puede que comiences clonando el `.vimrc` de otra persona cuya manera de interactuar con el editor te parece beneficioso, pero tarde o temprano le modificarás algo para que sea realmente tuyo. Lo mismo se puede decir de las extensiones, así como puedes customizar tu carro con las partes de diferentes proveedores, igualmente puedes decidir que un explorador de archivos te gusta más que otro. Es un proceso largo de experimentación.

El último beneficio de vim que quiero mencionar, ya fue mencionado. No es tan asombroso como todo lo que hemos revisado, pero hay que admitir que es probablemente la razón por la que mucha gente utiliza vim. Vim vive en la terminal. Eso implica que no necesitas instalar una interfaz gráfica para editar tu texto en una máquina remota. Por ejemplo, digamos que tengo que cambiar unas lineas de codigo en un programa siendo hospedado en una computadora en Holanda [^11],  gracias a vim logro acceder a la máquina por medio de SSH y en mi mismo terminal. Realmente no hay una mejor opción.

![gif]({{ site.url }}{{ site.baseurl }}/assets/images/vim-introduccion/ipad-setup.png)
<span class="img-caption">A veces utilizo un emulador de terminal en mi iPad para acceder a la computadora de mi casa y continuar trabajando. El iPad está conectado a un monitor HDMI donde consigo más espacio gracias a tmux.</span>

Hoy en día se trabaja bastante con recursos que no están próximos a nosotros, el terminal moderno es una sesión SSH a una computadora en una central de Amazon, Microsoft ó Google. Esta computadora probablemente corre con Linux y si es así, vim estará disponible.

Si llegaste hasta acá, probablemente estás interesado en utilizar vim. Acá dejo una lista de recursos:

- Interactivos
    - [https://openvim.com](https://openvim.com/)
    - [https://vim-adventures.com/](https://vim-adventures.com/)
    - [https://www.vimgolf.com/](https://www.vimgolf.com/)
- CLI:
    - `man vim`
    - `:help` en vim
    - `vimtutor`
- Comunidades
    - reddit.com/r/vim
    - IRC: freenode #vim
- Guías:
    - Libro: Practical Vim - Drew Neil
    - Video tutoriales: http://derekwyatt.org/vim/tutorials

Cuando estes aprendiendo, lo más importante es tener un mapa del terreno que explorarás y avanzar paso a paso. Asegurate primero que puedas utilisar vim sin tener que esforzarte por recordar cómo hacer las cosas básicas, y poco a poco vas agregando un beneficio más. Si estuvieras aprendiendo a manejar, no intentarías aprender a usar la caja de cambio mientras aprendes a girar el timón. Nadie utilisa todas las ventajas que vim ofrece, nisiquiera después de 5 años. El siguiente es una buena lista progresiva de habilidades:

- Aprende a salir de VIM
- Aprende a insertar (`a`,  `A`, `i`, `I`, `o`, `O`)
- Aprende a moverte usando objetos (`w`, `e`, `b`, `$`, `0`, `^`, `{`)
- Aprende a moverte buscando carácteres (`f`, `/`)
- Aprende operaciones simples (`x`, `s`, `dd`, `cc`, `y`, `p)`
- Aprende a operar usando composición
- Aprende nuevos objetos para composicíon (`iw`, `aw`, `ip`, `i"`, etc.)
- Aprende a usar ex mode (`:`)
- Aprende a customisar tu configuración (`.vimrc`)
- Aprende a instalar plugins
- Aprende a escribir macros
- Aprende a utilizar tus registros
- Aprende a enseñar vim :-)

Espero haberles inspirado a utilisar vim, y si no, al menos a reflexionar sobre la importancia que tienen nuestras herramientas en nuestro trabajo, que las comodidades que tenemos son gracias al trabajo de gigantes que resolvieron su parte del rompecabezas. Aspiremos a contribuir de la misma manera para que nuestros herederos digan lo mismo de nosotros.


[^1]: "Don't Repeat Yourself" y "Keep It Simple, Stupid"
[^2]: Emacs puede causar síndrome del túnel carpiano, segun mi propia experiencia usando este editor de texto. Pero no hay problema siempre que no dejes de rezarle a San Ignucius.
[^3]: Los teclados suelen tener pequeños relieves en las teclas F y J para que podamos ubicar nuestros dedos sin tener que mirar el teclado.
[^4]: El usuario prototipo de VIM es capaz de utilizar todas las funciones de su computadora solamente con el teclado.
[^5]: Los teclados originalmente no necesitaban flechas direccionales debido a que las pantallas aún no eran capaces de actualizar contenido sin repintar todas las lineas, por ende no había un cursor para direccionar.
[^6]: Algún día tendremos que contar que antes de las pantallas táctiles, existía el mouse.
[^7]: Si has escuchado llamar retornar al boton enter, es por que se refería a retornar el control a la computadora.
[^8]: MacOS desciende de BSD, un sistema operativo fuertemente influenciado por Unix pero con licencias más permisivas.
[^9]: Digo en cualquier linea por que el __open__ mode de ex ya podía mover el cursor pero en una sola linea. __visual__ mode implementó todo eso pero en todas las lineas que entraran en la pantalla.
[^10]: Decir copiar en este contexto es un poco engañoso. Estos editores de texto se inventaron antes de que se invente el servidor de display que es lo que suele capturar lo que copiamos a través de todo el sistema. En vi cuando copiamos algo, en en realidad se yankea, y el contenido estará sólo disponible dentro del programa. Esto suele ser un dolor de cabeza para los principiantes de vim.
[^11]: No estoy ni en el mismo continente que Holanda.
