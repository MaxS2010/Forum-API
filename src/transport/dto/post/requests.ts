export interface CreatePostRequest {
	title: string;
	content: string;
	author: string;
	category: string;
}

export interface GetPostsQuery {
	category?: string;
	take?: string;
}

export interface PostParams {
	id: string;
}
