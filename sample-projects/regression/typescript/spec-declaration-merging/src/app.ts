import { User } from './user'

export function greet(user: User): string {
  return user.name
}
