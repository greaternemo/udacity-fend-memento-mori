// Memento.js
// Maybe we can get it all in one file?
// This is the guts of our memory game.

let Memento = {
    pageBody: null,

    pageHeader: null,

    turnCountZone: null,
    turnsTaken: null,
    tookTurn: null,

    timeElapsedZone: null,
    startTime: null,
    lastTime: null,
    timeLoop: null,

    liveRatingZone: null,
    gameRating: null,

    pageMain: null,
    mainDeck: null,
    // The arrays in clickedCards and solvedCards should ONLY contain
    // the ids of cards as strings, from 'card00' to 'card15'.
    clickedCards: null,
    solvedCards: null,
    firstGame: true,

};

const litStar = String.fromCodePoint('0x2605');
const fadedStar = String.fromCodePoint('0x2606');

// These are just some singleton values for reference
const Ratings = {
    oneStar: '' + litStar + fadedStar + fadedStar,
    twoStar: '' + litStar + litStar + fadedStar,
    threeStar: '' + litStar + litStar + litStar,
};



/*
Utility functions
*/

// This function formats a number as a 2-digit string.
function formatNum(aNum) {
    let formatted;
    if (aNum < 10) {
        formatted = '' + '0';
        formatted += aNum.toString();
    } else {
        formatted = aNum.toString();
    }
    return formatted;
}



/*
Build The Page Framework
*/

// This just lets us separate our buildPageBody from everything else so we only ever
// run that function once per page load.
function initialBuild() {
    buildPageBody();
    return buildTitleCard();
}

// This function builds the contents of the page body.
function buildPageBody() {
    const pageBody = document.querySelector('body');
    const bodyParts = document.createDocumentFragment();

    bodyParts.appendChild(buildFirstHeader());
    bodyParts.appendChild(buildFirstMain());

    pageBody.appendChild(bodyParts);
}

// This function builds the header, which gets reused in every subsequent iteration.
function buildFirstHeader() {
    const newHeader = document.createElement('header');

    const gameInfo = document.createElement('div');
    gameInfo.id = 'game-info';

    const turnCount = document.createElement('h3');
    turnCount.classList.add('turn-count');
    const timeElapsed = document.createElement('h3');
    timeElapsed.classList.add('time-elapsed');
    const liveRating = document.createElement('h3');
    liveRating.classList.add('live-rating');

    gameInfo.appendChild(turnCount);
    gameInfo.appendChild(timeElapsed);
    gameInfo.appendChild(liveRating);

    newHeader.appendChild(gameInfo);

    return newHeader;
}

// This function builds the main, which gets reused in every subsequent iteration.
function buildFirstMain() {
    // I think this is really it here. Hm.
    const newMain = document.createElement('main');
    return newMain;
}



/*
Build The First Game
*/

// This function assigns some references in Memento that shouldn't need
// to be reassigned unless we do a full reset to title card.
function buildMementoAssignments() {
    Memento.pageBody = document.querySelector('body');
    Memento.pageHeader = document.querySelector('header');
    Memento.turnCountZone = document.querySelector('.turn-count');
    Memento.timeElapsedZone = document.querySelector('.time-elapsed');
    Memento.liveRatingZone = document.querySelector('.live-rating');
    Memento.pageMain = document.querySelector('main');
}

// This function builds the title card, the first thing you see when you load the page
function buildTitleCard() {
    buildMementoAssignments();

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



/*
Build Every Game Beyond The First
*/

// This function builds the whole new game and then draws it.
function buildNewGame() {
    // We don't have to do much right here anymore because a lot of the do-overs
    // are handled further down.
    Memento.turnsTaken = 0;
    Memento.tookTurn = false;
    Memento.lastTime = '00:00';
    Memento.gameRating = Ratings.threeStar;

    // We use sets here because they're much easier to use than arrays for things like
    // testing inclusion and guaranteeing exclusivity of the values we push inside.
    Memento.clickedCards = new Set();
    Memento.solvedCards = new Set();

    return drawTheGame(buildTheGame());
}

// This function builds the game data.
function buildTheGame() {
    buildGameInfo();
    return buildBigCard();
}

// This function builds the info in the header.
function buildGameInfo() {
    redrawTurnsTaken();
    redrawTimeElapsed();
    redrawLiveRating();

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

// This function calculates the number of turns taken this game and triggers
// a redraw if a turn has been taken.
function calculateTurnsTaken() {
    if (Memento.tookTurn) {
        Memento.turnsTaken += 1;
        Memento.tookTurn = false;
        redrawTurnsTaken();
    }
}

// This function redraws the turns-taken count.
function redrawTurnsTaken() {
    Memento.turnCountZone.textContent = 'Turns taken: ' + Memento.turnsTaken.toString();
}

// This function calculates how much time has elapsed since the game started.
function calculateTimeElapsed() {
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

// This function redraws the elapsed time.
function redrawTimeElapsed() {
    Memento.timeElapsedZone.textContent = `Time elapsed: ${Memento.lastTime}`;
}

// This function calculates your current rating as you play and redraws it
// if necessary.
function calculateLiveRating() {
    /* 
    This is based off of some research I did.
    For a number of pairs N:
    The lower limit for turns taken to solve all pairs is N turns. This is if
    you flip a match every turn.
    The functional limit for turns taken to solve all pairs is 2N turns. This
    is based on the idea that if you start the game by flipping every card,
    then with a perfect memory, it should take you the same number of turns
    to reveal each pair.
    */
    let rating = null;
    if (Memento.turnsTaken > 24) {
        // 1 star is if you take more than 3N turns.
        rating = Ratings.oneStar;
    } else if (Memento.turnsTaken > 16) {
        // 2 stars is if you take more than 2N but less than 3N turns.
        rating = Ratings.twoStar;
    } else {
        // 3 stars is if you take no more than 2N turns.
        rating = Ratings.threeStar;
    }

    if (rating != Memento.gameRating) {
        Memento.gameRating = rating;
        redrawLiveRating();
    }
}

// This function redraws the live rating as you play.
function redrawLiveRating() {
    Memento.liveRatingZone.textContent = `Current rating: ${Memento.gameRating}`;
}

// This function builds the whole big card.
function buildBigCard() {
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

// This function builds the back of the big card, which contains the game board.
// The game functionally takes place on the back of a big card.
function buildBigCardBack() {
    const bigBack = buildGameBoard();
    bigBack.classList.add('big-card-back');
    bigBack.classList.add('game-board');
    bigBack.classList.add('is-up')

    return bigBack;
}

// This function builds the game board, our visible 4x4 grid.
function buildGameBoard() {
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

// This function builds a new deck of cards. 
// The deck contains 16 cards, 8 pairs of matching emojis.
function buildNewDeck() {
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

// This function builds a row of cards in our 4x4 grid.
function buildCardRow(total, aRow) {
    let cnt = 0;
    while (cnt < 4) {
        aRow.appendChild(buildGameCard((total * 4) + cnt));
        cnt += 1;
    }
    return aRow;
}

// This function builds a single card.
// A single card is a 'card-container', which has a child 'card',
// which has the children 'card-back' and 'card-face'.
function buildGameCard(cNum) {
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

// This function builds the face of the big card.
// The big card face contains the 'You win!' message and final rating.
function buildBigCardFace() {
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

// This function draws the game.
// It crams all of the page elements we've created into the document.
function drawTheGame(bigCardZone) {
    if (!Memento.firstGame) {
        // If this isn't the first game, dump all the existing content.
        while (Memento.pageMain.hasChildNodes() === true) {
            Memento.pageMain.removeChild(Memento.pageMain.firstChild);
        }
        removeResetButton();
    } else {
        // After we build all the game content, we fade out the title card.
        const titleCard = document.querySelector('.title-card');
        titleCard.classList.toggle('title-card-visible');
        titleCard.classList.toggle('title-card-hidden');

        // Then we wait a second. Literally, 1000 ms.
        // Then we dump it, just blammo. We don't need it after this.
        setTimeout(function() {
            Memento.pageMain.removeChild(document.querySelector('.title-card'));
            Memento.firstGame = false;
        }, 1000);
        // This works so well, I almost feel like I MUST BE doing something wrong.
    }

    Memento.pageMain.appendChild(bigCardZone);

    return addResetButton();
}



/*
Handling player interaction during the game
*/

// This function handles our card flips on click.
function handleCardFlip(cardEvent) {
    const eTarget = cardEvent.target.parentNode;
    const eTargetParent = eTarget.parentNode;

    // If they click in the margins, we don't handle that.
    // This is a failsafe in case of weirdness.
    if (!eTargetParent.id) {
        return;
    }

    const parentId = eTargetParent.id;

    // What do we do if they click a card that is solved?
    if (Memento.solvedCards.has(parentId)) {
        // Nothing, it remains unclicked and face-up.
        return;
    }
    // What do we do if they click a card that is unsolved?
    else {
        // ...and there are no other face-up unsolved cards?
        if (Memento.clickedCards.size === 0) {
            handleClickWithZeroClickedCards(eTarget, parentId);
        }
        // ...and there is a face-up unsolved card?
        else if (Memento.clickedCards.size == 1) {
            handleClickWithOneClickedCard(eTarget, parentId);
        }
        // ...and there are two face-up unsolved cards?
        else if (Memento.clickedCards.size == 2) {
            handleClickWithTwoClickedCards(eTarget, parentId);
        }
    }
    return finalizeCardFlip();
}

// This function handles a click with 0 clicked, face-up cards.
function handleClickWithZeroClickedCards(eTarget, parentId) {
    // We make it clicked and face-up.
    Memento.clickedCards.add(parentId);
    toggleFlippedState(eTarget);
}

// This function handles a click with 1 clicked, face-up card.
function handleClickWithOneClickedCard(eTarget, parentId) {
    // ...and it's the card we clicked?
    if (Memento.clickedCards.has(parentId)) {
        // We make it unclicked and face-down.
        Memento.clickedCards.clear();
        toggleFlippedState(eTarget);
    }
    // ...and it's not the card we clicked?
    else {
        const cidA = Memento.clickedCards.values().next().value;
        const cidB = parentId;
        const cardA = document.getElementById(cidA).firstChild.querySelector('.card-face');
        const cardB = eTarget.querySelector('.card-face');

        // ...and it matches the card we clicked?
        if (cardA.textContent == cardB.textContent) {
            // We add them to solved and dump them from clicked.
            toggleFlippedState(eTarget);
            Memento.solvedCards.add(cidA);
            Memento.solvedCards.add(cidB);
            Memento.clickedCards.clear();
        }
        // ...and it doesn't match the other clicked card?
        else {
            // We make it clicked and face-up.
            Memento.clickedCards.add(parentId);
            toggleFlippedState(eTarget);
        }
        Memento.tookTurn = true;
    }
}

// This function handles a click with 2 clicked, face-up cards.
function handleClickWithTwoClickedCards(eTarget, parentId) {
    // ...and one of them is the card we clicked?
    if (Memento.clickedCards.has(parentId)) {
        // We make it unclicked and face-down.
        Memento.clickedCards.delete(parentId);
        toggleFlippedState(eTarget);
    }
    // ...and neither of them are the card we clicked?
    else {
        // We make the clicked cards unclicked and face-down,
        // then we make the newly clicked card clicked and face-up.
        let cValues = Memento.clickedCards.values()
        const cidA = cValues.next().value;
        const cidB = cValues.next().value;
        const cardA = document.getElementById(cidA).firstChild;
        const cardB = document.getElementById(cidB).firstChild;
        toggleFlippedState(cardA);
        toggleFlippedState(cardB);
        Memento.clickedCards.clear();
        Memento.clickedCards.add(parentId);
        toggleFlippedState(eTarget);
    }
}

// This function cleans up after handling our card flip.
function finalizeCardFlip() {
    calculateTurnsTaken();
    calculateTimeElapsed();
    calculateLiveRating();

    // We finish by checking to see if the game is over.
    if (Memento.solvedCards.size === 16) {
        triggerGameWin();
    }
}

// This function toggles the flipped state of a card.
function toggleFlippedState(eTarget) {
    /* 
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

// This function triggers a game win.
// We clear the timer interval, calculate the final rating, and fade in the big-card-face.
function triggerGameWin() {
    clearInterval(Memento.timeLoop);
    calculatePlayRating();
    document.querySelector('.big-card-back').classList.toggle('is-up');
    document.querySelector('.big-card-back').classList.toggle('is-down');
    document.querySelector('.big-card-face').classList.toggle('is-up');
    document.querySelector('.big-card-face').classList.toggle('is-down');
    document.querySelector('.big-card-face').addEventListener('click', restartGame);
}

// This function calculates your star rating.
function calculatePlayRating() {
    const playRating = document.querySelector('.play-rating');
    playRating.textContent = Memento.gameRating;
}

// This function restarts the game.
function restartGame() {
    buildNewGame();
}



/*
Do The Dang Thing
*/

initialBuild();




/*
Add This Reset Button That Defies The Reason Why Reset Functions Are Used In Games
*/

// This function adds this ridiculous reset button that was intentionally omitted from the
// original submission because you don't give the player the option to reset in the middle of
// a game that doesn't have a loss condition, you give them the option to reset the game after
// it reaches a state they can't continue from. :|
function addResetButton() {
    const pageFooter = document.createElement('footer');

    const resetButton = document.createElement('h3');
    resetButton.classList.add('reset-button');
    resetButton.textContent = "CLICK TO RESET THE GAME";
    resetButton.addEventListener('click', restartEverything);

    const theWholePage = document.querySelector('html');

    pageFooter.appendChild(resetButton);
    theWholePage.appendChild(pageFooter);

}

// This function removes the reset button when we do a full reset so that
// it doesn't display with the title card.
function removeResetButton() {
    // Get rid of those dang buttons
    document.querySelector('footer').remove();
}

// This function resets things to the same state they're in when you first
// load the page.
function restartEverything() {
    if (Memento.timeLoop) {
        clearInterval(Memento.timeLoop);
    }

    // just straight yoinking a bunch of this to down here
    while (Memento.pageMain.hasChildNodes() === true) {
        Memento.pageMain.removeChild(Memento.pageMain.firstChild);
    }

    Memento = {
        pageBody: null,

        pageHeader: null,

        turnCountZone: null,
        turnsTaken: null,
        lastTurn: null,
        tookTurn: null,

        timeElapsedZone: null,
        startTime: null,
        lastTime: null,
        timeLoop: null,

        liveRatingZone: null,
        gameRating: null,

        pageMain: null,
        mainDeck: null,
        // The arrays in clickedCards and solvedCards should ONLY contain
        // the ids of cards as strings, from 'card00' to 'card15'.
        clickedCards: null,
        solvedCards: null,
        firstGame: true,
    };

    removeResetButton();
    return buildTitleCard();
}



/*
 *
 *
 * Courtesy Spaces
 *
 *
 */