export const yesterdayTime = () => {
  const currentDate = new Date();
  const startOfYesterday = new Date(currentDate);
  startOfYesterday.setDate(currentDate.getDate() - 1);
  startOfYesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(currentDate);
  endOfYesterday.setDate(currentDate.getDate() - 1);
  endOfYesterday.setHours(23, 59, 59, 999);

  return {
    startOfYesterdayTimestamp: startOfYesterday.getTime(),
    endOfYesterdayTimestamp: endOfYesterday.getTime(),
  };
};

const ts = yesterdayTime();
console.log(ts);
console.log('start:', new Date(ts.startOfYesterdayTimestamp).toISOString());
console.log('end:', new Date(ts.endOfYesterdayTimestamp).toISOString());
console.log('now:', new Date().getTime());
