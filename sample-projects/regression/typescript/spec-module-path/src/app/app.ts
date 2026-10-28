import { UserService } from './user.service'

export class App {
  constructor(readonly users: UserService) {}
}
