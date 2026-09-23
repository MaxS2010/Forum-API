import express from 'express';
import postRouter from './routers/post.js';

const HOST = "localhost"
const PORT = 8000

const app = express();

app.use(express.json());
app.use(postRouter);

export default app;


app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`)
})