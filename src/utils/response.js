
exports.success = (res, data = null, message = 'success') => {
  res.json({ code: 200, success: true, data, message });
};

exports.error = (res, message = 'Server Error', code = 500) => {
  res.status(code).json({ code, success: false, message });
};
