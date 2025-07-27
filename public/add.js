
const submit = document.getElementById('submit');

submit.addEventListener('click', () => {
    let audioFile = document.getElementById('audio').files[0];
    let title = document.getElementById('title').value.replaceAll(' ', '-').trim();
    let artist = document.getElementById('artist').value.replaceAll(' ', '-').trim();
    let coverFile = document.getElementById('cover').files[0];

    
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('cover', coverFile);

    fetch('/addSong', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.log(data);
            const error = document.getElementById('error');
            error.innerHTML = data.error;
            error.classList.remove('hidden');
        }
    })

    document.getElementById('audio').value = '';
    document.getElementById('title').value = '';
    document.getElementById('artist').value = '';
    document.getElementById('cover').value = '';
})