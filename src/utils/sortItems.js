export const sortItemsDescending = (items) => {
  // sửa lại biến sortingField
  const sortingField = 'cost'
  return [...items].sort((a, b) => b[sortingField] - a[sortingField])
}
