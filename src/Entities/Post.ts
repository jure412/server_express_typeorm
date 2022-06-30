import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { User } from "./User";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinTable({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Like, (like) => like.post, {
    cascade: ["insert", "update", "remove"],
  })
  likes!: Like[];

  @OneToMany(() => Comment, (like) => like.post, {
    cascade: ["insert", "update", "remove"],
  })
  comments!: Comment[];
}
