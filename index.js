const express = require('express');
const port = 3000;
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({test: 'ok'});
})

app.listen(port, ()=> {
    console.log(`Example app listening to port: ${port}`)
})
