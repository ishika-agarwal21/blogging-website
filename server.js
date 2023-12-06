const express = require('express');
const ejs = require('ejs');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const saltRounds = 10;

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public/images')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });


let users = [
  { username: 'admin', password: bcrypt.hashSync('adminPassword', saltRounds) }
];

let blogPosts = [
     {
    title: 'NO SLEEP?',
    content: 'Probably try to find a way to sleep. I value sleep so much now, I can’t think of a world without it. In all seriousness, I would have more time to create- art, blog posts just like this, and I think that without being tired, my creativity would soar. Though, a lot of short stories I write (for my eyes only, that may change), are inspired by dreams. I remember a long time ago I had a quick dream with the Beatles. I filled three notebooks with a story. I wish I could find all of them again, just to see how much my writing has improved. But anyways, without sleep, I’d have more time to create and explore.Explore the world, my hometown, somewhere local, the depths of my soul…. I almost said something funny about that, but I think I could settle down and discover quite a bit about myself, and do so consciously, if sleep weren’t necessary. More often than not, I doze off whenever I try to meditate. That’s fine and dandy sometimes. I feel this whole post is just a ramble, so please bear with me.',
    image: 'https://i0.wp.com/jessieshackfitspirit.blog/wp-content/uploads/2023/11/pexels-photo-6940371.jpeg?w=862&ssl=1'
  },
  {
    title: 'CLOTHES!',
    content: 'Sweatshirt and jeans.Or, sweatshirt and yoga pants.That usually means it’s fall, and my favorite season brings chilly weather. I hate being so hot and uncomfortable in summer, and you can only take off so much. In the colder months, I have a lot of layers that I can warm up with and I’d rather put more on than take more off.But I think that’s also my own self loathing for my body. Body dysmorphia, I believe it’s called. I look better when I have more clothes on, in my opinion. But I’m working on liking my body as it is.I’ve always been a modest dresser, probably because that’s how I was raised. I’m all about people dressing as they want, I only wish I felt comfortable in my own body to dress the way I want. Oh well.',
    image: 'https://vishubeautyparlour.com/blog/blogimages/clothes.jpg'
  }
];

app.get('/', (req, res) => {
  res.render('blog', { posts: blogPosts });
});

app.get('/admin', (req, res) => {
    res.render('admin', { posts: blogPosts });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
    res.redirect('/admin');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/add-post', upload.single('image'), (req, res) => {
  const { title, content } = req.body;

  const newPost = {
    title,
    content,
    image: req.file ? `/public/images/${req.file.filename}` : null
  };

  blogPosts.push(newPost);

  res.redirect('/admin');
});

app.post('/update-post/:id', upload.single('image'), (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const updatedPost = {
    title,
    content,
    image: req.file ?`/public/images/${req.file.filename}` :
     null
  };

  blogPosts[postId] = updatedPost;

  res.redirect('/admin');
});


app.get('/delete-post/:id', (req, res) => {
  const postId = req.params.id;

  blogPosts.splice(postId, 1);

  res.redirect('/admin');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
