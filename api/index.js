const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require('cors')());

app.get('/api', (res) => {
  res.send('Hello World');
});

app.listen(2022, () => {
  console.log('listening on port 2022');
});
