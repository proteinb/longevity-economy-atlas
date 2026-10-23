// Illustrative pose only. No manufacturer dimensions, limits or actuator model.
const DEMO_DURATION=9;
function poseAt(t){const p=Math.min(Math.max(t/DEMO_DURATION,0),1);const lift=p<.4?p/.4:p<.6?1:(1-p)/.4;return {back:Math.max(0,lift)*Math.PI*.24,phase:p<.4?'靠背抬起':p<.6?'停留观察':p<1?'回到平放':'演示结束'};}
function advance(t,dt,running){return Math.min(DEMO_DURATION,t+(running?Math.min(Math.max(dt,0),.1):0));}
