const ssh = require('../lib/ssh');
const Log = require('../Models/AccessLog.model');
const parser = require('../lib/parser');

const find = async (req, res, next) => {
  try {
    const type = req.query.type;
    const value = req.query.value;
    const action = "show";

    // const json = { "処理結果˝コード": "0100", "システムauID": "kddi_ue6b4urgt1f54ghgqttn77w792u", "お客様au ID": "08093275731", "加入状態": "退会済み1", "契約メールアドレス": "portability_test101@au.com", "解約時点の電話番号": "08093275731", "auメール持ち運び申込日": "2022年11月16日", "auメール持ち運び解約日": "2022年11月15日", "auメール持ち運び解約理由": "通常解約", "再加入不可フラグ有無": "なし", "課金方式": "かんたん決済", "手動課金終了日": "NULL", "顧客漢字氏名": "社内ＫＤＤＩサービス開発１部", "顧客郵便番号": "1028460", "顧客住所": "東京都千代田区飯田橋３−１０−１０ガーデンエアータワー２６Ｆ", "顧客生年月日": "1998年01月01日", "au解約日": "2022年04月14日", "Webメール加入有無": "あり", "自動転送設定有無": "あり", "転送先メールアドレス": "test1@xx.ezweb.ne.jp,test2 @xx.ezweb.ne.jp", "スマートパス契約": "なし", "EZ番号": "05007013745195", "送信ウィルスチェック加入": "なし", "AIR設備収容識別子": "25015" };
    // const json = await parser("処理結果コード：0101\nメールアドレス：auMPSW-002stub1@au.com\nメールアドレス：auMPSW-002stub2@au.com");
    // return res.send(json);

    await Log.create({
      operatorId: req.operatorId,
      auId: req.auId,
      commandType: action,
      commandDetail: value
    });

    await ssh.connect();

    const response = await ssh.execCommand({
      action,
      type,
      value,
      req
    });

    return res.send(response);

  } catch (error) {
    next(error);
  }
};

const execute = async (req, res, next) => {
  try {
    const action = req.query.action;
    const type = req.query.type;
    const value = req.query.value;

    await Log.create({
      operatorId: req.operatorId,
      auId: req.auId,
      commandType: action,
      commandDetail: value
    });

    await ssh.connect();

    const response = await ssh.execCommand({
      action,
      type,
      value,
      req
    });
    return res.send(response);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  find,
  execute
};
