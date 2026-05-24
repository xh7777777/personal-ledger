export function jsonError(c, message, status = 400) {
  return c.json({ error: message }, status);
}
