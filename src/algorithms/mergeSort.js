export function mergeSorted(left, right, compare) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    // Em caso de empate, mantém primeiro o elemento da esquerda.
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}


    // negativo: a vem antes de b;
    // zero: equivalentes;
    // positivo: a vem depois de b.
 
export function mergeSort(items, compare) {
  if (!Array.isArray(items)) {
    throw new TypeError("items deve ser um array.");
  }

  if (typeof compare !== "function") {
    throw new TypeError("compare deve ser uma função.");
  }

  return sortRecursive(items, compare);
}

function sortRecursive(items, compare) {
  if (items.length <= 1) {
    return items.slice();
  }

  const middle = Math.floor(items.length / 2);

  const left = sortRecursive(items.slice(0, middle), compare);
  const right = sortRecursive(items.slice(middle), compare);

  return mergeSorted(left, right, compare);
}
