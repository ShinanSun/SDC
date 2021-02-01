// module.exports = {
//   randomInteger: function () {
//     return Math.floor(Math.random() * 10000 + 1);
//   },
// };

function generateRandomNum(userContext, events, done) {
  const num = Math.floor(Math.random() * 100000 + 1);
  userContext.vars.num = num;
  return done();
}
module.exports = { generateRandomNum };
