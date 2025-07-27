const songContainer = document.getElementById('song-container');
const searchInput = document.getElementById('search-input');

function getSongs(search) {

    songContainer.innerHTML = '';

    fetch('/getSong', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ song: search })
    })
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            data.forEach(song => {
                songContainer.innerHTML += `
                <div class="flex flex-col text-center text-xl cursor-pointer song">
                    <img src="/music/covers/${song.cover}" alt="cover" class="rounded-md aspect-square overflow-hidden object-cover">
                    <div class="flex flex-row justify-between text-left items-center">
                        <div class="p-2">
                            <h1 class="font-bold title">${song.title.replaceAll('-', ' ')}</h1>
                            <h2 class="text-sm artist">${song.artist.replaceAll('-', ' ')}</h2>
                        </div>
                        <button class="text-blue-500" id="download-Song">
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m6-6l-6 6m-6-6l6 6"/></svg>
                        </button>
                    </div>
                </div>
                `
            })

            const songElements = document.querySelectorAll('.song');
            const songs = document.querySelectorAll('.title');
            const artists = document.querySelectorAll('.artist');
            const downloadButtons = document.querySelectorAll('#download-Song');

            const songInfoTitle = document.getElementById('song-info-title');
            const songInfoArtist = document.getElementById('song-info-artist');
            const songInfoCover = document.getElementById('song-info-cover');


            for (let i = 0; i < songElements.length; i++) {
                songElements[i].addEventListener('click', () => {

                    function playSong(title, artist, cover) {
                        fetch('/playSong', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ title: title, artist: artist })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (window.currentSong && !window.currentSong.paused) {
                                window.currentSong.pause();
                                window.currentSong.currentTime = 0;
                            }
                            window.currentSong = new Audio(data.link);
                            window.currentSong.play();
                            refreshPlayButton();


                            function randomSong() {
                                fetch('/randomSong')
                                .then(response => response.json())
                                .then(data => {
                                    playSong(data.title, data.artist, data.cover);
                                })
                                .catch(error => {
                                    console.error('Error fetching random song:', error);
                                });
                            }

                            window.currentSong.addEventListener('play', refreshPlayButton);
                            window.currentSong.addEventListener('pause', refreshPlayButton);
                            window.currentSong.addEventListener('ended', () => {
                                refreshPlayButton();
                                randomSong();
                            });
                            const skipButton = document.getElementById('skip-button');
                            skipButton.addEventListener('click', () => {
                                randomSong();
                            });

                            songInfoTitle.textContent = title;
                            songInfoArtist.textContent = artist;
                            songInfoCover.src = `/music/covers/${cover}`;
                            
                        });
                        
                    }

                    const coverFilename = songElements[i].querySelector('img').getAttribute('src').split('/').pop();
                    playSong(songs[i].textContent, artists[i].textContent, coverFilename);
                });
            }

            downloadButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const songTitle = btn.parentElement.querySelector('.title').textContent;
                    const songArtist = btn.parentElement.querySelector('.artist').textContent;

                    console.log(songTitle, songArtist);

                    fetch('/downloadSong', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ title: songTitle, artist: songArtist })
                    })
                    .then(response => response.json())
                    .then(data => {
                        const link = data.link;
                        const a = document.createElement('a');
                        a.href = link;
                        a.download = `${songTitle} - ${songArtist}.mp3`;
                        a.click();
                    })
                });
            });

        } else {
            songContainer.innerHTML = `
            <h1 class="text-gray-500">No songs found</h1>
            `
        }
    });
}

document.addEventListener('keydown', e => {
    const active = document.activeElement;
    if (
        e.code === 'Space' &&
        !(active && active.tagName === 'INPUT')
    ) {
        e.preventDefault();
        if (window.currentSong.paused) {
            window.currentSong.play();
        } else {
            window.currentSong.pause();
        }
        refreshPlayButton();
    }
});

searchInput.addEventListener('input', (e) => {
    getSongs(e.target.value.toLowerCase().replaceAll(' ', '-'));
});

if(searchInput.value === '') {
    getSongs('');
}

// Dropdown menu

const dropdownButton = document.getElementById('dropdown-button');
const dropdownMenu = document.getElementById('dropdown-menu');

dropdownButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.add('hidden');
    }
});


// play button control

const playButton = document.getElementById('play-button');

playButton.addEventListener('click', () => {
    if (window.currentSong.paused) {
        window.currentSong.play();
        refreshPlayButton();
    } else {
        window.currentSong.pause();
        refreshPlayButton();
    }
});


function refreshPlayButton() {
    if (!window.currentSong) {
        playButton.innerHTML = `
            <h1>Nothing Playing</h1>
        `;
    } else if (window.currentSong.paused) {
        playButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M6 4v16a1 1 0 0 0 1.524.852l13-8a1 1 0 0 0 0-1.704l-13-8A1 1 0 0 0 6 4"/></svg>
        `;
    } else {
        playButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M9 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m8 0h-2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/></svg>
        `;
    }
}

refreshPlayButton();


const removeMusicButton = document.getElementById('remove-music-button');
const exitButton = document.getElementById('exit-button');
const addMusicButton = document.getElementById('add-music-button');
const exitButtonAdd = document.getElementById('exit-button-add');

removeMusicButton.addEventListener('click', () => {
    const removePopup = document.getElementById('remove-popup');
    removePopup.classList.toggle('hidden');
    dropdownMenu.classList.toggle('hidden');
});

exitButton.addEventListener('click', () => {
    const removePopup = document.getElementById('remove-popup');
    removePopup.classList.toggle('hidden');
});

addMusicButton.addEventListener('click', () => {
    const addPopup = document.getElementById('add-popup');
    addPopup.classList.toggle('hidden');
    dropdownMenu.classList.toggle('hidden');
});

exitButtonAdd.addEventListener('click', () => {
    const addPopup = document.getElementById('add-popup');
    addPopup.classList.toggle('hidden');
});









