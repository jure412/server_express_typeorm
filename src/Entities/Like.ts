import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: "CASCADE", // <---- HERE
  })
  @JoinTable({ name: "postId" })
  post!: Post;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: "CASCADE", // <---- HERE
  })
  @JoinTable({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
