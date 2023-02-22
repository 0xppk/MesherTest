export default function FixedLengthArray(this: any, length: number) {
  Object.defineProperty(this, "length", {
    value: length,
    writable: false,
    configurable: false,
  });

  this.setValue = (index: number, value: any) => {
    if (index >= this.length) {
      throw new Error("Index out of bounds");
    }
    this[index] = value;
  };

  this.unshiftValue = (value: any) => {
    for (let i = this.length - 1; i > 0; i--) {
      this.setValue(i, this[i - 1]);
    }
    this.setValue(0, value);
  };
}

console.log(FixedLengthArray(5));
