/**
 * permissions 是所有 roles 的 permissions 的合并，要去下重。
 * @param roles
 */
const uniquePermission = (roles) => {
  const arr = [];
  for (const role of roles) {
    role.permissions.forEach((permission) => {
      if (arr.indexOf(permission) === -1) {
        arr.push(permission);
      }
    });
  }
  return arr;
};

export default uniquePermission;
