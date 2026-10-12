export const expressions = ['neutral','happy','curious','sleepy','sad','surprised','angry','love'];
export const initialState = {expression:'neutral', gazeX:0, gazeY:0, brightness:1, color:'#99f6cf', autoBlink:true, speaking:false};
export function command(state) {return {version:1,type:'face.set',state:{...state}};}
export function validState(s) {
  return !!s && expressions.includes(s.expression) && ['gazeX','gazeY'].every(k=>Number.isFinite(s[k]) && Math.abs(s[k])<=1) && Number.isFinite(s.brightness) && s.brightness>=0.2 && s.brightness<=1 && /^#[0-9a-f]{6}$/i.test(s.color) && typeof s.autoBlink==='boolean' && typeof s.speaking==='boolean';
}
