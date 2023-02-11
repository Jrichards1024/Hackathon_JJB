const express = require('express');
const expbs = require('express-handlebars');
const port = 3000;

const app = express();

app.use(express.json());

app.engine('handlebars', expbs.engine({
    defaultLayout: "main"
}));
app.set('view engine', 'handlebars');
app.use(express.static('views'))

//routing
app.get('/', (req, res) => {
    res.render('index');
})

app.listen(port, ()=> {
    console.log(`Example app listening to port: ${port}`)
})
