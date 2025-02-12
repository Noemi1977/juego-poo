
// Clases a utilizar 

class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.iniciarMusicaFondo();
        this.personaje = null;
        this.monedas = [];
        this.puntuacion = 0;
        this.restOfTime = 60;
        this.gameEnded= false;
        this.crearEscenario();
        this.agregarEventos();
        this.scoreElement = document.getElementById("score");
        this.timerElement =document.getElementById("timer");
        this.timerInit();
        
    }

    iniciarMusicaFondo(){ // Crea el objeto de audio para la música de fondo
       
        this.backgroundMusic = new Audio('./public/audio/ringtones-super-mario-bros.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.2;
        // Inicia la reproducción
        document.addEventListener("click", () => {
            this.backgroundMusic.play().catch(error => 
                console.log("Error al reproducir la música de fondo:", error)
            );
        }, { once: true }); // Se ejecuta solo una vez

    }

    crearEscenario() {
        this.personaje= new Personaje();// creamos un personaje
        this.container.appendChild(this.personaje.element) //agregamos dentro del contenedor un personaje que sera un hijo de container
        for(let i=0; i<10;i++){ 
            const moneda=new Moneda();
            this.monedas.push(moneda);//metemos en el arrey las monedas que se crearon
            this.container.appendChild(moneda.element); //agregamos las monedas(tambien es un hijo de container) 
            // en este caso 10 al contenedor mediante un bucle 
        }
    }
    timerInit(){
        this.intervalTime = setInterval(()=> {
            if(this.restOfTime > 0) {
                this.restOfTime--;
                this.updateTimer();
            } else{
                clearInterval(this.intervalTime)
                this.gameOver();
            }

        },1000);

    }
    updateTimer(){
        this.timerElement.textContent =this.restOfTime;
        this.timerElement.textContent= "Tiempo : " + this.restOfTime + " segundos";
    }

    agregarEventos() {
        this.keyListener = (e) => this.personaje.mover(e);
        window.addEventListener("keydown", this.keyListener);
        this.checkColisiones();

    }
    checkColisiones() {
        setInterval(() => {
            this.monedas.forEach((moneda, index) => {
              if (this.personaje.colisionaCon(moneda)) {
                // Elimina la moneda del DOM y del arreglo
                this.container.removeChild(moneda.element);
                this.monedas.splice(index, 1);
                // Actualiza la puntuación y reproduce el sonido
                this.actualizarScore(100);
                const sonidoMoneda = new Audio('./public/audio/pop-39222.mp3');
                sonidoMoneda.play().catch(error => {
                  console.log("Error al reproducir el sonido de la moneda:", error);
                });
              }
            });
            
            // Comprobamos si se han recogido todas las monedas
            if (this.monedas.length === 0 && !this.gameEnded) {
                this.gameEnded = true;
              // Llamamos a gameOver para finalizar el juego inmediatamente
              this.gameOver();
            }
            
          }, 100);

    }
actualizarScore(score){
    this.puntuacion += score;
    this.scoreElement.textContent= "Puntuacion : " + this.puntuacion + " puntos";
}

gameOver(){
   
    // Detenemos el marcador y blqueamos la interacción
    clearInterval(this.intervalTime);
    window.removeEventListener("keydown",this.keyListener);
    
    // Paramos la musica de fondo
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    // Condiciona un sonido u otro segun se gane o se pierda 
    let titulo = "";
    let mensaje = "";
    let icono = "";
    if(this.monedas.length===0 && this.puntuacion === 1000){
        this.backgroundMusic.pause();
        const victoriaSound= new Audio("./public/audio/applause-sound-effect-240470.mp3");
        victoriaSound.play().catch(error=> console.log("Error de sonido",error));
        titulo = "¡Ganaste! 🎉";
        mensaje = "Has recogido toda la miel. Puntuación final: " + this.puntuacion;
        icono = "success";
    } else{
        const defeatSound= new Audio ("./public/audio/cartoon-trombone-sound-effect-241387.mp3")
        defeatSound.play().catch(error=> console.log("Error de sonido",error));
        titulo = "¡Perdiste! 😢";
        mensaje = "No terminaste a tiempo. Puntuación final: " + this.puntuacion;
        icono = "error";
    }
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono,
        confirmButtonText: "Aceptar",
        background: "#7b4926f4",
        color: "#49704b",
        confirmButtonColor: "#49704b",
        customClass: {
            popup: 'custom-popup',
            title: 'custom-title',
            confirmButton: 'custom-button'
        }
    }).then(() => {
        location.reload(); // Reiniciar juego
    });  
}

}

class Personaje{
    constructor() {//estamos posicionando al personaje, donde esta al inicio y su tamaño
        this.x = 50;
        this.y = 300;
        this.width = 50;
        this.height = 50;
        this.velocidad = 10;
        this.saltando = false;
        this.element = document.createElement("div"); //crea un div para este elemento
        this.element.classList.add("personaje");// y le asigna la clase personaje
        this.actualizarPosicion();
    }
    mover(evento){
        const limiteIzquierdo = 0;
        const limiteDerecho = 800 - this.width; // 800px es el ancho del contenedor
        if(evento.key === "ArrowRight"){
            if(this.x + this.velocidad <= limiteDerecho) // No se sale del limite derecho
            this.x += this.velocidad;
        }else if (evento.key === "ArrowLeft"){
            if(this.x + this.velocidad >= limiteIzquierdo)// No se sale del limite izquierdo
            this.x -= this.velocidad;
        }else if(evento.key === "ArrowUp" && !this.saltando){
            this.saltar();
        }
       
       
        this.actualizarPosicion();

    }
    saltar(){
        this.saltando = true;
        let alturaMax = this.y - 250;
        const salto = setInterval( () => {
            if (this.y > alturaMax){
                this.y -= 10; //gravedad normal para que se mueva de forma normal y no lentamente  
            } else {
                clearInterval(salto);
                this.caer();
            }
            this.actualizarPosicion();
        }
            ,20)
    }
    caer(){
        const gravedad = setInterval( ()=> {
            if(this.y < 300 ){
                this.y += 10; 
            }else{
                clearInterval(gravedad)
                this.saltando=false;
            }
            this.actualizarPosicion();
        }
            ,20)
    }
    actualizarPosicion(){
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

    }
    colisionaCon(objeto) { // deteccion de colisiones regular, se utiliza para este tipo de juegos 
        return (
          this.x < objeto.x + objeto.width &&
          this.x + this.width > objeto.x &&
          this.y < objeto.y + objeto.height &&
          this.y + this.height > objeto.y
        );
    }
}

class Moneda {
    constructor() {
        this.x = Math.random()*700 + 50; 
        this.y = Math.random()*250 + 50; //Colocamos las monedas de forma aleatoria 
        this.width = 30;
        this.height = 30;
        this.element = document.createElement("div");
        this.element.classList.add("moneda");
        this.actualizarPosicion();
    }
    actualizarPosicion(){
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

}

const juego = new Game()