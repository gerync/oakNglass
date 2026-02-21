export const ENDPOINTS = {
  BASE_URL: 'https://oak.gerync.com/api',
  AUTH: {
    LOGIN: '/auth/login', //post
    REGISTER: '/auth/register', //post
    LOGOUT: '/auth/logout', //post
    VERIFY: '/auth/verify', //post
    RESET_PASSWORD: '/auth/reset-password', //post
  },
  PRODUCTS: {
    GET_ALL: '/products/', //get
    UPLOAD: '/products/', //post
  },
  PROMOTE: {
    JOURNALIST: '/promote/journalist', //post
    ADMIN: '/promote/admin', //post
  }

};
