import { Animal } from "../Entities/Animal";
import { User } from "../Entities/User";
import { AppDataSource } from "../../src/index";

// get Animal
// "/api/animals",
export const GET_ANIMALS = async (
  req: {
    userId: any;
  },
  res: { json: (arg: [Animal[], number]) => any }
) => {
  const animal = await AppDataSource.manager.findAndCount(Animal);
  return res.json(animal);
};

// create animal
// "/api/animals/create",
export const CREATE_ANIMAL = async (
  req: {
    userId: any;
    body: any;
  },
  res: { json: (arg: any) => any }
) => {
  const { userId } = req.userId;

  console.log("here");
  if (!userId) return new Error("INVALID_ACCESS");
  console.log("here");
  const animals = req.body;
  const user = await AppDataSource.manager.findOneBy(User, {
    id: Number(1),
  });
  const createdAnimals: any[] = [];

  for (let i = 0; i < animals.length; i++) {
    const ani = new Animal();
    const animal = animals[i];
    ani.animal = animal.animal;
    createdAnimals.push(ani);
    await AppDataSource.manager.save(ani);
  }

  user.animals = createdAnimals;
  await AppDataSource.manager.save(user);

  return res.json(user);
};
