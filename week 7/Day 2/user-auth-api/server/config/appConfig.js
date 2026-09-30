module.exports = {
  port: Number(process.env.PORT || 3000),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
};
