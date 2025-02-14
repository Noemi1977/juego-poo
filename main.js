
// Clases a utilizar 

class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.iniciarMusicaFondo();
        this.personaje = null;
        this.honeys = [];
        this.obstaculo= null;
        this.puntuacion = 0;
        this.restOfTime = 60;
        this.gameEnded= false;
        this.crearEscenario();
        this.agregarEventos();
        this.scoreElement = document.getElementById("score");
        this.timerElement =document.getElementById("timer");
        this.timerInit();
        
    }

    iniciarMusicaFondo() {
        this.backgroundMusic = new Audio('./public/audio/ringtones-super-mario-bros.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.2;
        this.isPlaying = true; // La música empieza encendida por defecto
        this.backgroundMusic.play().catch(error => 
            console.log("Error al reproducir la música de fondo:", error)
        );
    
        // Capturamos el botón y su imagen
        const buttonSound = document.getElementById("buttonSound");
        const buttonImage = buttonSound.querySelector("img");
    
        buttonSound.addEventListener("click", () => {
            if (this.isPlaying) {
                this.backgroundMusic.pause();
                buttonImage.src = "./public/img/noSound.png"; 
            } else {
                this.backgroundMusic.play().catch(error => 
                    console.log("Error al reproducir la música de fondo:", error)
                );
                buttonImage.src = "./public/img/sound.png"; 
            }
            this.isPlaying = !this.isPlaying; 
        });
    }
    

    crearEscenario() {
        this.personaje= new Personaje();// creamos un personaje
        this.container.appendChild(this.personaje.element); //agregamos dentro del contenedor un personaje que sera un hijo de container
        
        for(let i=0; i<10;i++){ 
            const honey= new Honey();
            this.honeys.push(honey);//metemos en el arrey las monedas que se crearon
            this.container.appendChild(honey.element); //agregamos las monedas(tambien es un hijo de container) 
            // en este caso 10 al contenedor mediante un bucle 
        }
         // Crear obstáculo usando la clase heredada
         this.obstaculo = new Obstaculo();
         this.container.appendChild(this.obstaculo.element);
        
    }
    

    timerInit() {
        this.intervalTime = setInterval(()=> {
            if(this.restOfTime > 0) {
                this.restOfTime--;
                this.updateTimer();
            } else{
                clearInterval(this.intervalTime);
                this.gameOver();
            }

        }, 1000);

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
        if (this.gameEnded) return;
        setInterval(() => {
            this.honeys.forEach((honey, index) => {
              if (this.personaje.colisionaCon(honey)) {
                // Elimina la moneda del DOM y del arreglo
                this.container.removeChild(honey.element);
                this.honeys.splice(index, 1);
                // Actualiza la puntuación y reproduce el sonido
                this.actualizarScore(100);
                const sonidoHoney = new Audio('./public/audio/pop-39222.mp3');
                sonidoHoney.play().catch(error => {
                  console.log("Error al reproducir el sonido del choque:", error);
                });
              }
            });
             // Verificar colisión con el obstáculo (Game Over)
             if (this.personaje.colisionaCon(this.obstaculo )) {
                this.gameOver("obstaculo");  
               
                return;
            }
        
            // Comprobamos si se han recogido todas las monedas
            if (this.honeys.length === 0 && !this.gameEnded) {
                
              // Llamamos a gameOver para finalizar el juego inmediatamente
              this.gameOver("win");
              return;

            }
            
          }, 100);

    }
actualizarScore(score){
    this.puntuacion += score;
    this.scoreElement.textContent= "Puntuacion : " + this.puntuacion + " puntos";
}

gameOver(tipoColision=""){
   // Evita que se ejecute múltiples veces si el juego ya terminó
   if (this.gameEnded) return;
   
   this.gameEnded = true; // Marcamos que el juego ha terminado
    // Detenemos el marcador y blqueamos la interacción
    clearInterval(this.intervalTime);
    window.removeEventListener("keydown",this.keyListener);
    
    // Paramos la musica de fondo
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    // Condiciona un sonido u otro segun se gane o se pierda 
    let titulo, mensaje, icono, finalSound;

    
   
    if (tipoColision === "obstaculo") {
        // Si la colisión fue con el obstáculo
        finalSound = new Audio("./public/audio/cartoon-trombone-sound-effect-241387.mp3");
        titulo = "¡Oh no! 🐝";
        mensaje = "¡¡¡¡La abejita ha sido atrapada por el oso feroz!!!!";
        icono = "error";
    } else if (this.honeys.length === 0 && this.puntuacion === 1000) {
        // Si el jugador ha ganado
        finalSound = new Audio("./public/audio/applause-sound-effect-240470.mp3");
        titulo = "¡Ganaste! 🎉";
        mensaje = `Has recogido toda la miel. Puntuación final: ${this.puntuacion}`;
        icono = "success";
    } else {
        // Si el jugador ha perdido por el tiempo
        finalSound = new Audio("./public/audio/cartoon-trombone-sound-effect-241387.mp3");
        titulo = "¡Perdiste! 😢";
        mensaje = `¡Oh no! 🐝! No ha podido ser, Quieres volver a intentarlo?. Puntuación final: ${this.puntuacion}`;
        icono = "error";
    }
     // Reproduce el sonido de fin de juego
     finalSound.play().catch(error => console.log("Error de sonido", error));


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

class ElementGame{
    constructor (classCSS, width, height) {
        this.x = Math.random()*700 + 50; 
        this.y = Math.random()*250 + 50; //Colocamos las monedas de forma aleatoria 
        this.width = width;
        this.height = height;
        this.element = document.createElement("div");
        this.element.classList.add(classCSS);
        this.actualizarPosicion();
    }
    actualizarPosicion(){
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    }
    class Honey extends ElementGame {
        constructor() {
            super("honey", 30, 30);
        }
    }
    
    class Obstaculo extends ElementGame {
        constructor() {
            super("obstaculo", 40, 40);
        }
    }
    



let juego = null; // No iniciamos el juego todavia 

document.getElementById("buttonInicio").addEventListener("click", () => {
    if (!juego) {
        juego = new Game(); // se crea el juego al pulsar el botón

        // Seleccionamos los botones del index
        const botones = document.querySelectorAll(".bArrow");

        // Los asignamos segun la posición
        botones.forEach((boton, index) => {
        
            boton.addEventListener("click", () => {
        
                    if (index === 0) juego.personaje.mover({ key: "ArrowLeft" });  // Izquierda
                    if (index === 1) juego.personaje.mover({ key: "ArrowUp" });    // Salto
                    if (index === 2) juego.personaje.mover({ key: "ArrowRight" }); // Derecha
                }, 100);
            });
        
           
            
        }});
    
