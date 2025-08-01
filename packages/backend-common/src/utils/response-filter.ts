// utils/responseFilter.ts

/**
 * Filters the user object to include only safe/public properties.
 *
 * @param {any} user - The complete user object.
 * @returns {object} The filtered user object.
 */
export const filterUserResponse = (user: any): object => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role?.name,
      
      // Add other properties if needed.
    };
  };
  