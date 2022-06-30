import {
  Column,
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
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE", // <---- HERE
  })
  @JoinTable({ name: "postId" })
  post!: Post;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: "CASCADE", // <---- HERE
  })
  @JoinTable({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
