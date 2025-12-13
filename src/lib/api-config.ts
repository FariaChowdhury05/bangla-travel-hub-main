// API Configuration
// Make sure your project folder is in C:\xampp\htdocs\bangla-travel-hub-main
// Or update the path below to match your XAMPP folder structure
export const API_BASE_URL = 'http://localhost/bangla-travel-hub-main/api';

export const API_ENDPOINTS = {
  REVIEWS_GET: `${API_BASE_URL}/reviews.php`,
  REVIEWS_POST: `${API_BASE_URL}/reviews.php`,
  AUTH_SIGNUP: `${API_BASE_URL}/auth/signup.php`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login.php`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout.php`,
  AUTH_CHECK: `${API_BASE_URL}/auth/check-auth.php`,
  DESTINATIONS_GET: `${API_BASE_URL}/destinations.php`,
  DESTINATIONS_POST: `${API_BASE_URL}/destinations.php`,
  DESTINATIONS_DELETE: `${API_BASE_URL}/destinations.php`,
  HOTELS_GET: `${API_BASE_URL}/hotels.php`,
  HOTELS_POST: `${API_BASE_URL}/hotels.php`,
  HOTELS_DELETE: `${API_BASE_URL}/hotels.php`,
  ROOMS_GET: `${API_BASE_URL}/rooms.php`,
  ROOMS_POST: `${API_BASE_URL}/rooms.php`,
  ROOMS_DELETE: `${API_BASE_URL}/rooms.php`,
  BOOKINGS_GET: `${API_BASE_URL}/bookings.php`,
  BOOKINGS_POST: `${API_BASE_URL}/bookings.php`,
  BOOKINGS_PATCH: `${API_BASE_URL}/bookings.php`,
};

export const TOUR_OPTIONS = [
  "Cox's Bazar Beach Paradise",
  "Sylhet Tea Garden Tour",
  "Bandarban Hill Adventure",
  "Sundarbans Mangrove Safari",
  "Chittagong City Tour",
  "Dhaka Heritage Tour",
  "Khagrachari Tribal Trek",
  "Naf River Adventure",
  "Other"
];
