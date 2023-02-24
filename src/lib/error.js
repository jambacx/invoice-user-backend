const errors = {
  1000: 'No specified customer information',
  1101: 'Concurrent connections exceeded',
  1102: 'Designated customer canceled',
  1103: 'Under billing maintenance',
  1104: 'SUR(M/MB) under maintenance',
  1105: 'Under MD management server maintenance',
  1106: 'Under SUR(M/MB)HA',
  1107: 'Biscuit communication not possible',
  9100: 'Billing operation execution result abnormal termination',
  9101: 'Invalid argument※2',
  9102: 'SUR(MB) out of service',
  9103: 'MD management out of service',
  9104: 'ARIAL communication not possible'
};

module.exports = async (errCode) => {
  code = parseInt(errCode);
  if (code === 1000) {
    throw {
      code: 102,
      message: errors[code]
    };
  }
  if (code === 1101) {
    throw {
      code: 104,
      message: errors[code]
    };
  }
  if (code === 1102) {
    throw {
      code: 103,
      message: errors[code]
    };
  }
  if ([1103, 1104, 1105].includes(code)) {
    throw {
      code: 101,
      message: errors[code]
    };
  }
  if (code === 1106) {
    throw {
      code: 105,
      message: errors[code]
    };
  }
  if ([9100, 9101, 9102, 9103, 9104].includes(code)) {
    throw {
      code: 106,
      message: errors[code]
    };
  }
}; 
