const timeParser = require('time-parser');
// Matches `1 s` , `1s`,`1 w`.. 
const regEx = /^ *([0-9]+) *(s|m|h|d|w) *$/i;
const timeMS = {
  s:1000,
  m:60000,
  h:3600000,
  d:86400000,
  w:604800000
};

const replaceWith = {
  'sec':'second',
  'min':'minute',
  'mins':'minutes',
  'next':'one'
};
const arr = [];
const res = [];
let near = 0;
const now = Date.now();
const year = new Date().getFullYear();

function parseTime(timeInput){
  timeInput = timeInput.toLowerCase();
  const matches = timeInput.match(regEx); //[ '1 S', '1', 'S', index: 0, input: '1 S', groups: undefined ] | null
  if(matches){
    const relTime = Number(matches[1]) * timeMS[matches[2]] ;
    const obj = {
      relative:relTime,
      absolute: relTime + now,
    };
    // eslint-disable-next-line no-unused-vars
    const {relative = 'INVALID' , absolute = 'INVALID'} = obj;
    return absolute;
  }

  const possible = Object.keys(replaceWith);
  possible.map(key => {
    if(timeInput.includes(key)){
      timeInput = timeInput.replace(new RegExp(key,'gi'),replaceWith[key]);
    }
  });
  
  const parsedTime = timeParser(timeInput.trim());

  const { relative,mode ,absolute} = parsedTime ;
  const input = timeInput;

  if(mode === 'error' || Number(timeInput)) return 'INVALID' ;
  if(mode === 'relative' && relative < 0) return 'INVALID FORMAT';

  if(absolute < now){
    const setForPast = check(input,parsedTime);
    if(!setForPast) return absolute;  
    //console.log(`final return `, setForPast);
    return setForPast;
  }
  return absolute;
}
//Improve this even more ? || think of a better way to do the whole thing..
function check(input,parsed){
  arr.push(input);
  if(parsed[`absolute`] > now) return false;
  if(res[0] < now){ // any > undefined -> false
    const futured = parseTime(`${arr[0]} ${year + 1}`);
    return futured; 
  }
  res.push(near);
  near = parseTime(`${arr[0]} ${year}`); 
  if(near > now) return near;
}
module.exports = { parseTime };

/* function testParser(str){
  const parsed = parseTime(str);
  if(typeof parsed === 'number'){
    const d = new Date(parsed);
    return console.log(`Parsed : ${parsed} , Date : ${d},type: ${typeof parsed} , now: ${now}`);
  }
}
testParser('37 aug'); */