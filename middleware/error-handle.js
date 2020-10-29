//! Not working as export 
const ifErr = (err) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
}

module.exports = ifErr;