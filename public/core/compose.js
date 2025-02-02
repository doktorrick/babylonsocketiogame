const compose = (...functions) => (initialValue) => {
    return functions.reduceRight((acc, fn) => fn(acc), initialValue);
};

const composeAsync = (...functions) => {
    if (functions.length === 0) {
      throw new Error("At least one function is required for composition.");
    }
  
    functions.forEach((fn, index) => {
      if (typeof fn !== "function") {
        throw new Error(`Argument at index ${index} is not a function`);
      }
    });
  
    return (initialValue) => {
      return functions.reduceRight((acc, fn) => {
        const result = fn(acc);
        if (result instanceof Promise) {
          return result.then(fn);
        }
        return result;
      }, initialValue);
    };
};