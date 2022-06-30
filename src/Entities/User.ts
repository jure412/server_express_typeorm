import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { Post } from "./Post";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @OneToMany(() => Post, (post) => post.user, {
    cascade: ["insert", "update", "remove"],
  })
  posts: Post[];

  @Column({ default: null, select: false })
  refreshToken: string | null;

  @OneToMany(() => Like, (like) => like.user, {
    cascade: ["insert", "update", "remove"],
  })
  likes!: Like[];

  @OneToMany(() => Comment, (like) => like.user, {
    cascade: ["insert", "update", "remove"],
  })
  comments!: Comment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
