export interface Post {
	id: number;
	title: string;
	content: string;
	author: string;
	category: string;
}

export type CreatePostInput = Omit<Post, 'id'>;