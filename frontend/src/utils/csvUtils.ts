export const exportCSVFile = (csvContent: string, fileName: string) => {
  const name = fileName.includes(".csv") ? fileName : `${fileName}.csv`;
  const pom = document.createElement("a");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  pom.href = url;
  pom.setAttribute("download", name.toLowerCase());
  pom.click();
};
