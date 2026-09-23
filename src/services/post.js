import postRepository from '../repositories/post.js';

const requiredPostFields = ['title', 'content', 'author', 'category'];

function validatePost(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be an object';
  }

  for (const field of requiredPostFields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return `${field} must be a non-empty string`;
    }
  }

  return null;
}

function parseTake(value) {
  if (value === undefined) {
    return undefined;
  }

  if (Number(value) < 1) {
    return null;
  }

  return Number(value);
}

function parseId(value) {
  if (Number(value) < 1) {
    return null;
  }

  return Number(value);
}

function getPosts(category, take) {
  return postRepository.getAll(category, take);
}

function getPostById(id) {
  return postRepository.getById(id);
}

function createPost(post) {
  return postRepository.addPost(post);
}

export {
  createPost,
  getPostById,
  getPosts,
  parseId,
  parseTake,
  validatePost,
};

export default {
  createPost,
  getPostById,
  getPosts,
  parseId,
  parseTake,
  validatePost,
};