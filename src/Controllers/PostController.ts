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
    json: (arg: [Post[], number]) => any;
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
