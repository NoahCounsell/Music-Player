const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if(ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
            cb(null, 'music/covers/')
        } else if (ext === '.mp3' || ext === '.wav') {
            cb(null, 'music/audio/')
        } else {
            cb(new Error('Invalid file type'));
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})

const upload = multer({ storage: storage })


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// note to self: when adding new folders to the workspace add another express.static()
[
  ['/', 'public'],
  ['/music', 'music'],
  ['/interface', 'interface']
].forEach(([route, dir]) => {
  app.use(route, express.static(path.join(__dirname, dir)));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'browse.html'));
});

// add song

app.post('/addSong', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => {

    // error handling
    if (
        !req.files ||
        !req.files['audio'] || req.files['audio'].length === 0 ||
        !req.files['cover'] || req.files['cover'].length === 0
    ) {
        return res.json({ error: 'Audio, cover and title/artist are required' });
    }
    
    const audio = req.files['audio'][0].filename;
    const cover = req.files['cover'][0].filename;
    const title = req.body.title || 'Untitled';
    const artist = req.body.artist || 'Unknown';

    let songs = [];
    songs = JSON.parse(fs.readFileSync('music/index.json', 'utf-8'));


    let exists = false;
    for (let i = 0; i < songs.length; i++) {
        if (songs[i].title.trim().toLowerCase() === title.trim().toLowerCase() && songs[i].artist.trim().toLowerCase() === artist.trim().toLowerCase()) {
            exists = true;
            break;
        }
    }

    if (exists === true) {
        return res.status(409).json({ error: 'A song with the same title and artist already exists.' });
    }

    songs.push({ title, audio, cover, artist });
    fs.writeFileSync('music/index.json', JSON.stringify(songs));
    
    res.status(201).json({ success: 'Song added successfully', title, artist });
});

// remove song

app.post('/removeSong', (req, res) => {
    const title = req.body.title;
    const artist = req.body.artist;
    
    const songs = JSON.parse(fs.readFileSync('music/index.json', 'utf-8'));

    for (let i = 0; i < songs.length; i++) {
        if (songs[i].title.trim().toLowerCase() === title.trim().toLowerCase() && songs[i].artist.trim().toLowerCase() === artist.trim().toLowerCase()) {
            
            fs.unlinkSync(`music/audio/${songs[i].audio}`);
            fs.unlinkSync(`music/covers/${songs[i].cover}`);

            songs.splice(i, 1);
            console.log("removed successfully");
            break;
        }
    }
    
    fs.writeFileSync('music/index.json', JSON.stringify(songs));
    res.json({ success: 'Song removed successfully'});
})

// get song

app.post('/getSong', (req, res) => {
    const songs = req.body.song;


    const allSongs = JSON.parse(fs.readFileSync('music/index.json', 'utf-8'));
    let matchingSongs = [];

    for (let i = 0; i < allSongs.length; i++) {
        if (allSongs[i].title.toLowerCase().includes(songs.toLowerCase()) || allSongs[i].artist.toLowerCase().includes(songs.toLowerCase())) {
            matchingSongs.push(allSongs[i]);
        }
    }

    
    if(matchingSongs.length > 0) {
        console.log(matchingSongs);
        res.json(matchingSongs);
    } else {
        res.json([]);
    }
});



// playing song

app.post('/playSong', (req, res) => {
    const allSongs = JSON.parse(fs.readFileSync('music/index.json', 'utf-8'));
    const songTitle = req.body.title;
    const songArtist = req.body.artist;

    let songLink = '';

    for (let i = 0; i < allSongs.length; i++) {

        const dbTitle = allSongs[i].title.replaceAll('-', ' ');
        const dbArtist = allSongs[i].artist.replaceAll('-', ' ');
        
        if (dbTitle === songTitle && dbArtist === songArtist) {
            songLink = `music/audio/${allSongs[i].audio}`;
            break;
        }
    }

    res.json({ link: `/stream?song=${encodeURIComponent(songLink)}` });
})

// streaming song 

app.get('/stream', (req, res) => {
    const filePath = req.query.song;
    res.set('Content-Type', 'audio/mpeg');
    fs.createReadStream(filePath).pipe(res);
});

// download song

app.post('/downloadSong', (req, res) => {
    const title = req.body.title;
    const artist = req.body.artist;

    const songs = JSON.parse(fs.readFileSync('music/index.json', 'utf-8'));
    for (let i = 0; i < songs.length; i++) {

        const dbTitle = songs[i].title.replaceAll('-', ' ');
        const dbArtist = songs[i].artist.replaceAll('-', ' ');
        
        if (dbTitle === title && dbArtist === artist) {
            songLink = `music/audio/${songs[i].audio}`;
            break;
        }
    }

    res.json({ link: `/stream?song=${encodeURIComponent(songLink)}` });

})

// get random song

app.get('/randomSong', (req, res) => {
    const songs = JSON.parse(fs.readFileSync('music/index.json', 'utf-8'));
    const randomSong = songs[Math.floor(Math.random() * songs.length)];    
    res.json({ 
        title: randomSong.title.replaceAll('-', ' '),   
        artist: randomSong.artist.replaceAll('-', ' '),
        cover: randomSong.cover
    });
})



// no code after this line

app.listen(3000, () => {
    console.log('Server running: http://localhost:3000');
});