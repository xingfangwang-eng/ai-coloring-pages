const BANNED = ['red','blue','green','yellow','pink','purple','orange','black','white','golden','brown','gray','grey','silver','violet','teal','indigo','multicolored','colorful','rainbow','pastel','sly','friendly','happy','spooky','playful','clever','mighty','gentle','cute','adorable','tiny','big','great','tall','majestic','fierce','sweet','silly','sleepy','fluffy','soft','warm','cool','fast','slow','busy','charming','powerful','graceful','mischievous','fun','funny','cuddly','chubby','squishy','sparkly','shiny','bright','dark','light','pale','deep','vivid','autumn','winter','spring','summer','jungle','woods','meadow','tundra','desert','dune','bamboo','eucalyptus','waves','bubbles','bats','haunted','mansion','barn','farm','cushion','honey','pot','basket','carrot','banana','bananas','nuts','with','nearby','around','background','setting','scene','landscape','surrounded','surrounding','near','above','below','beside','stripes','spots','pattern','details','detailed','fur','feathers','whiskers','tail','ears','trunk','mane','beak','teeth','claws','wings','shell','fin','flippers','striped','spotted','patterned','decorated','sitting','standing','jumping','swimming','flying','walking','running','eating','holding','wearing','wagging','curled','clinging','roaring','sleeping','smiling','playing','chasing','fighting','dancing','stretching','perched','nestling','grazing','galloping','trotting'];
const re = new RegExp('\\b(' + BANNED.join('|') + ')\\b','gi');
function sanitize(input){
  let s = input
    .replace(/for-(kids|toddlers|preschoolers|adults)/gi,'')
    .replace(/(cute|simple|detailed|easy|kawaii|intricate)-/gi,'')
    .replace(/\b(a|an|the|with|on|in|at|by|and|or|near|around|over|under|through)\b/gi,' ')
    .replace(/-/g,' ')
    .replace(/[,.;!?'"()]/g,' ')
    .trim();
  s = s.replace(re,'').replace(/\s+/g,' ').trim();
  const words = s.split(/\s+/).filter(w=>w.length>0).slice(-2);
  return words.join(' ') || 'animal';
}
const MAGIC = 'coloring book page of a {{SUBJECT}}, blank uncolored coloring sheet, black line art outline, isolated on stark pure white paper, no color, no fill, zero shading, no background scenery';
const subjects = [
  'a clever red fox with bushy tail in autumn woods',
  'sea turtle with detailed patterned shell',
  'cute-superhero-for-adults',
  'intricate-mandala-for-adults',
  'cute-fox-for-kids',
  'fox',
  'dinosaur',
  'tiger',
  'a majestic lion with a full mane sitting proudly on a rock',
  'a colorful butterfly with detailed wing patterns on a flower',
  'a spooky jack-o-lantern pumpkin with mischievous grin, bats and haunted trees',
];
for (const subj of subjects) {
  const clean = sanitize(subj);
  const final = MAGIC.replace(/{{SUBJECT}}/g, clean);
  const encoded = encodeURIComponent(final);
  const seed = 123456 + 777777;
  const url = 'https://image.pollinations.ai/prompt/' + encoded + '?width=1024&height=1024&model=flux&nologo=true&seed=' + seed;
  console.log('IN:   ', subj);
  console.log('CLEAN:', clean);
  console.log('URL:  ', url.substring(0, 140) + '...');
  console.log();
}
