export interface BlogSchema {
  title: string;
  author: Object;
  category: string;
  coverImage: string;
  content: string;
  likes: Number;
  likedBy: string[];
}
