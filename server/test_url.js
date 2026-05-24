const https = require('https');

const url = "https://api.dicebear.com/9.x/avataaars/png?seed=Rohit%20Sharma&backgroundColor=b6e3f4,c0aede,d1d4f9&top=shortHair,shortHairDreads01,shortHairDreads02,shortHairFrizzle,shortHairShaggyMullet,shortHairShortCurly,shortHairShortFlat,shortHairShortRound,shortHairShortWaved,shortHairSides,shortHairTheCaesar,shortHairTheCaesarSidePart&facialHairProbability=20";

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) console.log('Response:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
  process.exit(1);
});
