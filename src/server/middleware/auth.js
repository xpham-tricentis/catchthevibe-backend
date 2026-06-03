// ---------------------------------------------------------------------------
// Auth middleware
// Reads identity from headers injected by the oauth2-proxy sidecar.
//
// Headers:
//   X-Forwarded-Email  → user email — used as ID and display name
//   X-Forwarded-Groups → currently empty (groups claim removed from Entra ID
//                        token to avoid 431 cookie size errors; re-enable once
//                        Redis session storage is in place)
//
// Team is read from GITHUB_TEAM_NAME until groups claim is restored.
//
// In NODE_ENV=development the sidecar is not present — falls back to a dev
// user so local testing works without the full auth stack.
// ---------------------------------------------------------------------------
const auth = (req, res, next) => {
  const email  = req.headers['x-forwarded-email'];
  const groups = req.headers['x-forwarded-groups'];

  if (!email) {
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id:     'dev@tricentis.com',
        name:   'dev@tricentis.com',
        email:  'dev@tricentis.com',
        team:   process.env.GITHUB_TEAM_NAME || 'dev',
        groups: [],
      };
      return next();
    }
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // TODO: derive team from groups claim once Redis session storage is enabled
  // and the groups claim is restored to the Entra ID token.
  const team = process.env.GITHUB_TEAM_NAME || 'dev';

  req.user = {
    id:     email,
    name:   email,
    email,
    team,
    groups: groups ? groups.split(',').filter(Boolean) : [],
  };

  next();
};

export default auth;
