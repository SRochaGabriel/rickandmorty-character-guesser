// defining variables
const imgContainer = document.querySelector('#image-container');
const guess = document.querySelector('#character-name');
const formBtn = document.querySelector('form button');
const charactersList = document.querySelector('#characters');
const resultArea = document.querySelector('#result-area');
const url_api = 'https://rickandmortyapi.com/api/character';
let characters = [];
let guesses = 0; // counting how many times the user guesses
let rightChar; // character to be guessed
let charEpisodes = []; // episodes in which he appeared

// disabling button, input and fetching the characters from the api
formBtn.disabled = true;
guess.disabled = true;
getCharacters();

// event listener for the submit of the form
document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();

    guesses++;

    // disable buttons and reset the input value
    formBtn.disabled = true;
    guess.disabled = true;

    // show the result area and 'checking' message
    resultArea.classList.add('show');
    resultArea.innerHTML = `<h2>Checking...</h2>`;

    // takes 1 second to show the user the result of his guess
    setTimeout(() => {
        // if the user is correct
        if (guess.value.toLowerCase() === rightChar.name.toLowerCase()) {
            guess.value = ''; // reseting input value
            showAnswer(true);
        } else { // if wrong
            // enable buttons, clear input and bring back focus
            formBtn.disabled = false;
            guess.disabled = false;
            guess.value = '';
            guess.focus();

            // wrong answer message with quit button
            resultArea.innerHTML = `
            <h2 class="incorrect">Your guess is incorrect. Don't be a quitter, keep trying!</h2>
            <button onclick="showAnswer(false)">I give up...</button>
            `;
        }
    }, 500);
});

// function for when the user guesses correctly or gives up
function showAnswer(rightGuess) {
    // checking if the user made a right guess or if he gave up
    if (rightGuess) {
        resultArea.innerHTML = `
            <h2 class="correct">Your guess is correct!</h2>
            <p>It took you ${guesses} guesses to get it right.</p>
        `;
    } else {
        formBtn.disabled = true;
        guess.disabled = true;
        resultArea.innerHTML = '<h2>Here is the answer!</h2>';
    }

    // show the character info and a retry button
    resultArea.innerHTML += `
    <p>Character's information:</p>
    <ul>
        <li><span>Name</span>: ${rightChar.name}</li>
        <li><span>Species</span>: ${rightChar.species}</li>
        <li><span>Origin</span>: ${rightChar.origin.name}</li>
        <li><span>Location</span>: ${rightChar.location.name}</li>
        <li><span>Showed up in</span>:</li>
        <li id="episodes"></li>
    </ul>
    
    <button id="retry" onclick="getRandomCharacter()">Try other characters</button>
    `;
    
    // show the episodes in the #episodes list item
    getEpisodes(rightChar.episode);
}

// fetching all characters for the datalist and to get the random character to be guessed
async function getCharacters() {
    imgContainer.innerHTML = '<h2>Loading...<h2>';

    if (localStorage.getItem('charactersCache')) {
        characters = JSON.parse(localStorage.getItem('charactersCache'));
    } else {
        await fetchFromAPI(url_api);
    }

    if (charactersList.innerHTML === '') {
        characters.forEach(character => {
            charactersList.innerHTML += `<option value="${character.name}"></option>`;
        });
    }
    
    getRandomCharacter();
}

async function fetchFromAPI(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        characters.push(...data.results);
        
        if (data.info.next) {
            await fetchFromAPI(data.info.next);
        } else {
            localStorage.setItem('charactersCache', JSON.stringify(characters));
        }
    } catch (err) {
        alert('Sorry! An error ocurred.');
    }
}

// getting random character to be guessed
function getRandomCharacter() {
    // generating a random id to select in the characters array between 1 and 826 (there are 826 characters in the api)
    const randomIndex = Math.floor(Math.random() * 826);

    // Reset
    guesses = 0;
    resultArea.classList.remove('show');
    resultArea.innerHTML = '';
    charEpisodes = [];

    
    // defining this character as the right character, loading his image and allowing the user to guess
    rightChar = characters[randomIndex];
    imgContainer.innerHTML = `<img src="${rightChar.image}" alt="Character image"/>`;

    // enable buttons
    guess.disabled = false;
    formBtn.disabled = false;
    
    // focus to input
    guess.focus();
}

// fetching the episodes in which the character to be guessed appeared
function getEpisodes(eps) {
    // fetching each episode
    for(i in eps) {
        fetch(eps[i])
        .then(res => res.json())
        .then(data => {
            try{ // in case data is an array
                data.forEach(element => {
                    document.querySelector('#episodes').innerHTML += `
                    <ul>
                        <li><span>Episode</span>: ${element.episode}</li>
                        <li><span>Title</span>: ${element.name}</li>
                        <li><span>Aired</span>: ${element.air_date}</li>
                    </ul>
                    `
                });
            } catch { // in case data is not an array
                document.querySelector('#episodes').innerHTML += `
                    <ul>
                        <li><span>Episode</span>: ${data.episode}</li>
                        <li><span>Title</span>: ${data.name}</li>
                        <li><span>Aired</span>: ${data.air_date}</li>
                    </ul>
                    `
            }
        })
    }
}