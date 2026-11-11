export interface CreatePostRequest {
	title: string;
	content: string;
	author: string;
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
