const url = 'https://fonts.googleapis.com/css?family=Montserrat:400,700,800,400i,700i|Source+Sans+Pro:400,700,400i,700i';

async function run() {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)'
    }
  });
  const text = await res.text();
  console.log(text);
}

run();
