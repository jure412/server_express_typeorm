import { Like } from "../Entities/Like";
import { Post } from "../Entities/Post";
import { User } from "../Entities/User";
import { AppDataSource } from "../index";

export const LIKE = async (
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
  const postId = req.body.postId;

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

  const like = await AppDataSource.getRepository(Like)
    .createQueryBuilder("like")
    .where(`like.postId = :postId`, { postId: post.id })
    .andWhere(`like.userId = :userId`, { userId: user.id })
    .getMany();

  if (like.length === 0) {
    const newLike = new Like();
    newLike.user = user;
    newLike.post = post;
    await AppDataSource.manager.save(newLike);
  } else {
    await AppDataSource.manager.delete(Like, [...like]);
  }
  return res.sendStatus(200);
};
