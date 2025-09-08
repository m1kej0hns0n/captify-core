var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/types/auth.ts
function isUserAdmin(session) {
  if (!session) return false;
  if (session.isAdmin) return true;
  if (session.user?.isAdmin) return true;
  if (session.groups?.includes("Admins")) return true;
  if (session.user?.groups?.includes("Admins")) return true;
  return false;
}
__name(isUserAdmin, "isUserAdmin");
function getUserGroups(session) {
  if (!session) return [];
  const userGroups = session.user?.groups;
  if (userGroups && userGroups.length > 0) {
    return userGroups;
  }
  const sessionGroups = session.groups;
  if (sessionGroups && sessionGroups.length > 0) {
    return sessionGroups;
  }
  return [];
}
__name(getUserGroups, "getUserGroups");
export {
  getUserGroups,
  isUserAdmin
};
//# sourceMappingURL=types.mjs.map