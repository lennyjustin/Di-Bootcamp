for (let row = 1; row <= 6; row++) {
  let line = "";

  for (let star = 1; star <= row; star++) {
    line += "* ";
  }

  console.log(line);
}