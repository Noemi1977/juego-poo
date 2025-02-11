
// Clases a utilizar 

class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.puntuacion=0;
        this.crearEscenario();
        this.agregarEventos();
    }
    crearEscenario() {
        this.personaje= new Personaje();// creamos un personaje
        this.container.appendChild(this.personaje.element) //agregamos dentro del contenedor un personaje que sera un hijo de container
        for(let i=0; i<10;i++){ 
            const moneda=new Moneda();
            this.monedas.push(moneda);//metemos en el arrey las monedas que se crearon
            this.container.appendChild(moneda.element); //agregamos las monedas(tambien es un hijo de container) 
            // en este caso 5 al contenedor mediante un bucle 
        }
    }
    agregarEventos() {
        window.addEventListener("keydown",(e)=> this.personaje.mover(e));
        this.checkColisiones();

    }
    checkColisiones() {
        setInterval( ()=>{
            this.monedas.forEach((moneda,index)=>{
                if(this.personaje.colisionaCon(moneda)){ //Si un personaje colisiona con una moneda se quitara esa moneda 
                    this.container.removeChild(moneda.element);
                    this.monedas.splice(index,1)
                }
                 // Crea un objeto Audio para el sonido de colisión
        const sonidoMoneda = new Audio('./');
        sonidoMoneda.play().catch(error => {
          console.log("Error al reproducir el sonido de colisión:", error);
        
      
    });
            })
        },
            100)//cada milisegundo

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
        this,this.actualizarPosicion();
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