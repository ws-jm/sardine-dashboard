const concurrently = require("concurrently");

const getRandomColor = () => {
  const colors = ["red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray"];
  return colors[Math.floor(Math.random() * colors.length - 1) + 1];
};

concurrently(
  [
    {
      command: `cd frontend && npm start`,
      name: "Frontend",
      prefixColor: getRandomColor(),
    },
    {
      command: `cd server && npm run dev`,
      name: "Server",
      prefixColor: getRandomColor(),
    },
  ],
  {
    prefix: "name",
    killOthers: ["failure", "success"],
    restartTries: 3,
  }
).then(() => {
  console.log("services started");
});
