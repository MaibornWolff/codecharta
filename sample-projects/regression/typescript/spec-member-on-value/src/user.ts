export function city(user: { Address(): string }): string {
  return user.Address()
}
