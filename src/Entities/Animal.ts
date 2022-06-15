import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Unique,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Animal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  animal!: string;

  @ManyToOne(() => User, (user) => user.animals)
  @JoinColumn({ name: "userId" })
  user!: User;
}
