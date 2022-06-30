import { Comment } from "../Entities/Comment";
import { Post } from "../Entities/Post";
import { User } from "../Entities/User";
import { AppDataSource } from "../index";

export const CREATE_COMMENT = async (
  req: {
    userId: number;
    body: {
      postId: number;
      text: string;
    };
  },
  res: {
    sendStatus: any;
    status: (number: number) => any;
    json: (args) => Post;
  }
) => {
  const { postId, text } = req.body;

  const user = await AppDataSource.manager.findOneBy(User, {
    id: Number(req.userId),
  });

  if (!user) {
    return res.status(401).send("UNAUTHORIZED");
  }

  const post = await AppDataSource.manager.findOneBy(Post, {
    id: Number(postId),
  });

  if (!post) {
    return res.status(401).send("POST_NOT_FOUND");
  }

  const comment = new Comment();

  comment.post = post;
  comment.user = user;
  comment.text = text;

  await AppDataSource.manager.save(comment);
  return res.sendStatus(200);
};

export const GET_COMMENTS = async (
  req: {
    userId: number;
    query: any;
  },
  res: {
    status: any;
    json: (arg: any) => any;
  }
) => {
  const { skip, take, postId } = req.query;

  let comments: any = await AppDataSource.getRepository(Comment)
    .createQueryBuilder("comments")
    .where("comments.postId = :postId", { postId })
    .skip(skip)
    .take(take)
    .orderBy("comments.created_at", "DESC")
    .leftJoinAndSelect("comments.user", "user")
    .getManyAndCount();

  return res.json(comments);
};
