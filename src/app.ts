import express from 'express';
import postRouter from './transport/routers/post.js';

const HOST: string = 'localhost';
const PORT: number = 8000;

const app = express();

app.use(express.json());
app.use(postRouter);

export default app;

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});