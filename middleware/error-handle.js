//! Not working as export 
exports.ifErr = (err) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return error;
}

