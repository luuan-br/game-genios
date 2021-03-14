function useState(initial) {
	const state = [initial];

	const getValue = (_) => state[0];

	const useEffect = {
		observers: [],
		subscribe: function (fn) {
			this.observers.push(fn);
		},
		unsubscribe: function (fn) {
			this.observers = this.observers.filter(
				(subscrive) => subscrive !== fn,
			);
		},
		notify: function (data) {
			this.observers.forEach((observer) => {
				if (typeof observer === "function") observer(data);
			});
		},
	};

	const newValue = (newValue) => {
        state[0] = newValue;
		useEffect.notify({ oldValue: state[0], newValue });
	};

	return [getValue, newValue, useEffect];
}

// estados da aplicacao
const [ orderComputer, setOrderComputer, listenerOrderComputer ] = useState( [] );
const [ orderPlayer, setOrderPlayer, listenerOrderPlayer ] = useState( [] );
const [ numPass, setNumPass, listenerNumPass ] = useState( 0 );
const [ mode, setMode, listenerMode ] = useState( "CPU" );

// web audio api
const audioButton = document.querySelector("#sound-button");
const audioError = document.querySelector("#sound-error");

// Browser support
window.AudioContext = window.AudioContext || window.webkitAudioContext;
// Initialize audio context
const context = new AudioContext();
const soundButton = context.createMediaElementSource( audioButton );
soundButton.connect(context.destination);

const soundError = context.createMediaElementSource( audioError );
soundError.connect(context.destination);

// gera um numero aleatorio entre max e min
function randomNumberEntries( max, min ) {
    const maximum = max > min ? max : min;
    const minimum = min < max ? min : max;

    return Math.ceil( Math.random() * ( maximum - minimum ) + minimum );
}

// aguarda o ms para execultar a proxima linha
function sleep( ms = 1000 ) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

// observer valores da CPU
async function handleListenerComputer( data ) {
    const {newValue} = data;

    for (const value of newValue) {
        ativeButton( value );     
        await sleep(500);
        disableButton();
        await sleep(500);
    }
}

// observe valores do PLAYER
async function handleListenerPlayer( data ) {
    const {newValue} = data;
    const computerValues = orderComputer();

    
    if ( !(newValue === computerValues[numPass()] ) ) {
        console.log( "errou" );
        unRegisterListenerButtons();
        registerListenerResetGame();
        await sleep( 400 );
        audioError.play();
    } else {
        setNumPass( numPass() + 1 );
    }
}

// obeserve jogadas do player
async function handleListenerNumPass( data ) {
    const { newValue } = data;
    if( newValue === orderComputer().length ) {
        setNumPass( 0 );
        await sleep( 1000 );
        togglePlayerAndCpu();
    }
}

function ativeButton ( value ) {
    const buttons = document.querySelectorAll( ".button" );
    buttons[value - 1].classList.add( "active" );
    audioButton.play();
}

function disableButton() {
    const buttons = document.querySelectorAll( ".button" );
    buttons.forEach( button => button.classList.remove( "active" ) );
}

function generatePass() {
    const pass = randomNumberEntries( 0, 4 );
    const currentValue = orderComputer();
    const newValue = [ ...currentValue, pass ];
    setOrderComputer( newValue );
}

listenerOrderComputer.subscribe( handleListenerComputer );
listenerOrderPlayer.subscribe( handleListenerPlayer );
listenerNumPass.subscribe( handleListenerNumPass );

function togglePlayerAndCpu() {
    if( mode() === "CPU" ) {
        unRegisterListenerButtons();
        generatePass();
        setMode( "PLAYER" );
    }

    if( mode() === "PLAYER") {
        registerListenerButtons();
        setMode( "CPU" )
    }
}

async function handleClickButton( event ) {
    const target = event.currentTarget;
    setOrderPlayer( parseInt( target.getAttribute( "data-value" ) ) );
    audioButton.play();
    target.classList.add( "active" );
    await sleep( 300 );
    target.classList.remove( "active" );
}

async function handleClickStartGame( event ) {
    const target = event.currentTarget
    target.removeEventListener( "click", handleClickStartGame );
    target.innerHTML = "Let's";
    await sleep( 500 );
    target.innerHTML = "Go";
    await sleep( 500 );
    togglePlayerAndCpu();
}

function handleResetGame(event) {
    const target = event.currentTarget;
    target.removeEventListener( "click", handleResetGame )
    document.location.reload();
}


function registerListenerButtons() {
    const buttons = document.querySelectorAll( ".button" );
    buttons.forEach( (button, index) => {
        button.setAttribute( "data-value", index + 1 );
        button.addEventListener( "click", handleClickButton );
    } )
}

function unRegisterListenerButtons() {
    const buttons = document.querySelectorAll( ".button" );
    buttons.forEach( button => button.removeEventListener( "click", handleClickButton ) );
}

function startGame() {
    const buttonStart = document.querySelector( ".start" );
    buttonStart.addEventListener( "click", handleClickStartGame );
}

async function registerListenerResetGame() {
    const buttonStart = document.querySelector( ".start" );
    buttonStart.innerHTML = "It lost";
    await sleep( 1000 );
    buttonStart.innerHTML = "Reset Game";
    buttonStart.addEventListener( "click", handleResetGame );
}

startGame();



