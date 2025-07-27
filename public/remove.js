const removeBtn = document.getElementById('RemoveSong');

removeBtn.addEventListener('click', () => {
    const title = document.getElementById('Rtitle').value.replaceAll(' ', '-').trim();
    const artist = document.getElementById('Rartist').value.replaceAll(' ', '-').trim();

    fetch('/removeSong', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "title": title, "artist": artist })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
})