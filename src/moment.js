

import moment from "moment";

const momentUtils = {
  getCurrentTimeForTimeField: () => {
    return new Date().getTime();
  },
  getCurrentTimeForTodayField: () => {
    return moment().format("YYYY-MM-DD h:mm:ss A");
  },
  getDMYDateOfTodayFiled: (today) => {
    return moment(today, "YYYY-MM-DD h:mm:ss A").format("DD-MM-YYYY");
  }
};

console.log("momentUtils", momentUtils.getCurrentTimeForTimeField(), momentUtils.getCurrentTimeForTodayField(), momentUtils.getDMYDateOfTodayFiled(momentUtils.getCurrentTimeForTodayField()));

export default momentUtils;
  
