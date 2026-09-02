// Central place to reason about what each role can do.
export const ROLES = ["admin", "manager", "user"];

export function canManageProducts(role) {
  return role === "admin" || role === "manager";
}

export function canManageOrders(role) {
  return role === "admin" || role === "manager";
}

export function canManageUsers(role) {
  return role === "admin"; // only admin can change roles / delete users
}
