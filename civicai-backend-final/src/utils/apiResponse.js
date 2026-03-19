/**
 * Standardised API response helpers
 */

const success = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const created = (res, data = {}, message = "Created successfully") => {
  return success(res, data, message, 201);
};

const error = (res, message = "Internal server error", statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const paginated = (res, data, total, page, limit, message = "Success") => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext:    pageNum * limitNum < total,
      hasPrev:    pageNum > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { success, created, error, paginated };
