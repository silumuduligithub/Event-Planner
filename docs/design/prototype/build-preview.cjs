const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {vendors} = require('../../../backend/src/scripts/demoData.js');
const base = __dirname;
const outputPath = path.resolve(process.argv[2] || path.join(os.tmpdir(), 'evently-premium-preview', 'evently-premium.html'));
const photoNames = ['floral', 'garden', 'celebration'];
const photos = Object.fromEntries(photoNames.map(name => [name, `data:image/jpeg;base64,${fs.readFileSync(path.join(base, 'assets', name + '.jpg')).toString('base64')}`]));
const photoMap = {'wedding-hero':'garden',reception:'floral',celebration:'celebration'};
const catalog = vendors.map((v,id)=>({
  id, businessName:v.businessName, vendorType:v.vendorType, description:v.description,
  city:v.address.city, startingPrice:v.startingPrice,
  startingUnit:v.services.find(s=>s.price===v.startingPrice)?.pricingType||'fixed',
  photos:v.portfolioImages.map(p=>photoMap[path.basename(p,'.png')]||'floral'),
  occasions:v.supportedOccasionKeys, services:v.services, artists:v.artistsOrCelebrities||[],
}));
const template=fs.readFileSync(path.join(base,'evently-premium.template.html'),'utf8');
const output=template.replace('__EP_PHOTOS__',JSON.stringify(photos)).replace('__EP_VENDORS__',JSON.stringify(catalog))
  .replace('__EP_SERVICE_DETAILS__',fs.readFileSync(path.join(base,'service-details.js'),'utf8'))
  .replace('__EP_INITIAL_VIEW__',process.argv.includes('--vendor-services')
    ? "Object.assign(state,{screen:'build',occasion:'Birthday',mode:'event',history:['home','results','detail']});"
    : '');
if(Buffer.byteLength(output)>=1000000)throw new Error('Preview exceeds 1 MB limit');
fs.mkdirSync(path.dirname(outputPath), {recursive:true});
fs.writeFileSync(outputPath,output);
console.log(JSON.stringify({outputPath,bytes:Buffer.byteLength(output),vendors:catalog.length,images:photoNames.length}));
