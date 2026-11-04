import { roleHasPermission } from '../config/roles.js';

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.passwordChangeRequired) {
      return res.status(403).json({ message: 'Change your temporary password before continuing' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

export function authorizePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.passwordChangeRequired) {
      return res.status(403).json({ message: 'Change your temporary password before continuing' });
    }

    if (!roleHasPermission(req.user.role, permission, req.user.permissionOverrides)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    return next();
  };
}
