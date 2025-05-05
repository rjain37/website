const formatDate = (date: string) => {
  // Check if the date is already a valid date string or ISO string
  if (date.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(date)) {
    // Handle ISO format date (YYYY-MM-DD)
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const options = { month: "long", day: "numeric", year: "numeric" } as const;
      return dateObj.toLocaleDateString("en-US", options);
    }
  }
  
  // Handle traditional format (MM-DD-YYYY or MM/DD/YYYY)
  let parsed: number[];
  if (date.search("-") !== -1) {
    parsed = date.split("-").map((s) => parseInt(s));
  } else {
    parsed = date.split("/").map((s) => parseInt(s));
  }
  
  // If first number is > 12, it might be a year (YYYY-MM-DD format)
  if (parsed[0] > 12) {
    const options = { month: "long", day: "numeric", year: "numeric" } as const;
    const dateObj = new Date(parsed[0], parsed[1] - 1, parsed[2]);
    return dateObj.toLocaleDateString("en-US", options);
  }
  
  // Traditional MM-DD-YYYY format
  if (parsed[2] < 1000) {
    parsed[2] += 2000;
  }
  
  const options = { month: "long", day: "numeric", year: "numeric" } as const;
  const formattedDate = new Date(
    parsed[2],
    parsed[0],
    parsed[1]
  ).toLocaleDateString("en-US", options);
  
  return formattedDate;
};

export default formatDate;
