/**
 * Generic Mongoose pagination utility
 * @param {Mongoose.Model} model - Mongoose model to query
 * @param {Object} query - Mongoose find query
 * @param {Object} options - { page, limit, sort, populate }
 * @returns {Object} { data, page, limit, totalPages, total }
 */

const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const sort = options.sort || { createdAt: -1 };
  const populate = options.populate || "";

  const skip = (page - 1) * limit;

  // total records
  const total = await model.countDocuments(query);

  // total pages
  const totalPages = Math.ceil(total / limit);

  // fetch paginated data
  let dataQuery = model.find(query).sort(sort).skip(skip).limit(limit);
  if (populate) {
    dataQuery = dataQuery.populate(populate);
  }

  const data = await dataQuery.exec();

  return {
    data,
    page,
    limit,
    totalPages,
    total,
  };
};

export default paginate;
