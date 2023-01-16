const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const connect = async () => {
  return await ssh
    .connect({
      // host: '172.30.199.193',
      // host: '172.30.199.209',
      port: 22,
      username: 'aumpsw',
      password: 'CsJh4Ki',
      readyTimeout: 60000
    });
};

const execCommand = async (command) => {
  return await ssh
    .execCommand(command, {
      // sh: '/opt/aumpsw/kddi/bin/portability_customer_ctrl_wrapper.sh'
    });
};

module.exports = {
  connect,
  execCommand
};