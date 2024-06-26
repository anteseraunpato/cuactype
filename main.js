    import { words as INITIAL_WORDS } from './data.js'

    //recuperamos el contenido de cada una de las etiquetas del juego
    const $time = document.querySelector('time');
    const $paragraph = document.querySelector('p');
    const $input = document.querySelector('input');
    const $game = document.querySelector('#game')
    const $results = document.querySelector('#results')
    const $wpm = $results.querySelector('#results-wpm')
    const $accuracy = $results.querySelector('#results-accuracy')
    const $button = document.querySelector('#reload-button')

    const INITIAL_TIME = 30;

    //const TEXT = "el zorro marron rapida y velozmente salto sobre el agil perro que dormia junto al rio tranquilo y sereno bajo el cielo azul y despejado";

    let words = []
    let currentTime = INITIAL_TIME


    initGame()
    initEvents()

    //Creamos la funcion que inicia el juego
    function initGame() {

        //Ocultamos los resultados y reseteamos el input para cuando se reinicie el juego
        $game.style.display = 'flex'
        $results.style.display = 'none'
        $input.value = ''
        //Utilizando INITIAL_WORDS tomamos las palabras de nuestro array y utilizando Math.random hacemos que siempre aparezcan palabras distintas. Con el slice indicamos la cantidad de palabras a mostrar
        words = INITIAL_WORDS.toSorted(
            () => Math.random() - 0.5
        ).slice(0,40)
        //Inicializamos la variable currentTime con el valor de INITIAL_TIME cada que el juego se reinicia
        currentTime = INITIAL_TIME

        //Renderizamos el timer en la página
        $time.textContent = currentTime

        //Creamos el párrafo usando las palabras del array.

        $paragraph.innerHTML = words.map((word, index) => {

    //Creamos la constante letter y hacemos que esta divida cada palabra en las letras que la componen. Envolvemos cada palabra en la etiqueta word y cada letra en la etiqueta letter
            const letters = word.split('')

            return ` <v-word>
                ${letters
                .map(letter =>`<v-letter>${letter}</v-letter>`)
                .join('')
                }
                </v-word>

            `
        }).join('')


        //Creamos la constante $firstWord que toma el primer elemento v-word y le agrega la clase active. Utilizando la misma constante obtenemos con querySelector el primer elemento letter y le agregamos la clase active. Esto nos servirá para el cursor
        const $firstWord = $paragraph.querySelector('v-word')
        $firstWord.classList.add('active')
        $firstWord.querySelector('v-letter').classList.add('active')

        //Creamos la variable que alojara el intervalo y le decimos que ajuste el valor del time cada 1 segundo
        const intervalID = setInterval(() => {
            currentTime--
            $time.textContent=currentTime
        //Creamos un if que imprime un mensaje en la consola cuando el currentTime es igual a 0
            if (currentTime === 0) {
                clearInterval(intervalID)
                gameOver()
            }
        },1000)

    }

    //Creamos las funciones para cada uno de los eventos
    function initEvents() { 

        //Hacemos que al comenzar a escribir la página el input reciba el focus
        document.addEventListener('keydown', () => {
            $input.focus()
        }
    )
    //Creamos las funciones que serán llamadas dependiendo si el usuario presiona o suelta una tecla
    $input.addEventListener('keydown', onKeyDown)
    $input.addEventListener('keyup', onKeyUp)
    $button.addEventListener('click', initGame)

    }

    //Decimos a la funcion que reciba un evento
    function onKeyDown(event) {

        //Recuperamos los elementos actuales
        const $currentWord = $paragraph.querySelector('v-word.active')
        const $currentLetter = $currentWord.querySelector('v-letter.active')

           //El evento es cuando se presiona una tecla
        const { key } = event
        
        //Si se presiona la tecla de espacio
        if (key === ' ') {
            //prevenimos el comportamiento por defecto de la tecla de espacio
            event.preventDefault()

            //Recuperamos la siguiente palabra usando nextElementSibling, que busca el siguiente elemento hermano de currentWord
            const $nextWord = $currentWord.nextElementSibling
            //Obtenemos la primer letra de la siguiente palabra
            const $nextLetter = $nextWord.querySelector('v-letter')

            //Eliminamos la clase active de la palabra y letra actual usando classList.remove
            $currentWord.classList.remove('active', 'marked')
            $currentLetter.classList.remove('active', 'is-active')

            //Agregamos la clase activa a la siguiente palabra y letra
            $nextWord.classList.add('active')
            $nextLetter.classList.add('active')
            //Reseteamos el input
            $input.value = ''

            //Recuperamos todas las letras de la palabra anterior/actual y comprobamos si la longitud de las letras incorrectas es mayor a cero, en cuyo caso nos faltan letras

            const hasMissedLetters = $currentWord.querySelectorAll('v-letter:not(.correct)').length > 0
            //Si tenemos letras faltantes agrega la clase marked a la palabra, sino agregamos la clase correct
            const classToAdd = hasMissedLetters ? 'marked' : 'correct'

            $currentWord.classList.add(classToAdd)
            return
        }

        //Para la tecla backspace/borrar/retroceso utilizamos una lógica parecida que con el espacio, pero aplicada a la palabra anterior
        if (key === 'Backspace') {
            const $prevWord = $currentWord.previousElementSibling
        //de la letra actual buscamos la letra anterior
            const $prevLetter = $currentLetter.previousElementSibling

            //Si no tenemos una palabra anterior ni una letra anterior evitamos el comportamiento por defecto del backspace
            if (!$prevWord && !$prevLetter) {
                event.preventDefault()
                return
            }
         //Creamos la constante para las palabras con la clase marked
        const $wordMarked = $paragraph.querySelector('v-word.marked')

            //Si tengo una palabra marcada y no tengo una letra previa evito que backspace funcione por defecto porque estoy en la letra inicial de la siguiente palabra

            if($wordMarked && !$prevLetter) {
                event.preventDefault()
            //Al hacer backspace le quitamos la clase marked a la palabra previa y le agregamos la clase active para que se convierta en la palabra activa
                $prevWord.classList.remove('marked')
                $prevWord.classList.add('active')
                //Creamos una clase para indicar a que letra regresar cuando se use el backspace
                const $letterToGo = $prevWord.querySelector('v-letter:last-child')

                //Quitamos la clase active a la letra actual y se la agregamos a la letra a la que regresamos con el backspace
                $currentLetter.classList.remove('active')
                $letterToGo.classList.add('active')
                //Obtenemos todas las letras con la clase correct e incorrect del input y las convertimos en un array y mapeamos cada elemento
                $input.value = [...$prevWord.querySelectorAll('v-letter.correct, v-letter.incorrect')].map( //Sacamos el innerText de cada elemento ($el) y comprobamos si contienen la clase correct, si la contienen lo mantenemos igual y sino las sustituimos por un *
                $el => {
                    return $el.classList.contains('correct') ? $el.innerText : '*'
                }).join('') //con esto convertimos lo que obtuvimos en un string

            }


        }
    }


    function onKeyUp(){
        //Recuperamos los elementos actuales
        const $currentWord = $paragraph.querySelector('v-word.active')
        const $currentLetter = $currentWord.querySelector('v-letter.active')

        const currentWord = $currentWord.innerText.trim()
        $input.maxLength = currentWord.length
        console.log({value: $input.value, currentWord})

        //Creamos una constante para obtener todas las letter de la palabra actual 
        const $allLetters = $currentWord.querySelectorAll('v-letter')

        //Limpiamos la clase correct e incorrect de cada letra
        $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'))

        //Recuperamos el valor del input y usando split convertimos cada letter en un array para poder comparar cada letra en la posición seleccionada con la letter que se encuentra en el index
        $input.value.split('').forEach((char, index) => {
            const $letter = $allLetters[index]
            const letterToCheck = currentWord[index]
        
            //Comparamos la letra en nuestro input y la letra activa de la palabra activa y si son iguales agregamos la classe correct, sino agregamos la clase incorrect
            const isCorrect = char === letterToCheck
            const letterClass = isCorrect ? 'correct' : 'incorrect' 
            $letter.classList.add(letterClass)
            
        })
        //Limpiamos la clase active de la letra actual
        $currentLetter.classList.remove('active', 'is-last')
        //Recuperamos la longitud del input y utilizando allLetters le ponemos que ponga la clase active a la letra en esa posicion. Es decir si mi input tiene 9 caracteres entonces el 9 caracter será la letra activa
        const inputLength = $input.value.length
        // $allLetters[inputLength].classList.add('active')

        //La constante nextActiveLetter guarda el valor de allLetters y la longitud del input 
        const $nextActiveLetter = $allLetters[inputLength]
        
        //Si no se encuentra al final del array agrega la clase active en caso contrario agrega la clase active y la clase is-last
        if ($nextActiveLetter) {
            $nextActiveLetter.classList.add('active')
        } else {
            $currentLetter.classList.add('active', 'is-last')
            //Agregar aqu[i el game over
        }

    }

    function gameOver () {
        $game.style.display = 'none'
        $results.style.display = 'flex'

        //Obtenemos la cantidad de palabras correctas y letras correctas e incorrectas
        const correctWords = $paragraph.querySelectorAll('v-word.correct').length
        const correctLetter = $paragraph.querySelectorAll('v-letter.correct').length
        const incorrectLetter = $paragraph.querySelectorAll('v-letter.incorrect').length

        const totalLetters = correctLetter + incorrectLetter
        const accuracy = totalLetters > 0 ? (correctLetter/totalLetters) * 100 : 0

        const wpm = correctWords * 60 / INITIAL_TIME
        $wpm.textContent = wpm
        $accuracy.textContent= `${accuracy.toFixed(2)}%`

    }