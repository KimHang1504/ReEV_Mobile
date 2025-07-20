export const sortItemsDescending = (items) => {
  // sửa lại biến sortingField
  const sortingField = 'PassingAccuracy'
  return [...items].sort((a, b) => b[sortingField] - a[sortingField])
}
export const sortItemsAscending = (items) => {
  // sửa lại biến sortingField
  const sortingField = 'PassingAccuracy'
  return [...items].sort((a, b) => a[sortingField] - b[sortingField])
}