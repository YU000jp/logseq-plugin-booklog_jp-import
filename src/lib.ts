//https://www.dkrk-blog.net/javascript/duplicate_an_array
//タグとカテゴリの指定
export const getIsDuplicate = (arr1, arr2) => [...arr1, ...arr2].filter(itemStr => arr1.includes(itemStr) && arr2.includes(itemStr)).length > 0
