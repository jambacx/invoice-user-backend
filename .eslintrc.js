module.exports = {
  'root': true,
  'env': {
    'es2021': true,
    'node': true
  },
  'plugins': [],
  'extends': [
    'eslint:recommended'
  ],
  'rules': {
    'semi': [
      'error',
      'always'
    ],
    'quotes': [
      'error',
      // 'single',
      {
        'avoidEscape': true,
        'allowTemplateLiterals': true
      }
    ],
    'curly': 'error',
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1
      }
    ],
    'comma-spacing': [
      'error',
      {
        'before': false,
        'after': true
      }
    ],
    'comma-dangle': [
      'error',
      'only-multiline'
    ],
    'comma-style': [
      'error',
      'last'
    ],
    'block-spacing': 'error',
    'brace-style': 'error',
    'max-len': [
      'error',
      {
        'code': 150
      }
    ],
    'array-bracket-spacing': [
      'error',
      'never'
    ],
    'array-bracket-newline': [
      'error',
      'consistent'
    ],
    'arrow-spacing': [
      'error',
      {
        'before': true,
        'after': true
      }
    ],
    'function-call-argument-newline': [
      'error',
      'consistent'
    ],
    'key-spacing': [
      'error',
      {
        'mode': 'strict'
      }
    ],
    'eol-last': 0
  },
  'ignorePatterns': [
    'node_modules',
    'build',
    'dist'
  ],
  'globals': {
    'test': true,
    'expect': true,
    'Promise': true
  }
};