// Memento.js
// Maybe we can get it all in one file?
// This is the guts of our memory game.

let Memento = {
    pageHeader: null,
    pageMain: null,
    mainDeck: null,
    startTime: null,
    turnsTaken: null,
    turnZone: null,
    // clickedCards and solvedCards should ONLY contain
    // the ids of cards as strings, from 'card00' to 'card15'
    clickedCards: null,
    solvedCards: null,
    firstGame: true,
};

function CLOG (msg) {
    return console.log(msg);
}

function handleCardFlip (cardEvent) {
    // we have to handle all the various cases
    eTarget = cardEvent.target.parentNode;
    eTargetParent = eTarget.parentNode;
    CLOG('clicked on id: ' + eTargetParent.id);
    
    // A card conceptually has 3 states we track:
    // A card can be solved or unsolved.
    // A card can be clicked or unclicked.
    // A card can be face-up or face-down.

    // These states relate to each other in fundamental ways.
    // A card that is solved is always unclicked and face-up.
    // A card that is unsolved can be clicked/unclicked and face-up/face-down.
    // A card that is clicked is always face-up.
    // A card that is unclicked can be solved/unsolved and face-up/face-down.
    // A card that is face-up can be solved/unsolved and clicked/unclicked.
    // A card that is face-down is always unclicked and unsolved.
    
    if (!eTargetParent.id) {
        CLOG('not a valid click area');
        return;
    }
    
    // what do we do if they click a card that is solved?
    // nothing, it remains unclicked and face-up.
    if (Memento.solvedCards.has(eTargetParent.id)) {
        CLOG('is solved');
        return;
    }
    // what do we do if they click a card that is unsolved?
    else {
        // ...and there are no other face-up unsolved cards?
        // we make it clicked and face-up.
        if (Memento.clickedCards.size === 0) {
            CLOG('none flipped, flipping');
            Memento.clickedCards.add(eTargetParent.id);
            toggleFlippedState(eTarget);
        }
        
        // ...and there is a face-up unsolved card?
        else if (Memento.clickedCards.size == 1) {
            // ...and it's the card we clicked?
            // we make it unclicked and face-down.
            if (Memento.clickedCards.has(eTargetParent.id)) {
                CLOG('one flipped, unflipping');
                Memento.clickedCards.clear();
                toggleFlippedState(eTarget);
            }
            // ...and it's not the card we clicked?
            else {
                CLOG(Memento.clickedCards.values());
                CLOG(Memento.clickedCards.values().next().value);
                const cidA = Memento.clickedCards.values().next().value;
                const cidB = eTargetParent.id;
                const cardA = document.getElementById(cidA).firstChild.querySelector('.card-face');
                const cardB = eTarget.querySelector('.card-face');

                // ...and it matches the card we clicked?
                // we add them to solved and dump them from clicked.
                if (cardA.textContent == cardB.textContent) {
                    CLOG('one flipped, solving pair');
                    toggleFlippedState(eTarget);
                    Memento.solvedCards.add(cidA);
                    Memento.solvedCards.add(cidB);
                    Memento.clickedCards.clear();
                }
                // ...and it doesn't match the other clicked card?
                // we make it clicked and face-up.
                else {
                    CLOG('one flipped, flipping second');
                    Memento.clickedCards.add(eTargetParent.id);
                    toggleFlippedState(eTarget);
                }
                Memento.turnsTaken += 1;
            }
        }
        // ...and there are two face-up unsolved cards?
        else if (Memento.clickedCards.size == 2) {
            // ...and one of them is the card we clicked?
            // we make it unclicked and face-down.
            if (Memento.clickedCards.has(eTargetParent.id)) {
                CLOG('two flipped, unflipping');
                Memento.clickedCards.delete(eTargetParent.id);
                toggleFlippedState(eTarget);
            }
            // ...and neither of them are the card we clicked?
            // we make the clicked cards unclicked and face-down,
            // then we make the newly clicked card clicked and face-up.
            else {
                CLOG('two flipped, unflipping old to flip new');
                let cValues = Memento.clickedCards.values()
                const cidA = cValues.next().value;
                const cidB = cValues.next().value;
                const cardA = document.getElementById(cidA).firstChild;
                const cardB = document.getElementById(cidB).firstChild;
                toggleFlippedState(cardA);
                toggleFlippedState(cardB);
                Memento.clickedCards.clear();
                Memento.clickedCards.add(eTargetParent.id);
                toggleFlippedState(eTarget);
            }
        }
    }
    
    Memento.turnZone.textContent = 'Turns taken: ' + Memento.turnsTaken.toString();
    
    // then we check to see if the game is over.
    if (Memento.solvedCards.size === 16) {
        CLOG('YOU WIN, MAKE WINNING WORK');
        triggerGameWin();
    }
}

function triggerGameWin () {
    /*
    const newZone = document.createDocumentFragment();
    const newGame = document.createElement('div');
    newGame.id = 'new-game';
    
    const youWin = document.createElement('h3');
    youWin.textContent = 'You win!';
    newGame.appendChild(youWin);
    
    const restart = document.createElement('button');
    restart.textContent = 'Start New Game';
    restart.addEventListener('click', restartGame);
    newGame.appendChild(restart);
    
    newZone.appendChild(newGame);
    
    Memento.pageHeader.appendChild(newZone);
    */
    
    //document.getElementById('game-board').classList.toggle('face-up');
    document.querySelector('.big-card-back').classList.toggle('is-up');
    document.querySelector('.big-card-back').classList.toggle('is-down');
    document.querySelector('.big-card-face').classList.toggle('is-up');
    document.querySelector('.big-card-face').classList.toggle('is-down');
    document.querySelector('.big-card-face').addEventListener('click', restartGame);
}

function wipeGameWin () {
    //document.getElementById('new-game').remove();
}

function toggleFlippedState (eTarget) {
    // the two flipped states are "face-up" and "face-down"
    //CLOG(eTarget);
    //eTarget.classList.toggle('face-down');
    eTarget.querySelector('.card-back').classList.toggle('is-up');
    eTarget.querySelector('.card-back').classList.toggle('is-down');
    eTarget.querySelector('.card-face').classList.toggle('is-up');
    eTarget.querySelector('.card-face').classList.toggle('is-down');
}

function buildNewDeck () {
    let newDeck = [
        // face screaming in fear
        String.fromCodePoint('0x1F631'),
        String.fromCodePoint('0x1F631'),
        // nauseated face
        String.fromCodePoint('0x1F922'),
        String.fromCodePoint('0x1F922'),
        // sneezing face
        String.fromCodePoint('0x1F927'),
        String.fromCodePoint('0x1F927'),
        // ghost
        String.fromCodePoint('0x1F47B'),
        String.fromCodePoint('0x1F47B'),
        // woman zombie
        String.fromCodePoint('0x1F9DF'),
        String.fromCodePoint('0x1F9DF'),
        // wilted flower
        String.fromCodePoint('0x1F940'),
        String.fromCodePoint('0x1F940'),
        // game die
        String.fromCodePoint('0x1F3B2'),
        String.fromCodePoint('0x1F3B2'),
        // dagger
        String.fromCodePoint('0x1F5E1'),
        String.fromCodePoint('0x1F5E1'),

        /*
        // face with medical mask
        String.fromCodePoint('0x1F637'),
        String.fromCodePoint('0x1F637'),
        // skull
        String.fromCodePoint('0x1F480'),
        String.fromCodePoint('0x1F480'),
        
        String.fromCodePoint('0x26B0'),
        String.fromCodePoint('0x26B0'),
        String.fromCodePoint('0x26B1'),
        String.fromCodePoint('0x26B1'),
        String.fromCodePoint('0x2623'),
        String.fromCodePoint('0x2623'),
        String.fromCodePoint('0x2620'),
        String.fromCodePoint('0x2620'),
        */
    ];
    
    let shuffledDeck = [];
    let aCard;
    while (newDeck.length > 0) {
        aCard = newDeck.splice(Math.floor(Math.random() * newDeck.length), 1)[0];
        shuffledDeck.push(aCard);
    }
    Memento.mainDeck = shuffledDeck;
}

function buildNewGame () {
    // we always rebuild the whole thing here
    // this is a point we can loop back to when we want to start a new game

    Memento.pageHeader = document.querySelector('header');
    Memento.pageMain = document.querySelector('main');
    Memento.gameZone = document.createDocumentFragment();
    //CLOG('created gameZone');
    Memento.startTime = Date.now();
    Memento.turnsTaken = 0;
    Memento.turnZone = document.querySelector('.turn-count');
    Memento.turnZone.textContent = 'Turns taken: 0';
    
    Memento.clickedCards = new Set();
    Memento.solvedCards = new Set();
    
    return drawGameBoard(buildGameBoard());
}

function buildGameBoard () {
    buildNewDeck();
    //CLOG('created mainDeck');
    
    let theBoard = document.createElement('div');
    //CLOG('created theBoard');
    
    let rows = 0;
    let aRow;
    while (rows < 4) {
        //console.log(theBoard);
        aRow = document.createElement('div');
        aRow.classList.add('card-row');
        theBoard.appendChild(buildCardRow(rows, aRow));
        rows += 1;
    }
    return theBoard;
}

function buildCardRow (total, aRow) {
    //CLOG('building a row');
    let cnt = 0;
    while (cnt < 4) {
        aRow.appendChild(buildGameCard((total * 4) + cnt));
        cnt += 1;
    }
    return aRow;
}

function buildGameCard (cNum) {
    //CLOG('created card #' + cNum);
    const newCard = document.createElement('div');
    let cardNum;
    
    // this should format the card number as a 2-digit string
    if (cNum < 10) {
        //CLOG(cNum + '< 10');
        cardNum = '' + '0';
        cardNum += cNum.toString();
    }
    else {
        //CLOG(cNum + '>= 10');
        cardNum = cNum.toString();
    }
    
    newCard.id = 'card' + cardNum;
    newCard.classList.add('card-container');
    
    const cardZone = document.createElement('div');
    cardZone.classList.add('card');
    //cardZone.classList.add('face-down');
    newCard.addEventListener('click', handleCardFlip);
    
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.classList.add('is-up');
    cardBack.textContent = '?';
    cardZone.appendChild(cardBack);
    
    const cardFace = document.createElement('div');
    cardFace.classList.add('card-face');
    cardFace.classList.add('is-down');
    cardFace.textContent = Memento.mainDeck[cNum];
    cardZone.appendChild(cardFace);
    
    //newCard.classList.add('face-down');
    newCard.appendChild(cardZone);
    return newCard;
}

function drawGameBoard (gameBoard) {
    if (!Memento.firstGame) {
        // dump all the existing content
        while (Memento.pageMain.hasChildNodes() === true) {
            Memento.pageMain.removeChild(Memento.pageMain.firstChild);
        }
        CLOG('dumped the old main content');
    }
    
    const gameZone = document.createDocumentFragment();
    
    const bigCardContainer = document.createElement('div');
    bigCardContainer.classList.add('big-card-container');
    
    const bigCard = document.createElement('div');
    bigCard.classList.add('big-card');
    //gameBoard.classList.add('face-down');
    
    gameBoard.classList.add('big-card-back');
    gameBoard.classList.add('game-board');
    gameBoard.classList.add('is-up')
    bigCard.appendChild(gameBoard);
    
    const bigCardFace = document.createElement('div');
    bigCardFace.classList.add('big-card-face');
    bigCardFace.classList.add('is-down');
    
    const youWin = document.createElement('h3');
    youWin.textContent = 'You win!';
    youWin.classList.add('you-win');
    bigCardFace.appendChild(youWin);
    
    const restart = document.createElement('h3');
    restart.textContent = 'Click here to start a new game.';
    restart.classList.add('click-here');
    bigCardFace.appendChild(restart);
    
    bigCard.appendChild(bigCardFace);
    
    bigCardContainer.appendChild(bigCard);
    gameZone.appendChild(bigCardContainer);
    Memento.pageMain.appendChild(gameZone);
    //CLOG('appended aBoard to main');
    
    if (Memento.firstGame) {
        // After we build all the game content, we fade out the title card
        const titleCard = document.querySelector('.title-card');
        titleCard.classList.toggle('title-card-visible');
        titleCard.classList.toggle('title-card-hidden');

        // then we wait a second.
        // then we dump it, just blammo
        setTimeout( function () {
            Memento.pageMain.removeChild(document.querySelector('.title-card'));
            Memento.firstGame = false;
        }, 1000);
        // this works so well, I almost feel like I MUST BE doing something wrong.
    }
}

function restartGame () {
    wipeGameWin();
    buildNewGame();
}


//buildNewGame();

function buildTitleCard () {
    const titleZone = document.createDocumentFragment();
    const titleCard = document.createElement('div');
    titleCard.classList.add('title-card');
    titleCard.classList.add('title-card-visible');
    
    const titleName = document.createElement('div');
    titleName.textContent = 'memento mori';
    const titleClick = document.createElement('div');
    titleClick.textContent = 'click to begin';
    
    titleCard.appendChild(titleName);
    titleCard.appendChild(titleClick);
    
    titleCard.addEventListener('click', buildNewGame);
    titleZone.appendChild(titleCard);
    document.querySelector('main').appendChild(titleZone);
}

buildTitleCard();



/*
*
*
* Courtesy Spaces
*
*
*/