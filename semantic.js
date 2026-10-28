export const palette={water:'#6baed2',heat:'#e5a064',alarm:'#df6965',electric:'#b2c665',body:'#c5a0ca',mechanical:'#91a7b8'};
export const meanings={water:'水路／普通清洗',heat:'加热／热水',alarm:'报警／危险提示',electric:'电源／电路／信号',body:'人体／人体交互',mechanical:'机械／支撑／外壳'};
const partRoles={
 'care-bed':{body:['mBack','mSeat','mThigh','mLeg','torso','head','pelvis','thighs','shins'],electric:['pendant','cbox','cboxIn','cablePend','cableBack','cableKnee','liftHM','liftFM','backActM','kneeActM']},
 'smart-toilet':{water:['water','trap','valve','sol','pump','nozzle'],heat:['heater','fan','outlet'],electric:['pcb','panel'],body:['seat','sensor']},
 'smoke-alarm':{electric:['pcb','mcu','battery','ledIR','pd','button','ledY'],alarm:['ledR','wave0','wave1','wave2']},
 'accessible-shower':{water:['pipeC','head','hoseL','hoseU','drain','trap'],heat:['pipeH','cart','valve'],body:['circle','seat','chair'],alarm:['call','cord','handle','lamp']}
};
const stepRoles={'care-bed':['mechanical','mechanical','mechanical','mechanical','mechanical','mechanical','mechanical'],'smart-toilet':['heat','body','heat','heat','heat','water'],'smoke-alarm':['electric','mechanical','electric','electric','alarm','electric'],'accessible-shower':['body','body','body','heat','water','alarm']};
const flowRoles={'care-bed':{},'smart-toilet':{self:'water',wash:'heat',air:'heat',flush:'water'},'smoke-alarm':{rise:'mechanical',enter:'mechanical',ir:'electric',scatter:'electric',signal:'electric',beep:'alarm'},'accessible-shower':{hot:'heat',cold:'water',mix:'heat',spray:'heat',drain:'water'}};
export function prepareScene(scene,id){
 const roles=partRoles[id];scene.parts.forEach(p=>{const role=Object.keys(roles).find(k=>roles[k].includes(p.id))||'mechanical';p.color=palette[role];p.note=`${meanings[role]}。${p.note||p.name||p.label||'概念部件'}（教学示意，非实物认证。）`;});
 (scene.steps||[]).forEach((s,i)=>s.color=palette[stepRoles[id][i]||'mechanical']);
 (scene.flows||[]).forEach(f=>f.color=palette[flowRoles[id][f.id]||(id==='care-bed'?'electric':'water')]);
 scene.autoplay=false;scene.sway=false;scene.fig='图 '+(['care-bed','smart-toilet','smoke-alarm','accessible-shower'].indexOf(id)+1);
 return scene;
}
