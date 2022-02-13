import moment from "moment";

export const getRandomColor = () => `rgb(
    ${Math.floor(Math.random() * 255)}, 
    ${Math.floor(Math.random() * 255)}, 
    ${Math.floor(Math.random() * 255)}, 
    0.85)`;

export const timeDifferenceFromNow = (timestamp: number) => {
  let difference = moment.now() - timestamp;

  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  difference -= daysDifference * 1000 * 60 * 60 * 24;

  const hoursDifference = Math.floor(difference / 1000 / 60 / 60);
  difference -= hoursDifference * 1000 * 60 * 60;

  const minutesDifference = Math.floor(difference / 1000 / 60);
  difference -= minutesDifference * 1000 * 60;

  const secondsDifference = Math.floor(difference / 1000);

  if (daysDifference > 0) {
    return `${daysDifference} days ago`;
  }
  if (hoursDifference > 0) {
    return `${hoursDifference} hours ago`;
  }
  if (minutesDifference > 0) {
    return `${minutesDifference} mins ago`;
  }
  if (secondsDifference > 0) {
    return `${secondsDifference} seconds ago`;
  }
  return "just now";
};

export const isUrlValid = function (text: string) {
  // eslint-disable-next-line
  const res = text.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if (res == null) return false;
  return true;
};

export const isEmailValid = function (email: string) {
  // eslint-disable-next-line
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
