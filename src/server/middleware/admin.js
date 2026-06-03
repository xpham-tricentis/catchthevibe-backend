// ---------------------------------------------------------------------------
// Admin middleware
// Checks that the authenticated user belongs to the platform admin group.
// TODO: wire up once groups claim is restored via Redis session storage.
// ---------------------------------------------------------------------------
const ADMIN_GROUP = process.env.ADMIN_GROUP_ID || 'sg-vibe-platform-admins';

const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  if (!req.user.groups.includes(ADMIN_GROUP)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

export default adminOnly;
