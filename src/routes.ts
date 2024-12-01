import { UserRole } from "@prisma/client"

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
    "/auth/verify",
    "/auth/forgot-password",
    "/auth/reset",
]

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/superadmin/login",
]

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"

/**
 * Default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/ansatt"

/**
 * Get redirect path based on user role
 */
export const getRedirectPath = (role: string) => {
    switch (role) {
        case "SUPERADMIN":
            return "/superadmin"
        case "ADMIN":
            return "/admin"
        case "LEDER":
            return "/leder"
        case "PROSJEKTLEDER":
            return "/prosjektleder"
        case "USER":
            return "/ansatt"
        default:
            return "/ansatt"
    }
}

/**
 * Rollebaserte ruter
 * @type {Object}
 */
export const roleRoutes = {
    SUPERADMIN: ["/superadmin"],
    ADMIN: ["/admin", "/ansatte", "/prosjekter"],
    LEDER: ["/leder", "/ansatte", "/prosjekter"],
    PROSJEKTLEDER: ["/prosjektleder", "/prosjekter"],
    USER: ["/ansatt"]
}

/**
 * Sjekk om en bruker har tilgang til en rute basert på deres rolle
 * @param {string} role - Brukerrolle
 * @param {string} path - Rutenett
 * @returns {boolean} - True hvis bruker har tilgang, false ellers
 */
export const hasAccess = (role: string, path: string) => {
    const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes] || []
    return allowedRoutes.some(route => path.startsWith(route))
}
