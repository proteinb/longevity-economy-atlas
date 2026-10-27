// Illustrative pose only. No manufacturer dimensions, limits or actuator model.
const DEMO_DURATION=9;
function poseAt(t){const p=Math.min(Math.max(t/DEMO_DURATION,0),1);const lift=p<.4?p/.4:p<.6?1:(1-p)/.4;return {back:Math.max(0,lift)*Math.PI*.24,phase:p<.4?'靠背抬起':p<.6?'停留观察':p<1?'回到平放':'演示结束'};}
function advance(t,dt,running){return Math.min(DEMO_DURATION,t+(running?Math.min(Math.max(dt,0),.1):0));}
// Always derive from the saved assembly pose; never accumulate translations.
const EXPLODE_VECTORS={home:[0,0,0],back:[-.6,1,0],surface:[0,1.45,0],remote:[0,.6,1.5],head:[-1.25,0,0],foot:[1.25,0,0],rail:[0,.4,1.3],wheels:[0,-.12,-1.1],pillow:[-.5,2,0],leg:[1,1.2,0]};
function explodedPosition(base,vector,amount){const e=Math.max(0,Math.min(1,Number(amount)||0));return base.map((n,i)=>n+vector[i]*e);}
