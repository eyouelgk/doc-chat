export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.ADMIN]: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function requireRole(userRole: UserRole, requiredRole: UserRole) {
  if (!hasPermission(userRole, requiredRole)) {
    throw new Error("Insufficient permissions")
  }
}
