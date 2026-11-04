export const getHealth = (req, res) => {
  res.json({ status: 'ok', message: 'Micro-SACCO backend is running' });
};
