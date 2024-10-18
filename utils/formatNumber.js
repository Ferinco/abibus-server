const { replace } = require("lodash");
const numeral = require("numeral");

// ----------------------------------------------------------------------

export const fCurrency = (number) => {
  const formatted = numeral(number).format(
    Number.isInteger(number) ? `0,0` : `0,0.00`
  );
  return `NGN ${formatted}`;
};

export const fPercent = (number) => {
  return numeral(number / 100).format("0.0%");
};

export const fNumber = (number) => {
  return numeral(number).format();
};

export const fShortenNumber = (number) => {
  return replace(numeral(number).format("0.00a"), ".00", "");
};

export const fData = (number) => {
  return numeral(number).format("0.0 b");
};
