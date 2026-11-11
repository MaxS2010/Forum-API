export interface CreatePostRequest {
	title: string;
	content: string;
	authorId: number;
	categoryId: number;
}

export interface GetPostsQuery {
	category?: string;
	categoryId?: string;
	take?: string;
}

export interface PostParams {
	id: string;
}
