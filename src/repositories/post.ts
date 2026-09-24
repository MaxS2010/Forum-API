import type { CreatePostRequest } from '../transport/dto/post/requests.js';
import type { Post } from '../transport/dto/post/responces.js';

const posts: Post[] = [
  { id: 1, title: 'Welcome to the forum', content: 'Share your ideas and ask questions.', author: 'Admin', category: 'general' },
  { id: 2, title: 'JavaScript tips', content: 'Use small, focused functions to keep code maintainable.', author: 'Alex', category: 'programming' },
];

function getAll(category?: string, take?: number): Post[] {
  const filteredPosts = category ? posts.filter((post) => post.category === category) : posts;
  return take ? filteredPosts.slice(0, take) : filteredPosts;
}

function getById(id: number): Post | undefined {
  return posts.find((post) => post.id === id);
}

function addPost(post: CreatePostRequest): Promise<Post> {
  const newPost: Post = { id: posts.length ? Math.max(...posts.map(({ id }) => id)) + 1 : 1, ...post };
  posts.push(newPost);
  return Promise.resolve(newPost);
}

export { addPost, getAll, getById, posts };
export default { addPost, getAll, getById };