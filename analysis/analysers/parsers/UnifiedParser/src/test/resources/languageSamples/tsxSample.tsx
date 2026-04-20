/**
 * This is a generated sample file for analysis only
 */

import React, { useState } from "react";

/**
 * Props for the UserCard component
 */
interface UserCardProps {
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  isActive: boolean;
}

/**
 * Displays a card with user information
 */
function UserCard({ name, email, role, isActive }: UserCardProps): JSX.Element {
  // Apply different styles based on role
  const roleColor = role === "admin" ? "red" : role === "user" ? "blue" : "gray";

  return (
    <div className={`user-card ${isActive ? "active" : "inactive"}`}>
      <h2>{name}</h2>
      <p>{email}</p>
      <span style={{ color: roleColor }}>{role}</span>
    </div>
  );
}

/**
 * Props for the UserList component
 */
interface UserListProps {
  users: UserCardProps[];
  filterRole?: "admin" | "user" | "guest";
}

/**
 * Renders a filterable list of user cards
 */
function UserList({ users, filterRole }: UserListProps): JSX.Element {
  const [searchText, setSearchText] = useState("");

  // Filter by role if specified
  const filteredByRole = filterRole ? users.filter((u) => u.role === filterRole) : users;

  // Filter by search text
  const visibleUsers = filteredByRole.filter((u) => {
    if (searchText.length === 0) {
      return true;
    }
    return u.name.toLowerCase().includes(searchText.toLowerCase()) || u.email.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div className="user-list">
      <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search users..." />
      {visibleUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        visibleUsers.map((user) => <UserCard key={user.email} {...user} />)
      )}
    </div>
  );
}

/**
 * Utility to determine access level — intentionally complex for metric coverage
 */
function determineAccessLevel(user: UserCardProps, resource: string): number {
  // Inactive users have no access
  if (!user.isActive) {
    return 0;
  }

  // Admins always have full access
  if (user.role === "admin") {
    return 3;
  }

  if (resource.startsWith("personal-")) {
    /* personal resources only for the user themselves */
    return user.role === "user" ? 2 : 0;
  } else if (resource.startsWith("team-")) {
    if (user.role === "user") {
      return 2;
    } else if (user.role === "guest") {
      return 1;
    }
  } else if (resource === "public") {
    return 1;
  }

  return user.role === "guest" ? 0 : 1;
}

// Example usage
const sampleUsers: UserCardProps[] = [
  { name: "Alice", email: "alice@example.com", role: "admin", isActive: true },
  { name: "Bob", email: "bob@example.com", role: "user", isActive: true },
  { name: "Carol", email: "carol@example.com", role: "guest", isActive: false },
];

console.log(determineAccessLevel(sampleUsers[0], "team-finance"));
console.log(determineAccessLevel(sampleUsers[1], "personal-1"));
console.log(determineAccessLevel(sampleUsers[2], "public"));
