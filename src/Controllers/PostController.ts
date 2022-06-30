import { Post } from "../Entities/Post";
import { User } from "../Entities/User";
import { AppDataSource } from "../index";

// get Animal
// "/api/animals",
export const GET_POSTS = async (
  req: {
    userId: number;
    query: any;
  },
  res: {
    status: any;
    json: (arg: any) => any;
  }
) => {
  const { skip, take } = req.query;
  let user;

  if (req.query.userId !== "undefined") {
    user = await AppDataSource.manager.findOneBy(User, {
      id: Number(req.query.userId),
    });
  }

  if (user === "undefined" && req.query.userId) {
    return res.status(401).send("USER_NOT_FOUND");
  }

  let posts: any = AppDataSource.getRepository(Post)
    .createQueryBuilder("posts")
    .skip(skip)
    .take(take)
    .orderBy("posts.created_at", "DESC")
    .leftJoinAndSelect("posts.likes", "like", `like.userId = ${req.userId}`);
  if (user) {
    await posts.andWhere("posts.userId = :userId", {
      userId: req.query.userId,
    });
  }

  posts = await posts
    .leftJoinAndSelect("posts.user", "user")
    .loadRelationCountAndMap("posts.likeCount", "posts.likes")
    .loadRelationCountAndMap("posts.commentCount", "posts.comments")
    .getManyAndCount();

  const cleanedPosts = posts[0].map((post) => {
    const { likes, ...freshPost } = post;
    return {
      ...freshPost,
      isLikedByMe: post.likes.length > 0,
    };
  });

  return res.json([cleanedPosts, posts[1]]);
};

// create animal
// "/api/animals/create",
export const CREATE_POST = async (
  req: {
    userId: number;
    body: {
      text: string;
    };
  },
  res: {
    status: (number: number) => any;
    json: (args) => Post;
  }
) => {
  const newPost = req.body;
  const user = await AppDataSource.manager.findOneBy(User, {
    id: Number(req.userId),
  });

  if (!user) {
    return res.status(401).send("UNAUTHORIZED");
  }

  const post = new Post();
  post.text = newPost.text;
  post.user = user;
  await AppDataSource.manager.save(post);
  return res.json(post);
};

export const DELETE_POST = async (
  req: {
    body: {
      id: number;
    };
  },
  res: {
    sendStatus(arg0: number);
  }
) => {
  await AppDataSource.manager.delete(Post, req.body.id);

  return res.sendStatus(200);
};
