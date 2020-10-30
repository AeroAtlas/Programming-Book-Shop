
exports.ifErr = (err) => {
  console.log(err)
  const error = new Error(err);
  error.httpStatusCode = 500;
  return error;
}

