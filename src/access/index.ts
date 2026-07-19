import type { Access, FieldAccess } from 'payload'

type UserLike = { role?: 'admin' | 'employee' } | null | undefined

export const isAdmin: Access = ({ req: { user } }) => (user as UserLike)?.role === 'admin'

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  (user as UserLike)?.role === 'admin'

export const isAdminOrEmployee: Access = ({ req: { user } }) => {
  const role = (user as UserLike)?.role
  return role === 'admin' || role === 'employee'
}

export const anyone: Access = () => true

export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)
