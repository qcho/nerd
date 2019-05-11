function xorSelected<T>(selected: T[], entry: T) {
  const selectedIndex = selected.indexOf(entry);
  var newSelected: T[] = [];

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selected, entry);
  } else if (selectedIndex === 0) {
    newSelected = newSelected.concat(selected.slice(1));
  } else if (selectedIndex === selected.length - 1) {
    newSelected = newSelected.concat(selected.slice(0, -1));
  } else if (selectedIndex > 0) {
    newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
  }
  return newSelected;
}

export default xorSelected;
