const { getUnSelectData, getSelectData } = require('../../utils')

const findAllDiscountCodes = async ({
  limit = 50,
  page = 1,
  sort = 'ctime',
  filter,
  select,
  unSelect,
  model
}) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }

  // Xác định cách chọn trường dữ liệu
  let projection
  if (unSelect) {
    projection = getUnSelectData(unSelect)
  } else if (select) {
    projection = getSelectData(select)
  }

  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(projection)
    .lean()

  return documents
}

const checkDiscountExists = async ({ model, filter, lean = true }) => {
  return await model.findOne(filter).lean(lean)
}

module.exports = {
  findAllDiscountCodes,
  checkDiscountExists
}
