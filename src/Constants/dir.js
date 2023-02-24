const accessLogDir = process.env.access_log_dir || 'accessLogs';
const analyticLogDir = process.env.analytic_log_dir || 'analyticLogs';

module.exports = {
  accessLogDir,
  analyticLogDir
}