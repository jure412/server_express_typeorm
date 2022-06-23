import { Post } from "../Entities/Post";
import { User } from "../Entities/User";
import { AppDataSource } from "../index";

// get Animal
// "/api/animals",
export const GET_POSTS = async (
  req: {
    query: any;
  },
  res: {
    json: (arg: [any[] | [], number]) => any;
  }
) => {
  const postsRepository = AppDataSource.getRepository(Post);
  const posts = await postsRepository.findAndCount({
    select: {
      created_at: true,
      id: true,
      text: true,
      user: { id: true, firstName: true, lastName: true, email: true },
    },
    relations: {
      user: true,
    },
    skip: req.query.skip,
    take: req.query.take,
    order: {
      created_at: "DESC",
    },
  });

  return res.json([...posts]);
};

// create animal
// "/api/animals/create",
export const CREATE_POST = async (
  req: {
    userId: any;
    body: any;
  },
  res: {
    status: any;
    json: (arg: any) => any;
  }
) => {
  console.log({ req: req.userId });
  const newPost = req.body;
  const user = await AppDataSource.manager.findOneBy(User, {
    id: Number(req.userId),
  });

  if (!user) {
    return res.status(402).send("UNAUTHENTICATED_USER");
  }

  const post = new Post();
  post.text = newPost.text;
  post.user = user;
  await AppDataSource.manager.save(post);
  return res.json(post);
};

export const DELETE_POST = async (
  req: {
    userId: any;
    body: any;
  },
  res: {
    sendStatus(arg0: number);
    status: any;
    json: (arg: any) => any;
  }
) => {
  await AppDataSource.manager.delete(Post, req.body.id);

  return res.sendStatus(204);
};
