const { scrapeFund } = require("./scrapeFund");

async function main() {
  try {
    const result = await scrapeFund();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          success: false,
          error: error.message,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
}

main();