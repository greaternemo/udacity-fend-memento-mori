// Memento.js
// Maybe we can get it all in one file?
// This is the guts of our memory game.

let Memento = {
    pageBody: null,
    
    pageHeader: null,
    
    turnCountZone: null,
    turnsTaken: null,
    
    timeElapsedZone: null,
    startTime: null,
    lastTime: null,
    timeLoop: null,

    pageMain: null,
    mainDeck: null,
    // The arrays in clickedCards and solvedCards should ONLY contain
    // the ids of cards as strings, from 'card00' to 'card15'.
    clickedCards: null,
    solvedCards: null,
    firstGame: true,
};



/*
Utility functions
*/

function formatNum (aNum) {
    // This formats a number as a 2-digit string.
    let formatted;
    if (aNum < 10) {
        formatted = '' + '0';
        formatted += aNum.toString();
    }
    else {
        formatted = aNum.toString();
    }
    return formatted;
}



/*
Build The First Game
*/

// Everything starts with buildTitleCard(), which we call at the end of this script.
function buildTitleCard () {
    buildPageBody();
    
    const titleZone = document.createDocumentFragment();
    
    const titleCard = document.createElement('div');
    titleCard.classList.add('title-card');
    titleCard.classList.add('title-card-visible');
    titleCard.addEventListener('click', buildNewGame);
    
    // Could these be p elements instead of divs?
    // Probably, but using divs gives me the formatting I want without needing to
    // spend more time formatting something I'm going to use once and then trash.
    const titleName = document.createElement('div');
    titleName.textContent = 'memento mori';
    const titleMyName = document.createElement('div');
    titleMyName.textContent = 'by adam boyd';
    const titleClick = document.createElement('div');
    titleClick.textContent = 'click to begin';
    
    titleCard.appendChild(titleName);
    titleCard.appendChild(titleMyName);
    titleCard.appendChild(titleClick);
    
    titleZone.appendChild(titleCard);
    Memento.pageMain.appendChild(titleZone);
}

function buildPageBody () {
    Memento.pageBody = document.querySelector('body');
    const bodyParts = document.createDocumentFragment();
    
    bodyParts.appendChild(buildFirstHeader());
    bodyParts.appendChild(buildFirstMain());
    
    Memento.pageBody.appendChild(bodyParts);
    
    Memento.pageHeader = document.querySelector('header');
    Memento.turnCountZone = document.querySelector('.turn-count');
    Memento.timeElapsedZone = document.querySelector('.time-elapsed');
    Memento.pageMain = document.querySelector('main');
}

function buildFirstHeader () {
    const newHeader = document.createElement('header');
    
    const gameInfo = document.createElement('div');
    gameInfo.id = 'game-info';
    
    const turnCount = document.createElement('h3');
    turnCount.classList.add('turn-count');
    const timeElapsed = document.createElement('h3');
    timeElapsed.classList.add('time-elapsed');

    gameInfo.appendChild(turnCount);
    gameInfo.appendChild(timeElapsed);
    
    newHeader.appendChild(gameInfo);
    
    return newHeader;
}

function buildFirstMain () {
    // I think this is really it here. Hm.
    const newMain = document.createElement('main');
    return newMain;
}



/*
Build Every Game Beyond The First
*/

function buildNewGame () {
    // We don't have to do much right here anymore because a lot of the do-overs
    // are handled further down.
    Memento.turnsTaken = 0;
    Memento.lastTime = '00:00';
    
    // We use sets here because they're much easier to use than arrays for things like
    // testing inclusion and guaranteeing exclusivity of the values we push inside.
    Memento.clickedCards = new Set();
    Memento.solvedCards = new Set();

    return drawTheGame(buildTheGame());
}

function buildTheGame () {
    buildGameInfo();
    return buildBigCard();
}

function buildGameInfo () {
    Memento.turnCountZone.textContent = 'Turns taken: 0';
    Memento.timeElapsedZone.textContent = `Time elapsed: ${Memento.lastTime}`;

    // We're gonna set this on a timer here so that the clock starts ticking
    // around about when the cards finish fading in.
    setTimeout(function() {
        Memento.startTime = Math.floor(Date.now() / 1000);
        // We're gonna do this every 250ms instead of every 1000ms because if
        // any minor bit of latency arises between intervals, no matter how
        // much of an offset builds up, you'll never see the timer skip a second.
        Memento.timeLoop = setInterval(calculateTimeElapsed, 250);
    }, 1000);
}

function calculateTimeElapsed () {
    const elapsed = Memento.timeElapsedZone;
    const timeStart = Memento.startTime;
    const timeNow = Math.floor(Date.now() / 1000);
    const minutes = formatNum(Math.floor((timeNow - timeStart) / 60));
    const seconds = formatNum(Math.floor((timeNow - timeStart) % 60));
    const newTime = `${minutes}:${seconds}`;
    // To save ourselves the hassle of an unnecesary screen redraw, 
    // we calculate this, compare it to the last time we drew, and 
    // then we only redraw if the time needs to be updated.
    if (newTime != Memento.lastTime) {
        Memento.lastTime = newTime;
        redrawTimeElapsed();
    }
}

function redrawTimeElapsed () {
    Memento.timeElapsedZone.textContent = `Time elapsed: ${Memento.lastTime}`;
}

function buildBigCard () {
    const bigCardZone = document.createDocumentFragment();
    
    const bigCardContainer = document.createElement('div');
    bigCardContainer.classList.add('big-card-container');
    
    const bigCard = document.createElement('div');
    bigCard.classList.add('big-card');
    
    bigCard.appendChild(buildBigCardBack());
    bigCard.appendChild(buildBigCardFace());
    
    bigCardContainer.appendChild(bigCard);
    
    bigCardZone.appendChild(bigCardContainer);
    
    return bigCardZone;
}

function buildBigCardBack () {
    const bigBack = buildGameBoard();
    bigBack.classList.add('big-card-back');
    bigBack.classList.add('game-board');
    bigBack.classList.add('is-up')

    return bigBack;
}

function buildGameBoard () {
    Memento.mainDeck = buildNewDeck();
    
    let theBoard = document.createElement('div');
    
    let rows = 0;
    let aRow;
    while (rows < 4) {
        aRow = document.createElement('div');
        aRow.classList.add('card-row');
        theBoard.appendChild(buildCardRow(rows, aRow));
        rows += 1;
    }
    return theBoard;
}

function buildNewDeck () {
    /*
    These are our emojis.
    They were specifically chosen for browser compatibility.
    These should all display as proper emojis, not as plain UTF-8
    characters that default to the same formatting as the text.
    */
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
    ];
    
    let shuffledDeck = [];
    let aCard;
    while (newDeck.length > 0) {
        /*
        Full disclosure, this array randomizer is straight jacked from the
        JS roguelike engine I've been writing. A lot of the things I do and
        the quirks about how I do them can be traced back to my RL coding.
        */
        aCard = newDeck.splice(Math.floor(Math.random() * newDeck.length), 1)[0];
        shuffledDeck.push(aCard);
    }
    return shuffledDeck;
}

function buildCardRow (total, aRow) {
    let cnt = 0;
    while (cnt < 4) {
        aRow.appendChild(buildGameCard((total * 4) + cnt));
        cnt += 1;
    }
    return aRow;
}

function buildGameCard (cNum) {
    const newCard = document.createElement('div');
    let cardNum = formatNum(cNum);
    
    newCard.id = 'card' + cardNum;
    newCard.classList.add('card-container');
    
    const cardZone = document.createElement('div');
    cardZone.classList.add('card');
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
    
    newCard.appendChild(cardZone);
    return newCard;
}

function buildBigCardFace () {
    const bigFace = document.createElement('div');
    bigFace.classList.add('big-card-face');
    bigFace.classList.add('is-down');
    
    const youWin = document.createElement('h3');
    youWin.textContent = 'You win!';
    youWin.classList.add('you-win');
    const playRating = document.createElement('h3');
    playRating.textContent = '';
    playRating.classList.add('play-rating');    
    const restart = document.createElement('h3');
    restart.textContent = 'Click here to start a new game.';
    restart.classList.add('click-here');
    
    bigFace.appendChild(youWin);
    bigFace.appendChild(playRating);
    bigFace.appendChild(restart);

    return bigFace;
}

function drawTheGame (bigCardZone) {
    if (!Memento.firstGame) {
        // If this isn't the first game, dump all the existing content.
        while (Memento.pageMain.hasChildNodes() === true) {
            Memento.pageMain.removeChild(Memento.pageMain.firstChild);
        }
    }
    else {
        // After we build all the game content, we fade out the title card.
        const titleCard = document.querySelector('.title-card');
        titleCard.classList.toggle('title-card-visible');
        titleCard.classList.toggle('title-card-hidden');

        // Then we wait a second. Literally, 1000 ms.
        // Then we dump it, just blammo. We don't need it after this.
        setTimeout( function () {
            Memento.pageMain.removeChild(document.querySelector('.title-card'));
            Memento.firstGame = false;
        }, 1000);
        // This works so well, I almost feel like I MUST BE doing something wrong.
    }
    
    Memento.pageMain.appendChild(bigCardZone);
}



/*
Handling player interaction during the game
*/

function handleCardFlip (cardEvent) {
    // Obv, we have to handle all the various cases
    eTarget = cardEvent.target.parentNode;
    eTargetParent = eTarget.parentNode;
    
    /*
    A card conceptually has 3 states we track:
    A card can be solved or unsolved.
    A card can be clicked or unclicked.
    A card can be face-up or face-down.

    These states relate to each other in fundamental ways.
    A card that is solved is always unclicked and face-up.
    A card that is unsolved can be clicked/unclicked and face-up/face-down.
    A card that is clicked is always face-up.
    A card that is unclicked can be solved/unsolved and face-up/face-down.
    A card that is face-up can be solved/unsolved and clicked/unclicked.
    A card that is face-down is always unclicked and unsolved.
    
    If there was a prettier way for me to draw a finite state machine in text, I would.
    */
    
    // If they click in the margins, we don't handle that.
    // This is a failsafe in case of weirdness.
    if (!eTargetParent.id) {
        return;
    }
    
    // What do we do if they click a card that is solved?
    // Nothing, it remains unclicked and face-up.
    if (Memento.solvedCards.has(eTargetParent.id)) {
        return;
    }
    // What do we do if they click a card that is unsolved?
    else {
        // ...and there are no other face-up unsolved cards?
        // We make it clicked and face-up.
        if (Memento.clickedCards.size === 0) {
            Memento.clickedCards.add(eTargetParent.id);
            toggleFlippedState(eTarget);
        }
        
        // ...and there is a face-up unsolved card?
        else if (Memento.clickedCards.size == 1) {
            // ...and it's the card we clicked?
            // We make it unclicked and face-down.
            if (Memento.clickedCards.has(eTargetParent.id)) {
                Memento.clickedCards.clear();
                toggleFlippedState(eTarget);
            }
            // ...and it's not the card we clicked?
            else {
                const cidA = Memento.clickedCards.values().next().value;
                const cidB = eTargetParent.id;
                const cardA = document.getElementById(cidA).firstChild.querySelector('.card-face');
                const cardB = eTarget.querySelector('.card-face');

                // ...and it matches the card we clicked?
                // We add them to solved and dump them from clicked.
                if (cardA.textContent == cardB.textContent) {
                    toggleFlippedState(eTarget);
                    Memento.solvedCards.add(cidA);
                    Memento.solvedCards.add(cidB);
                    Memento.clickedCards.clear();
                }
                // ...and it doesn't match the other clicked card?
                // We make it clicked and face-up.
                else {
                    Memento.clickedCards.add(eTargetParent.id);
                    toggleFlippedState(eTarget);
                }
                Memento.turnsTaken += 1;
            }
        }
        // ...and there are two face-up unsolved cards?
        else if (Memento.clickedCards.size == 2) {
            // ...and one of them is the card we clicked?
            // We make it unclicked and face-down.
            if (Memento.clickedCards.has(eTargetParent.id)) {
                Memento.clickedCards.delete(eTargetParent.id);
                toggleFlippedState(eTarget);
            }
            // ...and neither of them are the card we clicked?
            // We make the clicked cards unclicked and face-down,
            // then we make the newly clicked card clicked and face-up.
            else {
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
    
    Memento.turnCountZone.textContent = 'Turns taken: ' + Memento.turnsTaken.toString();
    
    // then we check to see if the game is over.
    if (Memento.solvedCards.size === 16) {
        triggerGameWin();
    }
}

function toggleFlippedState (eTarget) {
    /* 
    This worked differently a fistful of edits ago.
    To get this dope fade-in/fade-out effect on click, we toggle the classes
    on the face and back of each card. One should always be is-up and one should
    always be is-down, and the two should never be the same class.
    This is how we simulate the orientation of the card in the abstract.
    When the card is 'flipped', the is-up class gives it opacity: 1 and z-index: 2,
    and the is-down class gives it opacity: 0 and z-index: -1;
    */
    eTarget.querySelector('.card-back').classList.toggle('is-up');
    eTarget.querySelector('.card-back').classList.toggle('is-down');
    eTarget.querySelector('.card-face').classList.toggle('is-up');
    eTarget.querySelector('.card-face').classList.toggle('is-down');
}

function triggerGameWin () {
    clearInterval(Memento.timeLoop);
    calculateRating();
    document.querySelector('.big-card-back').classList.toggle('is-up');
    document.querySelector('.big-card-back').classList.toggle('is-down');
    document.querySelector('.big-card-face').classList.toggle('is-up');
    document.querySelector('.big-card-face').classList.toggle('is-down');
    document.querySelector('.big-card-face').addEventListener('click', restartGame);
}

function calculateRating () {
    const playRating = document.querySelector('.play-rating');
    const litStar = String.fromCodePoint('0x2605');
    const fadedStar = String.fromCodePoint('0x2606');
    
    let rating = '' + litStar;
    let star2;
    let star3;
    if (Memento.turnsTaken > 24) {
        star2 = fadedStar;
        star3 = fadedStar;
    }
    else if (Memento.turnsTaken > 16) {
        star2 = litStar;
        star3 = fadedStar;
    }
    else {
        star2 = litStar;
        star3 = litStar;
    }
    
    rating += star2 + star3;
    playRating.textContent = rating;
}

function restartGame () {
    buildNewGame();
}



/*
Do The Dang Thing
*/

buildTitleCard();





/*
*
*
* Courtesy Spaces
*
*
*/