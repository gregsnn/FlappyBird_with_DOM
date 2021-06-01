function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className

    return elem
}

function barrier(reverse = false) {
    this.element = newElement('div', 'barreira')

    const border = newElement('div', 'borda')
    const body = newElement('div', 'corpo')

    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}vh`
}

function parDeBarreiras(height, abertura, x) {
    this.element = newElement('div', 'par-de-barreiras')

    this.superior = new barrier(true)
    this.inferior = new barrier(false)

    this.element.appendChild(this.superior.element)
    this.element.appendChild(this.inferior.element)

    this.randomHeight = () => {
        const heightSuperior = Math.random() * (height - abertura)
        const heightInferior = height - abertura - heightSuperior
        this.superior.setHeight(heightSuperior)
        this.inferior.setHeight(heightInferior)
    }

    this.getX = () => parseInt(this.element.style.left.split('%')[0])
    this.setX = x => this.element.style.left = `${x}%`
    this.getWidth = () => this.element.clientWidth

    this.randomHeight()
    this.setX(x)
}

function barreiras(height, width, abertura, space, pointNotify) {
    this.pares = [
        new parDeBarreiras(height, abertura, width),
        new parDeBarreiras(height, abertura, width + space),
        new parDeBarreiras(height, abertura, width + space * 2),
        new parDeBarreiras(height, abertura, width + space * 3)
    ]

    let deslocamento = 1
    setInterval( increment, 29000);
    function increment() {
        deslocamento = deslocamento % 360 + 1;
}

    this.animation = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando elemento sai da tela ele é reaproveitado
            if(par.getX() < -par.getWidth()) {
                par.setX(par.getX() + space * this.pares.length)
                par.randomHeight()
            }

            const middle = 100 / 2
            const middleCut = par.getX() + deslocamento >= middle
                 && par.getX() < middle

            if(middleCut) pointNotify()
        })
    }
}

function bird(gameHeight) {
    let fly = false

    this.element = newElement('img', 'passaro')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('vh')[0])
    this.setY = y => this.element.style.bottom = `${y}vh`

    window.onkeypress = e => fly = true
    window.onkeyup = e => fly = false
    
    this.animation = () => {
        const newY = this.getY() + (fly ? 5 : -1.5)
        const maxHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight){
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }
    
    this.setY(gameHeight / 2)
}

function progress() {
    this.element = newElement('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.element.innerHTML = pontos
    }

    this.atualizarPontos(0)
}

function sobreposto(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaros, barreira) {
    let colidiu = false
    barreira.pares.forEach(parDeBarreiras => {
        if(!colidiu) {
            const superior = parDeBarreiras.superior.element
            const inferior = parDeBarreiras.inferior.element
            colidiu = sobreposto(passaros.element, superior)
                || sobreposto(passaros.element, inferior)
        }
    })
    return colidiu
}

function flappyBird() {
    let pontos = 0

    const gameAreaFB = document.querySelector('[wm-flappy]')

    const progresso = new progress()
    const barreira = new barreiras(130, 130, 65, 60,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new bird(125)

    gameAreaFB.appendChild(progresso.element)
    gameAreaFB.appendChild(passaro.element)
    barreira.pares.forEach(par => gameAreaFB.appendChild(par.element))

    this.start = () => {
        // loop do jogo
        const timer = setInterval(() => {
            barreira.animation()
            passaro.animation()

            if(colidiu(passaro, barreira)) {
                clearInterval(timer)
            }
        }, 35)
    }
}

new flappyBird().start()