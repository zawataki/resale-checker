const puppeteer = require('puppeteer');
const path = require('path');
const log4js = require('log4js');
const fileName = path.basename(__filename);
const log = log4js.getLogger(fileName);

log.level = 'error';

/**
 * Print usage of this script.
 */
function printUsage() {
  const commandLineUsage = require('command-line-usage');
  const basicUsage = `$ node ${fileName} --url EVENT_URL`;
  const sections = [
    {
      header: fileName,
      content: 'Checks resale info for the given event.',
    },
    {
      header: 'Synopsis',
      content: [
        `  ${basicUsage} [options ...]`,
      ],
      raw: true,
    },
    {
      header: 'Options',
      optionList: optionDefinitions.filter((opt) => !opt.required),
    },
    {
      header: 'Examples',
      content: [
        'To check resale info for the given event:',
        '',
        `    ${basicUsage}`,
      ].map((line) => '  ' + line),
      raw: true,
    },
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}

/**
 * Handle misuse of this script and exit from the script.
 * @param {String} errorMessage - error message
 */
function handleMisuseAndExit(errorMessage) {
  log.error(errorMessage);

  printUsage();

  process.exit(1);
}

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  {
    name: 'url',
    type: String,
    required: true,
  },
  {
    name: 'log-level',
    type: String,
    description: 'Log level. Valid values are "fatal", "error", "warn",'
      + ` "info", "debug", and "trace". Default to "`
      + `${log.level.toString().toLowerCase()}".`
      + ' When this option and --debug option are enable,'
      + ' set the value of this option to the log level.',
  },
  {
    name: 'debug',
    type: Boolean,
    description: 'Debug mode. Run a browser in non-headless mode and'
      + ' show debug level messages.',
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.',
  },
];
const options = commandLineArgs(optionDefinitions);

if (options['help']) {
  printUsage();
  process.exit();
}

if (options['debug']) {
  log.level = 'debug';
}

const VALID_LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
if (options['log-level']) {
  if (!VALID_LOG_LEVELS.includes(options['log-level'])) {
    handleMisuseAndExit(`Invalid log level: "${options['log-level']}"`);
  }
  log.level = options['log-level'];
}

const requiredParameterNames = optionDefinitions.filter((opt) => opt.required)
  .map((opt) => opt.name);
for (const requiredParamName of requiredParameterNames) {
  if (!options[requiredParamName]) {
    handleMisuseAndExit(`Required parameter --${requiredParamName} is missing`);
  }
}

const EMAIL_ADDRESS = options.email;
const EVENT_URL = options.url;

(async () => {
  const browser = await puppeteer.launch({
    headless: options['debug'] ? false : 'new',
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(5 * 1000);

    await page.setViewport({width: 375, height: 667});

    log.info('Go to event page');
    await page.goto(EVENT_URL);
    const resaleInfoSelector = 'div.Y15-sales__buttons';
    const resaleInfoElement = await page.waitForSelector(resaleInfoSelector);
    const resaleInfoText = await resaleInfoElement?.evaluate(el => el.textContent);

    if (!resaleInfoText.includes('リセールチケット販売中')) {
      console.log('A resale ticket does not exist.');
      return;
    }

    const resaleTicketLink = await resaleInfoElement.$eval("a", (el) => el.href);
    console.log('A resale ticket exists. See ' + resaleTicketLink);
  } catch (error) {
    log.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
