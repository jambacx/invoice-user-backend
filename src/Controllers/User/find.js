const mongoose = require('mongoose');
const logger = require('../../lib/logger');
const ssh = require('../../lib/ssh');

// const User = require('../Models/User.model');

const dump1 = [
  {
    _id: "6371b00a16691e30010bbba8",
    result_code: "0100",
    system_auID: "123456789",
    customer_auID: "123456789",
    subscription_status:
      "Subscribing/Unsubscribed/Business Suspension (Cannot be subscribed)",
    contract_email_address: "oyuka_@au.com",
    cancellation_date_time: "YYYYMMDD090XXXXXXXX",
    au_mail_app_date: "YYYY M/D",
    au_mail_cancellation: "YYYY M month D day",
    reason: "Normal cancellation/Cancellation due to simple payment cont",
    re_enrollment: "Yes/No",
    billing_method: "Simple payment/Manual billing",
    manual_billing_enddate: "M month D day",
    customer_kanji_name: "oyuka",
    customer_postal_code: "<Return value from Biscuit>",
    customer_address: "<Return value from Biscuit>",
    customer_birthdate: "YYYY M month D day",
    au_cancellation_date: "YYYY M month D day",
    web_mail_subscription: "Yes/No",
    automatic_forwarding_setting: "Yes/No",
    forwarding_email_address: " yyyy@xxxx.com, zzzzz@wwwww.ne.jp…※",
    smart_pass_contract: "Yes/No",
    ez_number: "nnnnnnnnnnnnnn",
    transmission_virus_check: "Yes/No",
    air_facility: "nnnnn",
  },
];

const dump2 = [
  {
    result_code: "0100",
    system_auID: "dadasdakddi_xxxxxxxxxx…",
    customer_auID: "auId2",
    subscription_status:
      "Subscribing/Unsubscribed/Business Suspension (Cannot be subscribed)",
    contract_email_address: "oyuka_@ezweb.ne.jp",
    cancellation_date_time: "YYYYMMDD090XXXXXXXX",
    au_mail_app_date: "YYYY M/D",
    au_mail_cancellation: "YYYY M month D day",
    reason:
      "Normal cancellation/Cancellation due to simple payment continuous billing error/au ID cancellation/Forced cancellation *There is a re-enrollment flag/Forcible transition from manual billing termination",
    re_enrollment: "Yes/No",
    billing_method: "Simple payment/Manual billing",
    manual_billing_enddate: "M month D day",
    customer_kanji_name: "oyuka 2",
    customer_postal_code: "<Return value from Biscuit>",
    customer_address: "<Return value from Biscuit>",
    customer_birthdate: "YYYY M month D day",
    au_cancellation_date: "YYYY M month D day",
    web_mail_subscription: "Yes/No",
    automatic_forwarding_setting: "Yes/No",
    forwarding_email_address: " yyyy@xxxx.com, zzzzz@wwwww.ne.jp…※",
    smart_pass_contract: "Yes/No",
    ez_number: "nnnnnnnnnnnnnn",
    transmission_virus_check: "Yes/No",
    air_facility: "nnnnn",
    phone: "99912454123",
  },
  {
    result_code: "0100",
    system_auID: "dadasdakddi_xxxxxxxxxx…",
    customer_auID: "auId21",
    subscription_status:
      "Subscribing/Unsubscribed/Business Suspension (Cannot be subscribed)",
    contract_email_address: "oyuka_@ezweb.ne.jp",
    cancellation_date_time: "YYYYMMDD090XXXXXXXX",
    au_mail_app_date: "YYYY M/D",
    au_mail_cancellation: "YYYY M month D day",
    reason:
      "Normal cancellation/Cancellation due to simple payment continuous billing error/au ID cancellation/Forced cancellation *There is a re-enrollment flag/Forcible transition from manual billing termination",
    re_enrollment: "Yes/No",
    billing_method: "Simple payment/Manual billing",
    manual_billing_enddate: "M month D day",
    customer_kanji_name: "oyuka main",
    customer_postal_code: "<Return value from Biscuit>",
    customer_address: "<Return value from Biscuit>",
    customer_birthdate: "YYYY M month D day",
    au_cancellation_date: "YYYY M month D day",
    web_mail_subscription: "Yes/No",
    automatic_forwarding_setting: "Yes/No",
    forwarding_email_address: " yyyy@xxxx.com, zzzzz@wwwww.ne.jp…※",
    smart_pass_contract: "Yes/No",
    ez_number: "nnnnnnnnnnnnnn",
    transmission_virus_check: "Yes/No",
    air_facility: "nnnnn",
    phone: "99912454123",
  },
];

const find = async (req, res, next) => {
  const id = req.query.searchValue;
  const type = req.query.searchType;

  logger.info(`****Search*****: Type: ${type} Value: ${id}`);

  try {
    if (type === 'email') {

      return res.send(dump2);
      // const conn = await ssh.connect();
      // const response = await ssh.execCommand('/opt/aumpsw/kddi/bin/portability_customer_ctrl_wrapper.sh show m portability_test101@au.com | iconv -f sjis -t utf-8');

      // if (response.stderr) {
      //   throw new Error(response.stderr);
      // }

      // return res.send(response);
    }

    throw new Error('Undefined call');
  } catch (error) {
    next(error);
  }
};

module.exports = find;
